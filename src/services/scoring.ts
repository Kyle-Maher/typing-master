import type { ScoringConfig } from '@/types/scoring';
import type { DifficultyLevel } from '@/types/lesson';

const DEFAULT_CONFIG: ScoringConfig = {
  basePointsPerWord: 10,
  accuracyBonusThreshold: 95,
  accuracyBonusMultiplier: 1.5,
  wpmBonusTiers: [
    { minWpm: 100, multiplier: 2.5 },
    { minWpm: 70, multiplier: 2.0 },
    { minWpm: 50, multiplier: 1.5 },
    { minWpm: 30, multiplier: 1.2 },
  ],
  difficultyMultipliers: {
    beginner: 1,
    intermediate: 1.5,
    advanced: 2,
  },
  streakBonusPoints: 50,
};

export function calculatePoints(
  wordCount: number,
  wpm: number,
  accuracy: number,
  difficulty: DifficultyLevel,
  streakDays: number,
  config: ScoringConfig = DEFAULT_CONFIG,
): number {
  let points = wordCount * config.basePointsPerWord;

  // Accuracy bonus
  if (accuracy >= config.accuracyBonusThreshold) {
    points *= config.accuracyBonusMultiplier;
  }

  // WPM bonus - pick the highest applicable tier
  for (const tier of config.wpmBonusTiers) {
    if (wpm >= tier.minWpm) {
      points *= tier.multiplier;
      break;
    }
  }

  // Difficulty multiplier
  const diffMult = config.difficultyMultipliers[difficulty] ?? 1;
  points *= diffMult;

  // Streak bonus
  if (streakDays > 0) {
    points += config.streakBonusPoints * Math.min(streakDays, 30);
  }

  return Math.round(points);
}

export function calculateStars(accuracy: number, wpm: number): number {
  if (accuracy >= 95 && wpm >= 40) return 3;
  if (accuracy >= 85 && wpm >= 25) return 2;
  return 1;
}
