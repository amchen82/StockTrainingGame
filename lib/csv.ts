import { promises as fs } from "fs";
import path from "path";
import { OHLC } from "./types";

export async function loadCsv(symbol: string): Promise<OHLC[]> {
  const normalized = symbol.toUpperCase();
  const filePath = path.join(process.cwd(), "public", "demo", `${normalized}.csv`);

  try {
    const raw = await fs.readFile(filePath, "utf8");
    return parseCsv(raw);
  } catch (error) {
    if (normalized !== "AAPL") {
      const fallbackPath = path.join(process.cwd(), "public", "demo", "AAPL.csv");
      const raw = await fs.readFile(fallbackPath, "utf8");
      return parseCsv(raw);
    }
    throw error;
  }
}

export function parseCsv(contents: string): OHLC[] {
  const lines = contents.trim().split(/\r?\n/);
  const [, ...rows] = lines;
  const data: OHLC[] = rows
    .map((line) => line.split(","))
    .filter((cells) => cells.length >= 5)
    .map((cells) => ({
      date: cells[0]!,
      open: Number.parseFloat(cells[1]!),
      high: Number.parseFloat(cells[2]!),
      low: Number.parseFloat(cells[3]!),
      close: Number.parseFloat(cells[4]!),
      volume: cells[5] ? Number.parseFloat(cells[5]!) : undefined
    }))
    .filter((item) => !Number.isNaN(item.open) && !Number.isNaN(item.close))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  return data;
}
