# World Markets

World Markets is a responsive React + TypeScript dashboard that tracks major global stock market indices and presents region-specific international news. The app is built with Vite and Tailwind CSS and is designed to be lightweight, fast, and easy to deploy.

## Overview

The project combines two data streams:
- Market data from Yahoo Finance Chart API for benchmark index quotes and daily performance
- News feeds from Google News RSS, with a fallback parser and a `rss2json` integration for more reliable article retrieval

It offers a clean, card-based layout for comparing global exchanges, supports region filtering, and includes a theme selector for light/dark mode.

## Features

- Global market overview with leading stock indices
- Region filter: All, Americas, Europe, Asia-Pacific
- Real-time style quote cards with price, change, and sparkline
- Country-based news feed selector
- Loading, error, and retry states for external requests
- Light/dark theme support
- Static deployment-ready setup for GitHub Pages

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Deployment

The project is prepared to deploy the built `dist/` folder using GitHub Pages via GitHub Actions whenever changes are pushed to the `main` branch.

## Verified external sources

The following sources were checked during validation:
- Yahoo Finance Chart API: working and returning market metadata and price series
- Google News RSS: reachable and returning XML items
- `rss2json`: successfully returns parsed articles for Google News feeds
- Alternative proxy services such as `allorigins` and `corsproxy.io` were not consistently reliable in this environment and are therefore treated as fallback options, not primary dependencies

## File-by-file documentation

### Root configuration
- `package.json`: defines project metadata, scripts (`dev`, `build`, `preview`, `lint`), dependencies, and Vite/React tooling.
- `index.html`: the HTML entry point that loads the Vite app root.
- `vite.config.ts`: configures Vite for React, Tailwind, and build behavior.
- `tsconfig*.json`: TypeScript compiler settings for the app and Node/Vite environment.
- `README.md`: overall project documentation and architecture summary.

### Application entry
- `src/main.tsx`: bootstraps React and mounts the app to the DOM.
- `src/App.tsx`: configures the router and declares the `/` and `/noticias` routes.

### Layout and UI shell
- `src/components/Layout.tsx`: defines the shared page layout, navigation, theme selector, and footer disclaimer.
- `src/components/ThemeSelect.tsx`: reads and updates the selected theme, applying it to the document and listening for system preference changes.

### Market data logic
- `src/data/exchanges.ts`: contains the stock exchange catalog, including symbol, city, country, region, and currency metadata.
- `src/lib/markets.ts`: fetches index data from Yahoo Finance, normalizes the response, calculates daily change and percentage, and generates the sparkline values.
- `src/components/MarketCard.tsx`: renders the market quote card with the index name, location, current value, and percent variation.
- `src/pages/MarketsPage.tsx`: loads all market quotes, handles loading/error states, filters markets by region, and renders the dashboard page.

### News data logic
- `src/data/countries.ts`: stores the list of countries that can be selected in the news view, along with their Google News RSS endpoints.
- `src/lib/news.ts`: fetches articles from Google News RSS via `rss2json`, then falls back to direct XML parsing when needed, and filters invalid records.
- `src/pages/NewsPage.tsx`: displays the selected country’s headlines, handles loading/error states, and lets the user switch countries.

### Utilities
- `src/lib/fetchCors.ts`: attempts multiple fetch strategies to reach external APIs when direct access is blocked by browser CORS restrictions.
- `src/lib/formatNumbers.js`: formats prices, percentages, and news timestamps for presentation.
- `src/lib/theme.ts`: stores the theme configuration and applies the proper classes to the document.

### Styling and assets
- `src/index.css`: global style layer, Tailwind imports, theme variables, and base app styling.
- `src/assets/`: static images or app assets used by the interface.
- `src/components/Sparkline.tsx`: draws the mini trend graph used inside each market card.

## Notes

This project is intentionally lightweight and uses public APIs for demonstration and portfolio-style monitoring. If you plan to move it to production, you may want to add caching, rate-limit handling, and a dedicated backend for reliability and security.
