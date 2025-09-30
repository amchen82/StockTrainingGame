import { NextRequest, NextResponse } from "next/server";
import { getDailyHistory } from "@/lib/yahoo";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.toUpperCase() ?? "AAPL";

  try {
    const data = await getDailyHistory(symbol);
    return NextResponse.json(data, {
      headers: {
        "cache-control": "public, s-maxage=3600"
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load data" },
      {
        status: 500
      }
    );
  }
}
