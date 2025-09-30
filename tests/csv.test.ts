import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { parseCsv } from "../lib/csv";

const DEMO_FILE = path.join(process.cwd(), "public", "demo", "AAPL.csv");

test("parseCsv produces sorted OHLC data for the bundled demo file", async () => {
  const raw = await readFile(DEMO_FILE, "utf8");
  const parsed = parseCsv(raw);

  assert.ok(parsed.length > 0, "Expected at least one OHLC row");

  const first = parsed[0];
  const last = parsed[parsed.length - 1];

  assert.strictEqual(first?.date, "2019-01-02");
  assert.strictEqual(first?.open, 149.05);
  assert.strictEqual(first?.close, 150.03);

  assert.strictEqual(last?.date, "2024-12-31");
  assert.strictEqual(last?.high, 233.17);
  assert.strictEqual(last?.low, 229.33);

  for (let i = 1; i < parsed.length; i += 1) {
    const prev = parsed[i - 1];
    const current = parsed[i];
    assert.ok(
      prev.date <= current.date,
      `Dates should be in ascending order but found ${prev.date} before ${current.date}`
    );
  }
});
