"use client";

import { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi, Time } from "lightweight-charts";
import { OHLC } from "@/lib/types";

type CandleChartProps = {
  ohlc: OHLC[];
  endIndex: number;
  lookback: number;
  revealed?: boolean;
};

type CandlestickSeries = ISeriesApi<"Candlestick">;

export default function CandleChart({ ohlc, endIndex, lookback, revealed }: CandleChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<CandlestickSeries | null>(null);
  const decisionLineRef = useRef<HTMLDivElement | null>(null);
  const decisionTimeRef = useRef<Time | undefined>(undefined);

  const updateDecisionLine = (time?: Time) => {
    const chart = chartRef.current;
    const element = decisionLineRef.current;
    if (!chart || !element || !time) {
      if (element) {
        element.style.opacity = "0";
      }
      return;
    }
    const coordinate = chart.timeScale().timeToCoordinate(time);
    if (coordinate === null) {
      element.style.opacity = "0";
      return;
    }
    element.style.opacity = "1";
    element.style.left = `${coordinate}px`;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "rgba(15, 23, 42, 0.9)" },
        textColor: "#e2e8f0"
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.2)" },
        horzLines: { color: "rgba(148, 163, 184, 0.2)" }
      },
      crosshair: {
        mode: 1
      },
      rightPriceScale: {
        borderVisible: false
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true
      }
    });

    const series = chart.addCandlestickSeries({
      upColor: "#34d399",
      wickUpColor: "#34d399",
      downColor: "#f87171",
      wickDownColor: "#f87171",
      borderVisible: false
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        chart.applyOptions({ width, height });
        updateDecisionLine(decisionTimeRef.current);
      }
    });
    observer.observe(containerRef.current);

    const { width, height } = containerRef.current.getBoundingClientRect();
    chart.applyOptions({ width, height: height || 360 });

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      decisionTimeRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart) return;

    const start = Math.max(0, endIndex - lookback + 1);
    const slice = ohlc.slice(start, endIndex + 1);
    const data = slice.map((item) => ({
      time: item.date as Time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close
    }));

    series.setData(data);

    const decision = slice[slice.length - 1];
    if (decision) {
      const decisionTime = decision.date as Time;
      decisionTimeRef.current = decisionTime;
      series.setMarkers([
        {
          time: decisionTime,
          position: "aboveBar",
          color: revealed ? "#34d399" : "#38bdf8",
          shape: revealed ? "arrowDown" : "circle",
          text: revealed ? "Revealed" : "Guess"
        }
      ]);
      updateDecisionLine(decisionTime);
    } else {
      decisionTimeRef.current = undefined;
      series.setMarkers([]);
      updateDecisionLine();
    }

    const first = slice[0];
    const last = slice[slice.length - 1];
    if (first && last) {
      chart.timeScale().setVisibleRange({
        from: first.date as Time,
        to: last.date as Time
      });
    }
  }, [ohlc, endIndex, lookback, revealed]);

  return (
    <div ref={containerRef} className="relative h-[360px] w-full">
      <div
        ref={decisionLineRef}
        className="pointer-events-none absolute top-0 bottom-0 w-[2px] -translate-x-1/2 bg-sky-400 opacity-0 transition-opacity"
      />
    </div>
  );
}
