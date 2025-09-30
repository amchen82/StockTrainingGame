"use client";

import { computeStats } from "@/lib/stats";
import { RoundResult } from "@/lib/types";

type StatsPanelProps = {
  history: RoundResult[];
};

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export default function StatsPanel({ history }: StatsPanelProps) {
  const stats = computeStats(history);
  const upRatio = stats.totalRounds > 0 ? stats.upGuesses / stats.totalRounds : 0;
  const downRatio = stats.totalRounds > 0 ? stats.downGuesses / stats.totalRounds : 0;

  return (
    <section className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 shadow-inner">
      <h3 className="text-lg font-semibold text-slate-100">Session stats</h3>
      <div className="grid gap-2 text-sm text-slate-300">
        <p>Total rounds: {stats.totalRounds}</p>
        <p>Correct (non-flat): {stats.correct}</p>
        <p>Accuracy: {formatPercent(stats.accuracy)}</p>
        <p>Average absolute delta: {stats.avgDelta.toFixed(2)}</p>
      </div>
      <div className="grid gap-2">
        <p className="text-sm font-semibold text-slate-200">Guess distribution</p>
        <div className="flex items-end gap-4">
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-10 rounded-t-md bg-emerald-500"
              style={{ height: `${Math.max(upRatio * 120, 4)}px` }}
            />
            <span className="text-xs text-slate-400">Up ({stats.upGuesses})</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-10 rounded-t-md bg-rose-500"
              style={{ height: `${Math.max(downRatio * 120, 4)}px` }}
            />
            <span className="text-xs text-slate-400">Down ({stats.downGuesses})</span>
          </div>
        </div>
      </div>
    </section>
  );
}
