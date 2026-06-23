// Remove the seeded demo content so a fork starts from a clean, empty site.
// The site degrades gracefully to empty states. Legal templates are KEPT — edit the
// [placeholders] in content/legal/*, don't delete them.
//
// Usage: npm run clean:examples
import { readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

const DEMO_DIRS = ['content/projects', 'content/experience', 'content/guides']

let removed = 0
for (const dir of DEMO_DIRS) {
  const entries = await readdir(dir).catch(() => [])
  for (const f of entries) {
    if (f.endsWith('.mdx') || f.endsWith('.md')) {
      await rm(join(dir, f))
      removed++
    }
  }
  console.log(`cleaned ${dir}`)
}

console.log(`\nDone — removed ${removed} demo file(s).`)
console.log('Kept content/legal/* — edit the [placeholders] there before launch.')
console.log('Add your own work to content/projects, content/experience, content/guides.')
