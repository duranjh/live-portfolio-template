// Integration test for the verify-once state machine against a live Postgres.
// Run after applying migrations 0001–0004. Usage: node scripts/db-test.mjs
import pg from 'pg'
import { createHash, randomBytes } from 'node:crypto'

const URL = process.env.DB_TEST_URL ?? 'postgresql://postgres:postgres@localhost:54329/app'
const pool = new pg.Pool({ connectionString: URL, max: 6 })

let passed = 0
let failed = 0
function ok(cond, msg) {
  if (cond) { passed++; console.log('  ✓', msg) }
  else { failed++; console.error('  ✗', msg) }
}
const sha = (t) => createHash('sha256').update(t).digest('hex')
const tok = () => randomBytes(32).toString('base64url')
const eh = (email) => sha('email:' + email)

async function subscribe(email, { slug = null, name = '' } = {}) {
  const confirmRaw = tok()
  const unsubRaw = tok()
  const { rows } = await pool.query(
    'select * from rpc_subscribe($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
    [email, eh(email), 'test', sha(confirmRaw), sha(unsubRaw), 'v1', '/t', 'iphash', 'US', slug, name],
  )
  return { ...rows[0], confirmRaw, unsubRaw }
}

async function main() {
  console.log('\n== verify-once state machine ==')

  // 1. fresh subscribe
  const a = await subscribe('a@example.com', { name: 'Alice Test' })
  ok(a.state === 'pending' && a.confirm_needed === true, 'new subscribe → pending + send')
  let n = (await pool.query("select count(*)::int c from subscribers where email='a@example.com'")).rows[0].c
  ok(n === 1, 'one subscriber row created')
  const nm = (await pool.query("select name from subscribers where email='a@example.com'")).rows[0].name
  ok(nm === 'Alice Test', 'name stored on subscribe')

  // 2. immediate duplicate → idempotent, cooldown blocks resend
  const a2 = await subscribe('a@example.com')
  ok(a2.state === 'pending' && a2.confirm_needed === false, 'duplicate subscribe → no duplicate send (cooldown)')
  n = (await pool.query("select count(*)::int c from subscribers where email='a@example.com'")).rows[0].c
  ok(n === 1, 'still exactly one row (no duplicate)')

  // 3. concurrency: two parallel subscribes for a fresh email
  const [c1, c2] = await Promise.all([subscribe('race@example.com'), subscribe('race@example.com')])
  const sends = [c1, c2].filter((r) => r.confirm_needed).length
  n = (await pool.query("select count(*)::int c from subscribers where email='race@example.com'")).rows[0].c
  ok(n === 1, 'concurrent subscribe → exactly one row')
  ok(sends === 1, 'concurrent subscribe → exactly one confirmation send')

  // 4. confirm
  const conf = await pool.query('select * from rpc_confirm($1)', [sha(a.confirmRaw)])
  ok(conf.rows[0].state === 'confirmed', 'confirm with valid token → confirmed')
  const st = (await pool.query("select status from subscribers where email='a@example.com'")).rows[0].status
  ok(st === 'confirmed', 'subscriber status now confirmed')

  // 5. replay confirm → single-use
  const replay = await pool.query('select * from rpc_confirm($1)', [sha(a.confirmRaw)])
  ok(replay.rows[0].state === 'invalid', 'confirm replay → invalid (single-use)')

  // 6. confirmed follows an app → no email, interest active
  const f = await subscribe('a@example.com', { slug: 'app-x' })
  ok(f.state === 'confirmed' && f.confirm_needed === false, 'confirmed follow → reuse, no email')
  const active = (await pool.query(
    "select active from interests i join subscribers s on s.id=i.subscriber_id where s.email='a@example.com' and i.project_slug='app-x'",
  )).rows[0].active
  ok(active === true, 'follow by confirmed → interest active immediately')

  // 7. pending follow is inert until confirm
  const g = await subscribe('b@example.com', { slug: 'app-y' })
  ok(g.confirm_needed === true, 'new follow → pending + send')
  let inert = (await pool.query(
    "select active from interests i join subscribers s on s.id=i.subscriber_id where s.email='b@example.com'",
  )).rows[0].active
  ok(inert === false, 'pending follow → interest inert')
  await pool.query('select * from rpc_confirm($1)', [sha(g.confirmRaw)])
  inert = (await pool.query(
    "select active from interests i join subscribers s on s.id=i.subscriber_id where s.email='b@example.com'",
  )).rows[0].active
  ok(inert === true, 'confirm activates the queued follow')

  // 8. unsubscribe (global) → interests off
  const u = await pool.query('select * from rpc_unsubscribe($1)', [sha(a.unsubRaw)])
  ok(u.rows[0].state === 'unsubscribed', 'unsubscribe → unsubscribed')
  const stillActive = (await pool.query(
    "select count(*)::int c from interests i join subscribers s on s.id=i.subscriber_id where s.email='a@example.com' and i.active",
  )).rows[0].c
  ok(stillActive === 0, 'unsubscribe deactivates all interests')

  // 9. re-subscribe after unsubscribe → fresh opt-in
  const re = await subscribe('a@example.com')
  ok(re.state === 'pending' && re.confirm_needed === true, 're-subscribe after unsubscribe → fresh double opt-in')

  // 10. suppression blocks
  await pool.query('select rpc_suppress($1,$2)', [eh('spam@example.com'), 'complaint'])
  const blocked = await subscribe('spam@example.com')
  ok(blocked.state === 'noop' && blocked.confirm_needed === false, 'suppressed email → neutral no-op (no resurrection)')
  n = (await pool.query("select count(*)::int c from subscribers where email='spam@example.com'")).rows[0].c
  ok(n === 0, 'suppressed email never inserted')

  // 11. submit idea (confirmed)
  const idea = await pool.query(
    'select * from rpc_submit_idea($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
    ['b@example.com', eh('b@example.com'), 'idea', sha(tok()), sha(tok()), 'v1', '/i', 'iphash', 'US', 'Cool idea', 'Build a thing', true],
  )
  const ideaId = idea.rows[0].idea_id
  ok(idea.rows[0].state === 'submitted' && ideaId, 'confirmed submit idea → stored')
  const mod = (await pool.query('select moderation_status from ideas where id=$1', [ideaId])).rows[0].moderation_status
  ok(mod === 'pending', 'idea starts pending moderation (pre-moderation)')

  // 12. votes (frictionless, one-per-fingerprint, atomic count)
  await pool.query('select rpc_vote($1,$2)', [ideaId, 'fp1'])
  await pool.query('select rpc_vote($1,$2)', [ideaId, 'fp1'])
  await pool.query('select rpc_vote($1,$2)', [ideaId, 'fp2'])
  const vc = (await pool.query('select vote_count from ideas where id=$1', [ideaId])).rows[0].vote_count
  ok(vc === 2, 'two distinct fingerprints → vote_count 2 (dup ignored, count atomic)')

  // 13. GDPR erasure (anonymize + retain suppression)
  await pool.query('select * from rpc_erase_subscriber($1)', [eh('b@example.com')])
  const er = (await pool.query("select status, email from subscribers where email_hash is null and status='erased' limit 1")).rows[0]
  ok(er && er.email.includes('erased'), 'erase → status erased + email tombstoned')
  const supp = (await pool.query('select count(*)::int c from suppression where email_hash=$1', [eh('b@example.com')])).rows[0].c
  ok(supp === 1, 'erase retains suppression hash (never re-mailed)')
  const authorErased = (await pool.query('select author_erased from ideas where id=$1', [ideaId])).rows[0].author_erased
  ok(authorErased === true, 'erase anonymizes idea authorship but keeps the idea')

  // 14. RLS: anon can read nothing
  console.log('\n== RLS ==')
  const client = await pool.connect()
  try {
    await client.query('set role anon')
    let denied = false
    try { await client.query('select count(*) from subscribers') } catch { denied = true }
    ok(denied, 'anon SELECT on subscribers → denied (FORCE RLS + no grant)')
  } finally {
    await client.query('reset role').catch(() => {})
    client.release()
  }

  console.log(`\n${failed === 0 ? '✅ ALL PASS' : '❌ FAILURES'} — ${passed} passed, ${failed} failed\n`)
  await pool.end()
  process.exit(failed === 0 ? 0 : 1)
}

main().catch(async (e) => {
  console.error('test crashed:', e)
  await pool.end().catch(() => {})
  process.exit(1)
})
