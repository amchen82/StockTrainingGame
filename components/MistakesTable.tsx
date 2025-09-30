"use client";

import { RoundResult } from "@/lib/types";

type MistakesTableProps = {
  mistakes: RoundResult[];
  onReplay?: (round: RoundResult) => void;
};

export default function MistakesTable({ mistakes, onReplay }: MistakesTableProps) {
  if (mistakes.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        No mistakes yet. Keep training!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-900/80 text-slate-200">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Decision</th>
            <th className="px-3 py-2 text-left font-semibold">Next</th>
            <th className="px-3 py-2 text-left font-semibold">Symbol</th>
            <th className="px-3 py-2 text-left font-semibold">Guess</th>
            <th className="px-3 py-2 text-left font-semibold">Actual</th>
            <th className="px-3 py-2 text-left font-semibold">Δ</th>
            {onReplay && <th className="px-3 py-2 text-left font-semibold">Replay</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-900/40 text-slate-300">
          {mistakes.map((round) => (
            <tr key={`${round.symbol}-${round.idx}-${round.lookback}`} className="hover:bg-slate-800/40">
              <td className="px-3 py-2">{new Date(round.decisionDate).toLocaleDateString()}</td>
              <td className="px-3 py-2">{new Date(round.nextDate).toLocaleDateString()}</td>
              <td className="px-3 py-2 font-semibold text-slate-100">{round.symbol}</td>
              <td className="px-3 py-2 capitalize text-emerald-300">{round.guess}</td>
              <td className="px-3 py-2 capitalize text-rose-300">{round.actual}</td>
              <td className="px-3 py-2">{round.delta.toFixed(2)}</td>
              {onReplay && (
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onReplay(round)}
                    className="rounded-md border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200 hover:border-emerald-400"
                  >
                    Replay
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
