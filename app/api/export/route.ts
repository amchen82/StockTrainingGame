import { NextRequest, NextResponse } from "next/server";
import { RoundResult } from "@/lib/types";

function toCsv(results: RoundResult[]): string {
  const header = [
    "symbol",
    "idx",
    "decisionDate",
    "nextDate",
    "guess",
    "actual",
    "delta",
    "lookback",
    "createdAt"
  ];
  const rows = results.map((round) =>
    [
      round.symbol,
      round.idx.toString(),
      round.decisionDate,
      round.nextDate,
      round.guess,
      round.actual,
      round.delta.toFixed(2),
      round.lookback.toString(),
      round.createdAt
    ].join(",")
  );
  return [header.join(","), ...rows].join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const history: RoundResult[] = Array.isArray(payload) ? payload : payload.history ?? [];
    const csv = toCsv(history);
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv",
        "content-disposition": "attachment; filename=stock-direction-history.csv"
      }
    });
  } catch (error) {
    console.error("Failed to export history", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
