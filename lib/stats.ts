import { RoundResult } from "./types";

export type StatsSummary = {
  totalRounds: number;
  correct: number;
  totalNonFlat: number;
  accuracy: number;
  upGuesses: number;
  downGuesses: number;
  avgDelta: number;
  mistakes: RoundResult[];
};

export function computeStats(results: RoundResult[]): StatsSummary {
  const totalRounds = results.length;
  const mistakes: RoundResult[] = [];
  let correct = 0;
  let totalNonFlat = 0;
  let upGuesses = 0;
  let downGuesses = 0;
  let deltaSum = 0;
  let deltaCount = 0;

  for (const round of results) {
    if (round.guess === "up") {
      upGuesses += 1;
    } else {
      downGuesses += 1;
    }

    if (round.actual !== "flat") {
      totalNonFlat += 1;
      if (round.guess === round.actual) {
        correct += 1;
      } else {
        mistakes.push(round);
      }
      deltaSum += Math.abs(round.delta);
      deltaCount += 1;
    }
  }

  const accuracy = totalNonFlat > 0 ? correct / totalNonFlat : 0;
  const avgDelta = deltaCount > 0 ? deltaSum / deltaCount : 0;

  return {
    totalRounds,
    correct,
    totalNonFlat,
    accuracy,
    upGuesses,
    downGuesses,
    avgDelta,
    mistakes
  };
}
