# Naqiwha frontend: rules for agents

Full spec: `../naqiwha-technical-plan.md` (section 10 = frontend, section 1 = product). It wins on data, API, flows and copy.
Visuals: `../Design system components planning/Brand Board.dc.html` (brand board v2: tokens, logo, rank insignia and
avatar frames, marker sheet, status chips, voice, motion). Screenshots in `../Design system components planning/screenshots/`.
There are no full screen mockups: design screens from these tokens so they look native, polished and fun.

## Architecture
- Vite + React 19 + TS + Tailwind v4 (tokens in `src/styles/theme.css` via `@theme`), React Router (import from `react-router`),
  TanStack Query v5. Data hooks are all in `src/lib/queries.ts`; types in `src/shared/` (frozen contract, identical to
  `neqiwha-backend/shared/`; do not edit).
- Dev: `npm run dev` (Vite on :5173, proxies `/api` to the backend on :8787, which must be running from `neqiwha-backend`).
- Prod: `server.mjs` serves `dist/` and proxies `/api/*` to the backend service on Railway's private network.
- Presentational components live in `src/components/` (props in, callbacks out). Screens live in `src/screens/`, one per route.

## Rules
- NEVER `git push`. Commit locally only.
- `npm run typecheck && npm run build` must pass before every commit.
- Mobile first: design for 390x844, check 360 px width. The app column is max 480px wide.
- Test login (DEV_TOOLS=true): any email ending `@naqiwha.test`, code `424242`.
- Fonts: Changa (display, numbers, `font-display`) and Readex Pro (body, `font-sans`).
- Colour meaning: spot states are red = not cleaned yet (trash bin), yellow = cleaning now (clock), green = cleaned (logo mark);
  gold = money or legend; red otherwise only for destructive actions and refusals.
- Voice: "Yallah!", "Saha! Spot cleaned.", "Mabrouk! You're now Super Dz". Errors are plain English, no "sorry", no Darija.
- Every mutation shows a toast (`sonner`); buttons show loading and are disabled while pending.
- Tap targets ≥ 44px, `min-h-dvh`, safe-area padding, `prefers-reduced-motion` respected.
