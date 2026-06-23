# Contributing

Thanks for helping improve the template! This is an open-source starter, so the bar is: keep it
**forkable, demo-safe, and free of personal data/secrets**.

## Setup

```bash
npm install
npm run dev          # full site in demo mode, zero secrets
```

## Before you open a PR — the gate

All of these must pass (CI runs them too):

```bash
npm run lint
npm run typecheck
npm run test
npm run build        # runs Velite then the production build
```

If you touch the database layer, also run the Postgres integration tests against a local DB:

```bash
npm run test:db      # see scripts/db-test.mjs for the connection string
```

## Ground rules

- **No personal data or secrets, ever.** Only the demo persona ("Mara Caldwell" / `caldwell.dev`)
  may appear in content/config. Real names, emails, phone numbers, machine paths (`/Users/<name>/…`),
  or API keys must never be committed — in code, content, history, or image EXIF. `.env*` stays
  gitignored; `.env.example` carries key **names** only.
- **Demo mode must keep working.** With zero env, every route renders and every form returns a
  neutral success without crashing. Don't introduce a hard dependency on a secret in a render path.
- **Data-collecting changes update the policy.** If a change collects, stores, or sends a new piece
  of user data, update `content/legal/privacy.mdx` (bump its `version`/`lastUpdated`) in the same PR.
- **Security posture is load-bearing.** Validate inputs with Zod, render UGC as escaped plain text,
  keep secrets server-only, keep capture responses neutral + timing-uniform. See `SECURITY.md`.
- **Match the surrounding code.** Server Components by default; `'use client'` only for interactivity;
  `await params`/`searchParams`; read from `config/site.ts` rather than hardcoding.

## Commits & PRs

- Keep PRs focused; describe what and why. Fill in the PR checklist.
- Reference the issue you're addressing where applicable.

By contributing, you agree your contributions are licensed under the project's [MIT License](LICENSE).
