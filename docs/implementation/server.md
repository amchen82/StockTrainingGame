# Server Routes & Data Access

- `app/api/ohlc/route.ts` – fetches five years of daily candles using the Yahoo Finance chart API helper (`lib/yahoo`) and exposes them as normalized OHLC JSON with hourly revalidation; if the remote request fails it falls back to the bundled CSV parser.
- `app/api/export/route.ts` – accepts a list of round results and streams back a CSV file so players can download their history.
- `lib/yahoo.ts` – server-side helper that calls the Yahoo Finance API, handles query parameters, numeric parsing, ordering, and date trimming to make data chart-ready.
- `lib/csv.ts` – reads demo CSV files from `public/demo`, parses them into OHLC objects, and serves as an offline fallback.
