# Application Pages

- `app/layout.tsx` – wraps every page with shared metadata, fonts, and the Tailwind-powered shell.
- `app/page.tsx` – landing page that introduces the game, lets players choose a symbol via the `SymbolPicker`, and navigates into the session.
- `app/play/page.tsx` – core gameplay screen that loads OHLC data, slices it per round, renders the `CandleChart`, and coordinates user guesses through the `RoundPanel` while persisting history with the storage helpers.
- `app/results/page.tsx` – dashboard that aggregates stored rounds via utilities in `lib/stats`, renders cumulative metrics inside `StatsPanel`, and lists mistakes in `MistakesTable` with deep links back to `/play` for replays.
