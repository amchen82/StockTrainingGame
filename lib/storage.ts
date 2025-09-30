import { RoundResult } from "./types";

const STORAGE_KEY = "sdt_history_v1";

type History = RoundResult[];

declare global {
  interface Window {
    __sdt_storage_memo__?: History;
  }
}

export function loadHistory(): History {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const cached = window.__sdt_storage_memo__;
    if (cached) return cached;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.__sdt_storage_memo__ = [];
      return [];
    }
    const parsed = JSON.parse(raw) as History;
    window.__sdt_storage_memo__ = parsed;
    return parsed;
  } catch (error) {
    console.error("Failed to load history", error);
    return [];
  }
}

export function saveHistory(history: History): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  window.__sdt_storage_memo__ = history;
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.__sdt_storage_memo__ = [];
}

export function upsertRound(result: RoundResult): History {
  const history = loadHistory();
  const existingIndex = history.findIndex(
    (item) => item.symbol === result.symbol && item.idx === result.idx && item.lookback === result.lookback
  );

  let updated: History;
  if (existingIndex >= 0) {
    updated = [...history];
    updated[existingIndex] = result;
  } else {
    updated = [...history, result];
  }

  saveHistory(updated);
  return updated;
}
