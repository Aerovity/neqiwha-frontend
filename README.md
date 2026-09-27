# Naqiwha — Frontend

**Naqiwha** (Algerian Darija, roughly *"clean it up!"*) turns cleaning public spaces into a ranked, social quest. People spot a dirty place on the map, rally others to clean it, check volunteers in with personal QR codes, prove the cleanup with before/after photos judged by AI, and earn XP, ranks and coins they spend at a partner shop.

This repository is the **mobile-first web app**. The API lives in [neqiwha-backend](https://github.com/Aerovity/neqiwha-backend).

**Live app:** https://naqiwha.tech/

---

## Features

- **Live map** of spots, one icon per state: red trash bin = not cleaned yet, green broom = cleaning now, dark green leaf = cleaned. Markers grow with the number of participants. A filters button (above the locate button) shows or hides spots by state and by distance from you (1–10 km, drawn as a circle on the map). Tapping a marker opens a preview card.
- **Spot a mess.** Capture a photo with the live camera, then Gemini checks it and pre-fills the title and description. The spot is pinned at your live GPS position. You can publish it as a public cleanup with a meeting time, or as a private, anonymous solo cleanup.
- **Join and check in.** Every user has a personal QR ticket. The organizer scans it on site (camera scanner or manual code entry). The screen stays awake while the QR ticket is shown.
- **Finish.** The organizer takes the AFTER photo, and the AI compares it with the BEFORE photo. If it passes, everyone checked in gets XP and coins, with a celebration overlay, confetti and a rank-up reveal.
- **Ranks.** Five levels, from *Bronze* to *Diamond*. Each rank has its own insignia, avatar frame and perks.
- **Shop and wallet.** Spend coins on vouchers from partner shops (a made-up demo catalogue: café, pizzeria, plant nursery, bookshop, surf club, cinema). You redeem a voucher at the counter with a hold-to-use ticket.
- **Leaderboard** with a podium, plus a personal **history** feed.
- **Admin panel** (`/admin`, admins only): close, reopen or delete spots, manage admins and view the action log.
- Passwordless **email login** with a 6-digit code.
- **Animated splash** on every page load (the leaf fills in, then fades into the app), and a floating icon-only **navigation bar** with a central "Spot a mess" button.

## Stack

- **React 19** + **TypeScript**, built with **Vite**
- **Tailwind CSS v4** (design tokens in `src/styles/theme.css` via `@theme`)
- **React Router** and **TanStack Query v5** (all data hooks live in `src/lib/queries.ts`)
- **Google Maps** via `@vis.gl/react-google-maps`
- `qrcode.react` / `@yudiel/react-qr-scanner` for QR tickets and scanning
- `motion`, `canvas-confetti` and `sonner` for animation, celebrations and toasts
- **Hono** production server (`server.mjs`)

## Architecture

```
Browser ──► neqiwha-frontend (public)  ──/api/*──►  neqiwha-backend (private network)  ──►  Postgres
             server.mjs: serves dist/ + proxies /api
```

- **In development**, Vite serves the app on `:5173` and proxies `/api` to the backend on `:8787` (override with `API_URL`).
- **In production**, `server.mjs` serves the built `dist/` (long-lived caching for hashed assets, SPA fallback to `index.html`) and forwards `/api/*` to the backend over Railway's private network (`BACKEND_URL`). The browser sees a single origin, so session cookies stay first-party and no CORS is needed.

```
src/
  main.tsx, App.tsx   entry, providers, routes, global ErrorBoundary
  screens/            one screen per route (+ screens/parts/ for screen-specific pieces: map, GPS, scanner, ...)
  components/         presentational UI kit (props in, callbacks out)
  lib/                api client, queries, formatting, geo, image and history helpers
  shared/             types, ranks and shop catalogue — frozen contract, identical to neqiwha-backend/shared/
  styles/theme.css    brand tokens
public/brand/         logo mark, map pin, rank insignia, map marker and navbar (brand/nav) SVGs
public/splash/        loading animation frames and wide-screen backdrop (WebP)
```

> `src/shared/` must stay identical to the backend's `shared/` folder, so don't edit it on one side only.

### Routes

| Path | Screen | Auth |
|---|---|---|
| `/` | Map | public |
| `/login`, `/login/code` | Email login + code | public |
| `/spots/:id` | Spot detail | public |
| `/ranks`, `/leaderboard` | Ranks, leaderboard | public |
| `/onboarding` | Set your name | signed in |
| `/spots/new` | Spot a mess | signed in |
| `/spots/:id/checkin`, `/spots/:id/finish` | Organizer check-in and finish | signed in |
| `/me/qr` | My QR ticket | signed in |
| `/profile`, `/history` | Profile, history | signed in |
| `/shop`, `/wallet`, `/wallet/:id` | Shop, wallet, voucher | signed in |
| `/admin` | Admin panel | admins |
| `/kit` | UI kit gallery | `DEV_TOOLS` only |

## Getting started

### Prerequisites

- Node 22
- The [backend](https://github.com/Aerovity/neqiwha-backend) running locally on `:8787`. It serves the Google Maps key to the app through `/api/config`, so the frontend needs no keys of its own.

### Run locally

```bash
git clone https://github.com/Aerovity/neqiwha-frontend.git
cd neqiwha-frontend
npm install
npm run dev          # http://localhost:5173
```

When the backend runs with `DEV_TOOLS=true`, you can log in with any email ending in `@naqiwha.test` and the code **`424242`**.

The camera and GPS need a secure context. `localhost` counts as one, but to test on a phone over the LAN you need HTTPS, for example a tunnel or the deployed app.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with `/api` proxy |
| `npm run build` | Production build to `dist/` |
| `npm start` | Serve `dist/` and proxy `/api` (`server.mjs`) |
| `npm run preview` | Build, then start the production server |
| `npm run typecheck` | `tsc --noEmit` |

Run `npm run typecheck && npm run build` before every commit.

### Environment variables

| Variable | Used by | Default |
|---|---|---|
| `API_URL` | Vite dev proxy target | `http://localhost:8787` |
| `BACKEND_URL` | `server.mjs` proxy target (the backend's private URL on Railway) | `http://localhost:8787` |
| `PORT` | Dev server / production server port | `5173` / `8080` |

## Design guidelines

- **Mobile first.** Designed for 390×844 and checked at 360 px wide. On larger screens the app sits in a centred column up to 480 px wide.
- **Fonts:** *Changa* for display text and numbers (`font-display`), and *Readex Pro* for body text (`font-sans`).
- **Colour meaning:** red, yellow and green show spot states. Gold means money or legend status. Outside spot states, red is used only for destructive actions and refusals.
- **Voice:** playful, with Darija flavour ("Yallah!", "Saha! Spot cleaned.", "Mabrouk! You're now Platinum"). Error messages are plain English.
- **Behaviour:** every mutation shows a toast, and buttons show a loading state and are disabled while pending. Tap targets are at least 44 px, safe-area padding is applied, and `prefers-reduced-motion` is respected.

## Deployment

The app is deployed to Railway as the `neqiwha-frontend` service. [`railway.json`](railway.json) runs `npm run build` and then `npm start`, with a health check on `/`. Set `BACKEND_URL` to the backend service's private-network address.

```bash
./scripts/deploy.sh   # stamps the local commit SHA, then `railway up`
```
