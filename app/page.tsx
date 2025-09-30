import Link from "next/link";
import SymbolPicker from "@/components/SymbolPicker";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h2 className="text-2xl font-semibold">Train your directional edge</h2>
        <p className="text-sm text-slate-300">
          Study the recent price action of a stock or ETF, then guess whether
          the next trading day closes up or down. Reveal the answer instantly,
          and iterate quickly to improve your tape reading skills.
        </p>
        <div className="grid gap-2 text-sm text-slate-300">
          <p>How it works:</p>
          <ol className="list-inside list-decimal space-y-1">
            <li>Select a symbol or keep one of the presets.</li>
            <li>Review the candlestick history up to the hidden decision bar.</li>
            <li>Lock in your prediction: up or down for the next day&apos;s close.</li>
            <li>Reveal the answer, log the outcome, and queue up another round.</li>
          </ol>
        </div>
        <SymbolPicker />
      </section>
      <section className="grid gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h3 className="text-xl font-semibold">Track your progress</h3>
        <p className="text-sm text-slate-300">
          Every round you play is stored locally in your browser. Visit the
          results dashboard to review your accuracy, analyze mistakes, and
          export your training log as CSV.
        </p>
        <Link
          href="/results"
          className="inline-flex w-fit items-center justify-center rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
        >
          View results
        </Link>
      </section>
    </div>
  );
}
