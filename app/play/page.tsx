"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import CandleChart from "@/components/CandleChart";
import RoundPanel from "@/components/RoundPanel";
import StatsPanel from "@/components/StatsPanel";
import SymbolPicker from "@/components/SymbolPicker";
import { loadHistory, upsertRound } from "@/lib/storage";
import { Guess, OHLC, RoundResult } from "@/lib/types";

const DEFAULT_LOOKBACK = 60;
const MIN_LOOKBACK = 20;
const MAX_LOOKBACK = 200;

function clampLookback(value: number): number {
  return Math.min(MAX_LOOKBACK, Math.max(MIN_LOOKBACK, value));
}

function pickRandomIndex(length: number, lookback: number): number | null {
  if (length < lookback + 1) return null;
  const min = lookback - 1;
  const max = length - 2;
  const range = max - min + 1;
  const offset = Math.floor(Math.random() * range);
  return min + offset;
}

export default function PlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symbolParam = searchParams.get("symbol");
  const lookbackParam = searchParams.get("lookback");
  const idxParam = searchParams.get("idx");

  const [symbol, setSymbol] = useState("AAPL");
  const [lookback, setLookback] = useState(DEFAULT_LOOKBACK);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [ohlc, setOhlc] = useState<OHLC[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [guess, setGuess] = useState<Guess | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [actual, setActual] = useState<"up" | "down" | "flat" | undefined>();
  const [delta, setDelta] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<RoundResult[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (symbolParam) {
      setSymbol(symbolParam.toUpperCase());
    } else if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("sdt_selected_symbol");
      if (stored) {
        setSymbol(stored);
      }
    }
  }, [symbolParam]);

  useEffect(() => {
    if (!lookbackParam) return;
    const parsed = Number.parseInt(lookbackParam, 10);
    if (!Number.isNaN(parsed)) {
      setLookback(clampLookback(parsed));
    }
  }, [lookbackParam]);

  useEffect(() => {
    if (!idxParam) {
      setPendingIndex(null);
      return;
    }
    const parsed = Number.parseInt(idxParam, 10);
    if (!Number.isNaN(parsed)) {
      setPendingIndex(parsed);
    }
  }, [idxParam]);

  const updateQuery = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      const query = params.toString();
      const path = query ? `/play?${query}` : "/play";
      router.replace(path, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    const controller = new AbortController();
    async function loadData() {
      setLoading(true);
      setError(null);
      setCurrentIndex(null);
      setGuess(null);
      setRevealed(false);
      setActual(undefined);
      setDelta(undefined);
      try {
        const response = await fetch(`/api/ohlc?symbol=${encodeURIComponent(symbol)}`, {
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const json = (await response.json()) as OHLC[];
        setOhlc(json);

        const totalBars = json.length;
        if (totalBars <= 1) {
          setCurrentIndex(null);
          return;
        }

        const supportedMin = Math.min(MIN_LOOKBACK, totalBars - 1);
        const supportedMax = Math.min(MAX_LOOKBACK, totalBars - 1);
        const desired = Math.min(lookback, supportedMax);
        const effectiveLookback = Math.max(desired, supportedMin);

        if (effectiveLookback !== lookback) {
          setLookback(effectiveLookback);
          updateQuery({ lookback: effectiveLookback, idx: undefined });
        }

        const targetIndex = (() => {
          const min = effectiveLookback - 1;
          const max = totalBars - 2;
          if (max < min) {
            return null;
          }
          if (pendingIndex !== null) {
            return Math.min(Math.max(pendingIndex, min), max);
          }
          return pickRandomIndex(totalBars, effectiveLookback);
        })();
        setCurrentIndex(targetIndex);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error(err);
          setError("Unable to load price history. Falling back to demo data if available.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
    return () => controller.abort();
  }, [symbol, lookback, pendingIndex, updateQuery]);

  const currentBar = currentIndex !== null ? ohlc[currentIndex] : undefined;
  const nextBar = currentIndex !== null ? ohlc[currentIndex + 1] : undefined;

  const handleGuess = (newGuess: Guess) => {
    setGuess(newGuess);
  };

  const handleReveal = () => {
    if (!currentBar || !nextBar || !guess) return;
    const difference = Number(nextBar.close - currentBar.close);
    const result: "up" | "down" | "flat" = difference === 0 ? "flat" : difference > 0 ? "up" : "down";
    setDelta(difference);
    setActual(result);
    setRevealed(true);

    const round: RoundResult = {
      symbol,
      idx: currentIndex!,
      decisionDate: currentBar.date,
      nextDate: nextBar.date,
      guess,
      actual: result,
      delta: difference,
      lookback,
      createdAt: new Date().toISOString()
    };

    const updated = upsertRound(round);
    setHistory([...updated]);
  };

  const handleNext = () => {
    if (!ohlc.length) return;
    const newIndex = pickRandomIndex(ohlc.length, lookback);
    setCurrentIndex(newIndex);
    setGuess(null);
    setRevealed(false);
    setActual(undefined);
    setDelta(undefined);
    updateQuery({ idx: undefined });
  };

  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol);
    updateQuery({ symbol: newSymbol, idx: undefined });
  };

  const handleLookbackChange = (value: number) => {
    const clamped = clampLookback(value);
    setLookback(clamped);
    updateQuery({ lookback: clamped, idx: undefined });
  };

  const decisionDate = currentBar?.date;
  const nextDate = nextBar?.date;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <SymbolPicker mode="inline" value={symbol} onSelect={handleSymbolChange} />
          <div className="grid gap-3 text-sm text-slate-300">
            <label htmlFor="lookback" className="text-sm font-semibold text-slate-200">
              Lookback window: {lookback} bars
            </label>
            <input
              id="lookback"
              type="range"
              min={MIN_LOOKBACK}
              max={MAX_LOOKBACK}
              step={5}
              value={lookback}
              onChange={(event) => handleLookbackChange(Number(event.target.value))}
              className="w-full"
            />
            <p>
              We ensure there are at least {lookback} prior candles before the hidden decision bar.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Symbol data updates hourly via Yahoo Finance when available.</span>
          <Link className="text-emerald-300 underline" href="/results">
            View results dashboard
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            {currentIndex !== null && currentIndex >= lookback - 1 && nextBar ? (
              <CandleChart ohlc={ohlc} endIndex={currentIndex} lookback={lookback} revealed={revealed} />
            ) : loading ? (
              <p className="text-sm text-slate-300">Loading price history…</p>
            ) : (
              <p className="text-sm text-slate-300">
                Not enough data to play this round. Try a smaller lookback or another symbol.
              </p>
            )}
          </div>
          <RoundPanel
            decisionDate={decisionDate}
            nextDate={nextDate}
            guess={guess}
            onGuess={handleGuess}
            onReveal={handleReveal}
            onNext={handleNext}
            revealed={revealed}
            actual={actual}
            delta={delta}
            disabled={loading || !nextBar}
          />
        </div>
        <StatsPanel history={history} />
      </div>
    </div>
  );
}
