// Integration test for the guide-unlock state machine (rpc_unlock_guide).
// Proves: 1 free guide while pending · same guide re-grants · a 2nd guide is blocked
// until confirmation · a confirmed email unlocks all guides ('*').
// Requires the local Postgres (Docker `lpt-pg`) with migrations 0001–0006 applied.
//   node scripts/db-test-unlock.mjs
import pg from 'pg'

const URL = process.env.DB_TEST_URL ?? 'postgresql://postgres:postgres@localhost:54329/app'
const pool = new pg.Pool({ connectionString: URL, max: 4 })

let pass = 0
let fail = 0
function check(name, cond) {
  if (cond) {
    pass++
    console.log('  ✓', name)
  } else {
    fail++
    console.error('  ✗', name)
  }
}

const EMAIL = 'unlocktest@example.com'
const CONFIRM_HASH = 'unlocktest-confirm-hash'
const UNSUB_HASH = 'unlocktest-unsub-hash'

async function unlock(slug) {
  const { rows } = await pool.query(
    'select * from rpc_unlock_guide($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
    [EMAIL, 'eh-' + EMAIL, 'guide:' + slug, CONFIRM_HASH, UNSUB_HASH, 'v1', null, null, null, slug, 'Test User'],
  )
  return rows[0]
}

async function main() {
  await pool.query('delete from subscribers where email = $1', [EMAIL])

  const a1 = await unlock('guide-a')
  check('new email unlocks guide A (pending, scope=guide-a)', a1.unlocked === true && a1.scope === 'guide-a' && a1.state === 'pending')

  const a2 = await unlock('guide-a')
  check('returning to the same free guide re-grants', a2.unlocked === true && a2.scope === 'guide-a')

  const b1 = await unlock('guide-b')
  check('a 2nd guide while pending is blocked (needs_confirm)', b1.unlocked === false && b1.state === 'needs_confirm')

  await pool.query('select * from rpc_confirm($1)', [CONFIRM_HASH])

  const b2 = await unlock('guide-b')
  check('after confirm, all guides unlock (scope=*)', b2.unlocked === true && b2.scope === '*' && b2.state === 'confirmed')

  const { rows: cnt } = await pool.query(
    'select count(*)::int as n from guide_unlocks gu join subscribers s on s.id = gu.subscriber_id where s.email = $1',
    [EMAIL],
  )
  check('guide_unlocks rows recorded (a + b)', cnt[0].n === 2)

  await pool.query('delete from subscribers where email = $1', [EMAIL])

  console.log(`\n  ${pass} passed, ${fail} failed`)
  await pool.end()
  process.exit(fail ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
