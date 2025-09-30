export type OHLC = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type Guess = "up" | "down";

export type RoundResult = {
  symbol: string;
  idx: number;
  decisionDate: string;
  nextDate: string;
  guess: Guess;
  actual: "up" | "down" | "flat";
  delta: number;
  lookback: number;
  createdAt: string;
};
