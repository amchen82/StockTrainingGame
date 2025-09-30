"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

const PRESETS = ["AAPL", "MSFT", "TSLA", "SPY"];
const STORAGE_KEY = "sdt_selected_symbol";

type SymbolPickerProps = {
  mode?: "link" | "inline";
  onSelect?: (symbol: string) => void;
  value?: string;
};

export default function SymbolPicker({ mode = "link", onSelect, value }: SymbolPickerProps) {
  const [symbol, setSymbol] = useState("AAPL");
  const router = useRouter();

  useEffect(() => {
    if (value) {
      setSymbol(value.toUpperCase());
      return;
    }
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSymbol(stored);
    }
  }, [value]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, symbol);
  }, [symbol]);

  const startHref = useMemo(() => `/play?symbol=${encodeURIComponent(symbol)}`, [symbol]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = symbol.trim().toUpperCase();
    setSymbol(normalized);
    if (mode === "inline") {
      onSelect?.(normalized);
    } else {
      router.push(`/play?symbol=${encodeURIComponent(normalized)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <label className="text-sm font-medium text-slate-200" htmlFor="symbol-input">
        Choose a symbol
      </label>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setSymbol(preset)}
            className={`rounded-md border px-3 py-1 text-sm transition ${
              preset === symbol
                ? "border-emerald-400 bg-emerald-500/10 text-emerald-300"
                : "border-slate-700 text-slate-300 hover:border-emerald-400"
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
      <input
        id="symbol-input"
        value={symbol}
        onChange={(event) => setSymbol(event.target.value.toUpperCase())}
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
        placeholder="Enter ticker (e.g. NVDA)"
      />
      {mode === "link" ? (
        <Link
          href={startHref}
          className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Start training
        </Link>
      ) : (
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Load symbol
        </button>
      )}
    </form>
  );
}
