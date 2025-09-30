"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MistakesTable from "@/components/MistakesTable";
import StatsPanel from "@/components/StatsPanel";
import { clearHistory, loadHistory } from "@/lib/storage";
import { computeStats } from "@/lib/stats";
import { RoundResult } from "@/lib/types";

export default function ResultsPage() {
  const router = useRouter();
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const stats = useMemo(() => computeStats(history), [history]);

  const handleReset = () => {
    clearHistory();
    setHistory([]);
  };

  const handleReplay = (round: RoundResult) => {
    const params = new URLSearchParams({
      symbol: round.symbol,
      lookback: String(round.lookback),
      idx: String(round.idx)
    });
    router.push(`/play?${params.toString()}`);
  };

  const handleExport = async () => {
    try {
      setDownloading(true);
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(history)
      });
      if (!response.ok) {
        throw new Error("Failed to export history");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "stock-direction-history.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Unable to export history at this time.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100">Performance summary</h2>
          <p className="text-sm text-slate-300">
            Review your accuracy and revisit tricky rounds. Stats are stored locally in your browser.
          </p>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-slate-300">
            No rounds logged yet. Play a few sessions to populate your results.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2 text-sm text-slate-300">
              <p>Total rounds: {stats.totalRounds}</p>
              <p>Non-flat rounds: {stats.totalNonFlat}</p>
              <p>Correct calls: {stats.correct}</p>
              <p>Accuracy: {(stats.accuracy * 100).toFixed(1)}%</p>
              <p>Average absolute delta: {stats.avgDelta.toFixed(2)}</p>
            </div>
            <StatsPanel history={history} />
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-rose-500/60 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-500/10"
          >
            Reset stats
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={history.length === 0 || downloading}
            className="rounded-md border border-emerald-500/60 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-50"
          >
            {downloading ? "Preparing export…" : "Export CSV"}
          </button>
        </div>
      </section>
      <section className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
        <h3 className="text-xl font-semibold text-slate-100">Mistake review</h3>
        <p className="text-sm text-slate-300">
          Click replay to revisit the original setup with the same lookback window.
        </p>
        <MistakesTable mistakes={stats.mistakes} onReplay={handleReplay} />
      </section>
    </div>
  );
}
