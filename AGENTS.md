# Naqiwha frontend: rules for agents

See `README.md` for the product, routes and setup. Visuals come from the brand tokens in `src/styles/theme.css` and the
SVGs in `public/brand/`. There are no full screen mockups: design screens from these tokens so they look native, polished and fun.

## Architecture
- Vite + React 19 + TS + Tailwind v4 (tokens in `src/styles/theme.css` via `@theme`), React Router (import from `react-router`),
  TanStack Query v5. Data hooks are all in `src/lib/queries.ts`; types in `src/shared/` (frozen contract, identical to
  `neqiwha-backend/shared/`; do not edit).
- Dev: `npm run dev` (Vite on :5173, proxies `/api` to the backend on :8787, which must be running from `neqiwha-backend`).
- Prod: `server.mjs` serves `dist/` and proxies `/api/*` to the backend service on Railway's private network.
- Presentational components live in `src/components/` (props in, callbacks out). Screens live in `src/screens/`, one per route.

## Rules
- Pushing to GitHub does not deploy: deploys are manual via `scripts/deploy.sh`.
- `npm run typecheck && npm run build` must pass before every commit.
- Mobile first: design for 390x844, check 360 px width. The app column is max 480px wide.
- Test login (DEV_TOOLS=true, local only; production runs with DEV_TOOLS=false): any email ending `@naqiwha.test`, code `424242`.
- Fonts: Changa (display, numbers, `font-display`) and Readex Pro (body, `font-sans`).
- Colour meaning: spot states are red = not cleaned yet, yellow = cleaning now, green = cleaned (status chips). Map markers
  use the art in `public/brand/markers/` (red trash bin, green broom, dark green leaf);
  gold = money or legend; red otherwise only for destructive actions and refusals.
- Voice: "Yallah!", "Saha! Spot cleaned.", "Mabrouk! You're now Platinum". Errors are plain English, no "sorry", no Darija.
- Every mutation shows a toast (`sonner`); buttons show loading and are disabled while pending.
- Tap targets ≥ 44px, `min-h-dvh`, safe-area padding, `prefers-reduced-motion` respected.
