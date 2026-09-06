# World Markets

**World Markets** is a responsive React + TypeScript dashboard for major global stock indices and country-filtered international headlines. It is built with Vite and Tailwind CSS, designed to stay lightweight, and deploys as a static site on GitHub Pages.

**Live demo:** [https://juancruzlunatech.github.io/world-markets/](https://juancruzlunatech.github.io/world-markets/)

## What it does

The app combines two public data streams:

- **Market quotes** from the Yahoo Finance Chart API (benchmark index price, daily change, and a short sparkline)
- **News** from Google News RSS (via rss2json when available, with an XML parser fallback)

In local development, Vite proxies avoid browser CORS limits. On GitHub Pages (and any static host without those proxies), the UI falls back to same-origin JSON snapshots under `public/data/` produced by the package `prefetch` script.

## Features

- Global market overview with leading stock indices (Americas, Europe, Asia-Pacific)
- Region filter chips: All, Americas, Europe, Asia-Pacific
- Quote cards with price, signed percent change, currency, and sparkline
- Per-card loading skeletons, error state, and retry
- Country-based news feed (Google News RSS) with loading / error / ready states
- Light / Dark / System theme selector (persisted in localStorage)
- Hash routing (HashRouter) for reliable GitHub Pages hosting
- Static build + GitHub Actions deploy to Pages

## Tech stack

- **UI:** React 19, TypeScript, React Router (HashRouter)
- **Build:** Vite 8, @vitejs/plugin-react
- **Styling:** Tailwind CSS 4 (@tailwindcss/vite), custom theme tokens in src/index.css
- **Lint:** Oxlint (.oxlintrc.json)
- **Data:** Yahoo Finance Chart API, Google News RSS, optional rss2json
- **Deploy:** GitHub Pages via .github/workflows/pages.yml

## CORS and data strategy

External APIs (Yahoo Finance, Google News) often block browser cross-origin requests. This project uses a two-layer approach:

### 1. Local development — Vite proxies

`vite.config.ts` exposes same-origin paths that Vite rewrites to upstream hosts:

- /api/yahoo -> https://query1.finance.yahoo.com
- /api/google-news -> https://news.google.com
- /api/rss2json -> https://api.rss2json.com

`src/lib/fetchCors.ts` tries the matching /api/... proxy first, then the raw absolute URL.

### 2. Production / GitHub Pages — prefetched snapshots

GitHub Pages cannot run those Vite proxies.

At build or CI time (or locally before commit), refresh the JSON snapshots under `public/data/`:

```bash
npm run prefetch
```

The Node helper `scripts/prefetch-data.mjs` writes the JSON files listed below:

- public/data/markets.json — all exchange quotes keyed by exchange id
- public/data/news/<CODE>.json — articles per country (e.g. US.json, ES.json)
- public/data/news/all.json — combined news bundle

At runtime, `src/lib/markets.ts` and `src/lib/news.ts`:

1. Try a live fetch (proxy in dev, or direct / rss2json where CORS allows)
2. On failure or empty results, load the same-origin snapshot from data/... (respecting Vite base)

That keeps the Pages site usable even when live APIs are blocked in the browser.

## Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints (default http://localhost:5173).

Optional: refresh snapshots before a production build:

```bash
npm run prefetch
npm run build
```

## npm scripts

- **`dev`** (`vite`) — Start the Vite dev server with API proxies
- **`prefetch`** (`node scripts/prefetch-data.mjs`) — Fetch Yahoo + Google News and write public/data/
- **`build`** (`tsc -b && vite build`) — Typecheck and emit static assets to dist/
- **`preview`** (`vite preview`) — Serve the production build locally
- **`lint`** (`oxlint`) — Lint the project with Oxlint

## Deployment (GitHub Pages)

Workflow: [.github/workflows/pages.yml](.github/workflows/pages.yml)

- **Triggers:** push to main, or manual workflow_dispatch
- **Permissions:** contents: read, pages: write, id-token: write
- **Concurrency:** group pages, cancel in-progress runs
- **Build job:** checkout, Node 22 + cache, install deps, production build, upload dist as Pages artifact
- **Deploy job:** actions/deploy-pages@v4 to the github-pages environment

Live site: [https://juancruzlunatech.github.io/world-markets/](https://juancruzlunatech.github.io/world-markets/)

`vite.config.ts` sets `base:` './' so asset URLs work under the project Pages path. Routing uses HashRouter (/#/, /#/noticias) so deep links do not depend on server rewrite rules.

> Tip: commit fresh `public/data/` snapshots (or run the package `prefetch` script in CI before build) so production always has a CORS-safe fallback. The default workflow currently runs the production build only; ensure snapshots are present in the repo or add a `prefetch` step if you want CI to refresh them.

## Project structure

```text
world-markets/
├── .github/workflows/pages.yml   # GitHub Pages CI/CD
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── data/
│       ├── markets.json          # Prefetched market quotes
│       └── news/
│           ├── all.json          # Combined news bundle
│           └── <CODE>.json       # Per-country news (US, ES, …)
├── scripts/
│   └── prefetch-data.mjs         # Node helper for public/data
├── src/
│   ├── main.tsx                  # React entry
│   ├── App.tsx                   # HashRouter + routes
│   ├── index.css                 # Tailwind + theme tokens
│   ├── assets/                   # Static images (hero, logos)
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── ThemeSelect.tsx
│   │   ├── MarketCard.tsx
│   │   └── Sparkline.tsx
│   ├── pages/
│   │   ├── MarketsPage.tsx
│   │   └── NewsPage.tsx
│   ├── data/
│   │   ├── exchanges.ts
│   │   └── countries.ts
│   └── lib/
│       ├── markets.ts
│       ├── news.ts
│       ├── fetchCors.ts
│       ├── theme.ts
│       └── formatNumbers.js
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── .oxlintrc.json
└── README.md
```

## File-by-file documentation

### Root configuration

- **package.json** — Project metadata, package scripts (dev, prefetch, build, preview, lint), React / Vite / Tailwind / Oxlint dependencies.
- **package-lock.json** — Locked dependency tree for reproducible installs in CI.
- **index.html** — HTML shell: favicon, meta description, Google Fonts (Newsreader + DM Sans), early theme bootstrap script (wm-theme in localStorage), and the #root mount for Vite.
- **vite.config.ts** — React + Tailwind plugins, base: './', and /api/yahoo, /api/google-news, /api/rss2json proxies for local CORS-free development.
- **tsconfig.json** — Solution-style TypeScript root that references app and node configs.
- **tsconfig.app.json** — Compiler options for src/ (browser / React app).
- **tsconfig.node.json** — Compiler options for Node-side tooling (e.g. Vite config).
- **.oxlintrc.json** — Oxlint plugins and rules (React hooks, export-components).
- **.gitignore** — Ignores node_modules, dist, logs, editor junk.
- **README.md** — This documentation.

### CI / deployment

- **.github/workflows/pages.yml** — Builds with Node 22, uploads dist, and deploys to GitHub Pages on every push to main (or manual dispatch).

### Scripts

- **scripts/prefetch-data.mjs** — Server-side Node helper that:
  - Parses src/data/exchanges.ts and src/data/countries.ts with lightweight regex
  - Fetches Yahoo Finance chart JSON for each symbol (with delay + User-Agent)
  - Fetches news via rss2json, falling back to raw RSS XML parsing
  - Writes public/data/markets.json and public/data/news/*.json
  - Exits non-zero if zero markets or zero news feeds succeed

### Public static assets and data

- **public/favicon.svg** — Site favicon copied into dist/ as-is.
- **public/icons.svg** — Shared SVG icon sprite / graphics for the static site.
- **public/data/.gitkeep** — Keeps the data/ directory in git when empty.
- **public/data/markets.json** — Prefetch snapshot: { fetchedAt, quotes: { [exchangeId]: { price, change, changePercent, currency, spark, asOf } } }.
- **public/data/news/.gitkeep** — Keeps the news/ directory in git when empty.
- **public/data/news/all.json** — Prefetch bundle of all countries articles plus top-level fetchedAt.
- **public/data/news/<CODE>.json** — Per-country snapshot (US, GB, ES, MX, AR, CO, CL, BR, FR, DE, IT, JP, CN, IN, AU, CA, KR, …) with { fetchedAt, articles }.

### Application entry and styles

- **src/main.tsx** — Creates the React root, imports global CSS, and renders App inside StrictMode.
- **src/App.tsx** — Declares HashRouter routes under a shared Layout: / to MarketsPage, /noticias to NewsPage.
- **src/index.css** — Tailwind import, @custom-variant dark, @theme design tokens (fonts, ink/paper/accent/up/down colors), body backgrounds, .surface, .chip / .chip-active / .chip-idle, and other global UI helpers.

### Components

- **src/components/Layout.tsx** — Sticky header (WM mark, title, Markets / News nav, theme control), Outlet for page content, footer with data-source credit and Not financial advice.
- **src/components/ThemeSelect.tsx** — Light / Dark / System chip buttons; applies theme via lib/theme and listens to prefers-color-scheme when System is selected.
- **src/components/MarketCard.tsx** — Quote card (city, index, exchange, price, percent badge, sparkline). Also exports MarketCardSkeleton and MarketCardError (with retry).
- **src/components/Sparkline.tsx** — Small SVG area + line chart from the last ~20 closes; green when up, rose when down.

### Pages

- **src/pages/MarketsPage.tsx** — Dashboard: region chips, loads each exchange via loadQuote, tracks per-card loading / ready / error, renders the responsive card grid.
- **src/pages/NewsPage.tsx** — Headlines: country chips (default ES), loads articles via loadNews, shows skeletons / error / article list with source and formatted date.

### Static data catalogs

- **src/data/exchanges.ts** — Exchange type, EXCHANGES catalog (id, name, index, city, country, region, Yahoo symbol, currency), and REGIONS filter list.
- **src/data/countries.ts** — NewsCountry type and NEWS_COUNTRIES list (code, display name, Google News RSS URL).

### Libraries

- **src/lib/markets.ts** — MarketQuote type; live Yahoo chart fetch via fetchThroughCors; normalize price / change / spark; cache and merge data/markets.json snapshots; loadQuote / loadAllQuotes.
- **src/lib/news.ts** — NewsArticle type; live path (rss2json then CORS-proxied RSS XML); snapshot fallback from data/news/<CODE>.json; loadNews and countryByCode.
- **src/lib/fetchCors.ts** — Maps Yahoo / Google News / rss2json URLs to Vite /api/* proxies when in the browser; tries proxy then raw URL; rejects HTML mistaken for API responses.
- **src/lib/theme.ts** — THEME_OPTIONS, readTheme / isDark / applyTheme; persists preference under wm-theme and toggles the dark class on html.
- **src/lib/formatNumbers.js** — formatPrice, formatPercent (optional signed), formatNewsDate using Intl (en-US).

### Assets

- **src/assets/hero.png** — Hero / marketing image asset (available for UI use).
- **src/assets/react.svg** — React logo (Vite template asset).
- **src/assets/vite.svg** — Vite logo (Vite template asset).

## Notes and disclaimer

- Market data comes from **Yahoo Finance** (unofficial Chart API). Availability, symbols, and field meanings can change without notice.
- News comes from **Google News RSS** (and optionally **rss2json**). Feeds are third-party; titles and links may vary by region and language.
- Prefetched JSON under public/data/ is a **point-in-time snapshot**, not a live feed. Refresh with the package prefetch script when you want newer data in production fallbacks.
- This project is for **demonstration / portfolio** monitoring. It is **not financial advice**. Do not use it as the sole basis for investment decisions.
- For a hardened production setup, consider a small backend or scheduled job for caching, rate limits, and API keys rather than relying only on browser fetches and static snapshots.

## License

Private project (private: true in package.json). Adjust licensing if you open-source the repository.

