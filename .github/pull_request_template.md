# Summary

<!-- What does this change and why? -->

## Checklist

- [ ] `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` all pass
- [ ] **No personal data or secrets** added (code, content, history, or image EXIF) — only the demo persona
- [ ] **Demo mode still works** — zero-env renders + forms return neutral success without crashing
- [ ] If this collects/stores/sends new user data: **`content/legal/privacy.mdx` updated** (version + lastUpdated)
- [ ] Inputs validated (Zod); UGC rendered as escaped plain text; secrets stay server-only
- [ ] Accessibility kept (focus-visible, aria, AA contrast in both themes; reduced-motion fallback)
- [ ] Touched the DB layer? Ran `npm run test:db` against a local Postgres
