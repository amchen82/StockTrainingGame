import { loadCsv } from "./csv";
import { OHLC } from "./types";

const FIVE_YEARS_IN_MS = 1000 * 60 * 60 * 24 * 365 * 5;

function withinFiveYears(date: Date): boolean {
  const now = new Date();
  return now.getTime() - date.getTime() <= FIVE_YEARS_IN_MS;
}

type YahooChartResponse = {
  chart?: {
    error?: unknown;
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
  };
};

function normalizeYahooData(raw: unknown): OHLC[] {
  if (!raw || typeof raw !== "object") return [];

  const chart = (raw as YahooChartResponse).chart;
  if (!chart || typeof chart !== "object" || chart.error) return [];

  const [result] = Array.isArray(chart.result) ? chart.result : [];
  if (!result || typeof result !== "object") return [];

  const timestamps = Array.isArray(result.timestamp) ? result.timestamp : [];
  const quote =
    result.indicators && typeof result.indicators === "object"
      ? Array.isArray(result.indicators.quote)
        ? result.indicators.quote[0]
        : undefined
      : undefined;

  if (!quote || typeof quote !== "object") return [];

  const { open, high, low, close, volume } = quote;
  const length = timestamps.length;
  const ohlc: OHLC[] = [];

  for (let index = 0; index < length; index += 1) {
    const timestamp = timestamps[index];
    if (typeof timestamp !== "number" || Number.isNaN(timestamp)) {
      continue;
    }

    const date = new Date(timestamp * 1000);
    if (Number.isNaN(date.getTime()) || !withinFiveYears(date)) {
      continue;
    }

    const openValue = open?.[index];
    const highValue = high?.[index];
    const lowValue = low?.[index];
    const closeValue = close?.[index];

    if (
      openValue == null ||
      highValue == null ||
      lowValue == null ||
      closeValue == null ||
      Number.isNaN(openValue) ||
      Number.isNaN(highValue) ||
      Number.isNaN(lowValue) ||
      Number.isNaN(closeValue)
    ) {
      continue;
    }

    const volumeValue = volume?.[index];
    const normalizedVolume =
      volumeValue == null || Number.isNaN(volumeValue) ? undefined : Number(volumeValue);

    ohlc.push({
      date: date.toISOString().slice(0, 10),
      open: Number(openValue),
      high: Number(highValue),
      low: Number(lowValue),
      close: Number(closeValue),
      volume: normalizedVolume
    });
  }

  return ohlc.sort((a, b) => (a.date < b.date ? -1 : 1));
}

export async function getDailyHistory(symbol: string): Promise<OHLC[]> {
  const trimmedSymbol = symbol.trim().toUpperCase();
  const safeSymbol = trimmedSymbol || "AAPL";

  const url = new URL(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(safeSymbol)}`
  );
  url.searchParams.set("range", "5y");
  url.searchParams.set("interval", "1d");
  url.searchParams.set("includePrePost", "false");
  url.searchParams.set("events", "div,splits");
  url.searchParams.set("lang", "en-US");
  url.searchParams.set("region", "US");

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return loadCsv(symbol);
    }

    const json = (await response.json()) as unknown;
    const normalized = normalizeYahooData(json);

    if (normalized.length === 0) {
      return loadCsv(symbol);
    }

    return normalized;
  } catch (error) {
    console.error("Yahoo Finance fetch failed", error);
    return loadCsv(symbol);
  }
}
