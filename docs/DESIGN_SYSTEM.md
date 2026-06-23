# Design System — Locked

The owner-approved visual foundation. Pixel-exact reference: `docs/design/Live Portfolio - Foundations.dc.html`
(gitignored working artifact). This file is the token spec the build (and the §B–§H design prompts) follow.

**Direction:** sleek, minimal, modern with **refined depth / frosted glass**; cool/neutral, inviting,
**immersive** motion. Light + dark, both first-class.

## Typography
- **Geist** — everything (UI, headings, body).
- **Geist Mono** — code / small metadata only.
- No serif, no Space Grotesk (rejected).
- Scale (px): 11·12·13·14·15·16·17·18·19 body/UI range; **30+** for display/headings (hero via `clamp()`).
  Weights 400/500/600/700; generous line-height; warmth comes from weight/scale/tracking, not a display face.

## Color — Indigo on graphite (the chosen brand)

**Accent (indigo):**
- `--accent: #5B53D6` (primary)
- `--accent-hover / dark-mode accent: #8C86F2` (lighter)
- `--accent-deep: #0C0A22` (deep indigo, gradient stops / tinted backdrops)
- `--accent-soft: rgba(91,83,214,.10)` (tint / focus ring fill)

**Dark theme (graphite ink — NOT pure black):**
- bg: `#151518` · base surface: `#16181C` / `#1A1A1D` · raised: `#1E1E22` · elevated/border: `#27272C` / `#2D2D33`
- text: primary `#F4F4F6` · secondary `#A9A9B2` / `#9AA3B2` · muted `#6B6B74`
- hairline border: `rgba(255,255,255,.08)`

**Light theme (soft off-white — NOT stark white):**
- bg: `#FBFAFD` / `#F4F4F6` · surface: `#FFFFFF` · subtle: `#F2F2F5` / `#F3F3F6`
- text: primary `#1E1E22` / `#16181C` · secondary `#52525E` · muted `#7E7E88`
- border: `#EAEAEF` / `#E2E1EA`

WCAG **AA** contrast required in both modes (the rejected gradient/email-input issues were AA failures).

## Radii (soft corners)
`xs 5px · sm 8–9px · md 10–14px · lg 16px · xl 22px · pill 999px` (buttons/badges = pill).

## Elevation & frosted glass
- **Card shadow** — light: `0 14px 30px -18px rgba(20,22,30,.22)`; dark: `0 18px 40px -20px rgba(0,0,0,.9)`, plus a `0 0 0 1px` hairline border.
- **Accent glow** — `0 8px 18px -6px <accent>` (e.g. hover on primary CTA).
- **Frosted glass** (nav, overlays, modals, glass cards): `backdrop-filter: blur(30px) saturate(1.9)`
  (range 28–36px), translucent fill (`rgba(20,22,30,.4)` dark / light off-white at ~0.6 alpha) + a 1px
  translucent border. Glassy but **legible** — keep an opacity floor so text stays AA.

## Motion — immersive (chosen)
Scroll-storytelling, smooth **page transitions**, a hero animation moment, tasteful parallax, text→media
transitions. Always implement a `prefers-reduced-motion` fallback (fades only).

## Shell components (designed, approved)
Global nav (sticky + mobile menu + "currently building" indicator), footer (socials + newsletter + legal),
theme toggle (light/dark/system, flash-free), and the shared capture components (newsletter block,
"Follow this app" button→popover, gate/lead form, Turnstile placement) with **all states**
(default/focus/loading/success/error/already-subscribed/empty) + toast. Build these per the reference HTML.
