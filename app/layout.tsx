import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock Direction Trainer",
  description: "Practice guessing daily stock direction with historical data"
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 p-6">
          <header className="flex flex-col gap-2 text-center">
            <h1 className="text-3xl font-bold">Stock Direction Trainer</h1>
            <p className="text-sm text-slate-300">
              Hone your instincts by predicting the next day&apos;s move based on
              past price action.
            </p>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="py-4 text-center text-xs text-slate-500">
            Built with Next.js, Tailwind CSS, and lightweight-charts.
          </footer>
        </div>
      </body>
    </html>
  );
}
