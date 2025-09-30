"use client";

import { useEffect } from "react";
import { Guess } from "@/lib/types";

type RoundPanelProps = {
  decisionDate?: string;
  nextDate?: string;
  guess: Guess | null;
  onGuess: (guess: Guess) => void;
  onReveal: () => void;
  onNext: () => void;
  revealed: boolean;
  actual?: "up" | "down" | "flat";
  delta?: number;
  disabled?: boolean;
};

function formatDelta(delta?: number): string {
  if (delta === undefined) return "0.00";
  const formatted = delta.toFixed(2);
  return delta > 0 ? `+${formatted}` : formatted;
}

export default function RoundPanel({
  decisionDate,
  nextDate,
  guess,
  onGuess,
  onReveal,
  onNext,
  revealed,
  actual,
  delta,
  disabled
}: RoundPanelProps) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (disabled) return;
      if (event.key === "ArrowUp") {
        event.preventDefault();
        onGuess("up");
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        onGuess("down");
      }
      if (event.key === "Enter") {
        event.preventDefault();
        if (!revealed) {
          onReveal();
        } else {
          onNext();
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [disabled, onGuess, onNext, onReveal, revealed]);

  const guessLabel = guess ? (guess === "up" ? "Up" : "Down") : "None";
  const decisionLabel = decisionDate ? new Date(decisionDate).toLocaleDateString() : "--";
  const nextLabel = nextDate ? new Date(nextDate).toLocaleDateString() : "--";

  let resultText = "";
  if (revealed) {
    if (actual === "flat") {
      resultText = `Flat session (${formatDelta(delta)})`;
    } else if (actual) {
      const direction = actual === "up" ? "UP" : "DOWN";
      resultText = `${direction} (${formatDelta(delta)})`;
    }
  }

  return (
    <section className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 shadow-inner">
      <div className="grid gap-1 text-sm text-slate-300">
        <p>
          Decision date: <span className="font-semibold text-slate-100">{decisionLabel}</span>
        </p>
        <p>
          Next session: <span className="font-semibold text-slate-100">{nextLabel}</span>
        </p>
        <p>
          Your guess: <span className="font-semibold text-emerald-300">{guessLabel}</span>
        </p>
        <p className="text-xs text-slate-500">Keyboard: ↑ up, ↓ down, Enter reveal/next</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onGuess("up")}
          className={`flex-1 rounded-md border px-4 py-2 text-sm font-semibold transition ${
            guess === "up"
              ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
              : "border-slate-700 text-slate-200 hover:border-emerald-300"
          }`}
        >
          Guess Up
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onGuess("down")}
          className={`flex-1 rounded-md border px-4 py-2 text-sm font-semibold transition ${
            guess === "down"
              ? "border-rose-400 bg-rose-500/10 text-rose-200"
              : "border-slate-700 text-slate-200 hover:border-rose-300"
          }`}
        >
          Guess Down
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={disabled || revealed || !guess}
          onClick={onReveal}
          className="flex-1 rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
        >
          Reveal
        </button>
        <button
          type="button"
          disabled={disabled || !revealed}
          onClick={onNext}
          className="flex-1 rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 disabled:opacity-50"
        >
          Next round
        </button>
      </div>
      {revealed && (
        <div className="rounded-md border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200">
          <p className="font-semibold">Outcome: {resultText}</p>
          {actual === "flat" ? (
            <p className="text-xs text-slate-400">Flat sessions do not count toward accuracy.</p>
          ) : (
            <p className="text-xs text-slate-400">
              {guess === actual ? "Great call!" : "Logged as a mistake for review."}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
