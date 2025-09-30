# Client-Side Logic & Components

- `lib/storage.ts` – abstracts localStorage access with SSR guards to save and retrieve the player’s history.
- `lib/stats.ts` – converts the saved rounds into summary statistics, mistake lists, and aggregates used on the results page.
- `components/SymbolPicker.tsx` – reusable selector offering preset tickers and free-form input that dispatches to the `/play` route.
- `components/CandleChart.tsx` – wraps `lightweight-charts` to render candlesticks for the selected lookback window, including a vertical highlight on the decision candle and responsive resizing.
- `components/RoundPanel.tsx` – orchestrates the guessing workflow with buttons, keyboard shortcuts, reveal/next actions, and ties into state hooks that log each round result.
- `components/StatsPanel.tsx` – displays overall performance metrics (accuracy, totals, guess distribution) calculated from stored rounds.
- `components/MistakesTable.tsx` – lists incorrect rounds with contextual details and links that reload the play view at the exact decision index for targeted practice.
