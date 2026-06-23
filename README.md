# Live Portfolio — personal-brand template

An open-source **live portfolio + live resume + audience-capture** site for people who build in
public and ship regularly. Show what you're building and what you've shipped, keep a resume that
updates itself from your work, and grow an email audience — newsletter, per-app "follow", a public
idea board, and gated lead-magnet guides.

Built with **Next.js (App Router) · React · TypeScript · Tailwind v4 · Velite (MDX)**. Domain-agnostic:
the showcased entity is editable inline ("Apps" → "Projects" / "Experiences" / "Work"), so it fits
coders and non-coders alike.

> **Runs with zero secrets.** `git clone && npm install && npm run dev` gives you the full site in
> **demo mode** — every form validates and shows success, but nothing is stored or sent. Add a few
> env keys to turn on real capture. Nothing personal ships in this repo: it's all placeholder/demo
> content (the demo persona, "Mara Caldwell").

## Quick start

```bash
git clone https://github.com/your-username/live-portfolio-template.git
cd live-portfolio-template
npm install
npm run dev            # http://localhost:3000 — full site, demo mode, no secrets needed
```

## Make it yours (fork in 5)

Everything personal lives in **two surfaces** — you rarely touch components:

1. **`config/site.ts`** — your name, tagline, bio, social links, nav labels, the entity label
   (Apps/Projects/Work), accent color + default theme, and section on/off toggles.
2. **`content/**/*.mdx`** — your work. Drop a file in:
   - `content/projects/` — a project / app (frontmatter: status, dates, tech, links, gallery, updates…)
   - `content/experience/` — a job/role for the resume's Business + General views
   - `content/guides/` — a gated lead-magnet guide
   - `content/legal/` — privacy + terms (edit the `[placeholders]`)
3. **Start clean:** `npm run clean:examples` removes the seeded demo projects/guides/experience so you
   begin from an empty site (the legal templates are kept — edit, don't delete).
4. **Brand:** tweak the accent + tokens in `app/globals.css`; drop a favicon/icons in.
5. **Deploy** (below). Add env keys when you want real capture.

## Turn on capture (optional)

Capture (newsletter, follow, idea board, guide gating, broadcast) is **all-or-nothing**: with no
secrets you stay in demo mode; set the **full** set and it activates (partial config fails loudly so
you never half-run). Copy `.env.example` → `.env.local` and fill it in. You'll need:

- **Supabase** (Postgres) — list + idea board. Apply `supabase/migrations/0001…0007` in order.
- **Resend** — double-opt-in + broadcast email (+ a webhook for bounces/complaints).
- **Cloudflare Turnstile** — bot defense on public writes (verified server-side).
- **`IP_HMAC_KEY`** — a random secret; IPs/emails are stored only as keyed HMACs, never raw.

See [SECURITY.md](SECURITY.md) for the security model and [RETENTION.md](RETENTION.md) for data
retention defaults.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/live-portfolio-template)

Vercel (Node runtime) is the primary target; Netlify works too. Put Cloudflare in front for the WAF
rate-limit rule + Bot Fight Mode + Turnstile, and Cloudflare Access on `/admin` if you use it. Supabase
free tier pauses after ~1 week idle — a tiny scheduled keep-alive ping keeps it warm.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Velite + Next dev server |
| `npm run build` | Velite + production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run test:db` | Integration tests vs a local Postgres (see `scripts/db-test.mjs`) |
| `npm run clean:examples` | Remove seeded demo content |

## Project shape

- `app/` — routes (Home, `/projects`, `/resume`, `/ideas`, `/guides`, legal + system pages, capture API)
- `components/` — UI, layout, capture, and per-section components
- `content/` — your MDX (projects / experience / guides / legal)
- `config/site.ts` — the central, typed config
- `lib/` — env, db (Supabase RPC wrappers), email, security utilities, content selectors
- `supabase/migrations/` — schema, FORCE-RLS, and the verify-once RPC state machine

## Contributing & conduct

PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE). Built with original code; no personal data or secrets ship in this repo.
