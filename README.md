# Stock Direction Trainer

A web app for practicing next-session stock direction calls. Built with Next.js 14, TypeScript, and Tailwind CSS, the trainer lets you study recent price action, guess whether the next day closes up or down, and iterate rapidly while tracking progress locally.

## Features

- **Interactive training flow.** Review candlestick history, log an up or down prediction, reveal the outcome, and immediately queue another round. Keyboard shortcuts (↑, ↓, Enter) keep the loop fast.
- **Lightweight charting.** The play view renders responsive candlestick charts using `lightweight-charts`, paired with adjustable lookback windows and symbol presets.
- **Offline-friendly data sourcing.** OHLC data is fetched from Yahoo Finance with a bundled CSV fallback for demo play when the API is unavailable.
- **Persistent performance tracking.** Every round is stored in local storage, powering accuracy metrics, mistake review, CSV export, and quick replays from the results dashboard.

## Tech Stack

- [Next.js 14](https://nextjs.org/) App Router with React 18 and TypeScript.
- Styling via Tailwind CSS with custom global theming.
- Candlestick visualization powered by [`lightweight-charts`](https://github.com/tradingview/lightweight-charts).
- Node test runner with TypeScript via `ts-node` for unit tests.

## Project Structure

```
app/            # App Router routes, API handlers, and global layout
components/     # Client-side UI components such as charts, panels, and tables
lib/            # Data utilities for CSV parsing, Yahoo Finance fetches, stats, and storage
public/demo/    # Bundled CSV samples for offline or fallback play
tests/          # Node test runner suites (see `npm test`)
```

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Visit [http://localhost:3000](http://localhost:3000) and select **Play** to begin training.

## Available Scripts

- `npm run dev` – Launch the Next.js development server.
- `npm run build` – Create an optimized production build.
- `npm start` – Serve the built app.
- `npm run lint` – Run ESLint with the Next.js config.
- `npm test` – Execute Node-based unit tests via `ts-node` (e.g., CSV parsing verification).

## Data & Persistence Notes

- All price history requests go through `/api/ohlc`, which caches Yahoo Finance responses for one hour and falls back to bundled CSV data if remote fetches fail.
- Training results live entirely in the browser's local storage; clearing storage or using a private window will reset stats.
- The results dashboard can export your session history by POSTing to `/api/export`, which returns a CSV download of all recorded rounds.

## Testing

The repository ships with a sample test that ensures bundled CSV data stays sorted and well-formed. Run all tests with:

```bash
npm test
```

This command executes the suites located in `tests/` using Node's built-in test runner configured for TypeScript.

## License

This project is provided for educational and training purposes. Review any bundled data sources and third-party packages for their respective licenses before distributing.
