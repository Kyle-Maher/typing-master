export interface ScoringConfig {
  basePointsPerWord: number;
  accuracyBonusThreshold: number;
  accuracyBonusMultiplier: number;
  wpmBonusTiers: { minWpm: number; multiplier: number }[];
  difficultyMultipliers: Record<string, number>;
  streakBonusPoints: number;
}
