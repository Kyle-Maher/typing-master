import type { UserProgress } from '@/types/user';
import { getTopProblemKeys } from '@/services/analytics';
import { wordsByKey } from '@/data/word-bank';

/**
 * Generate adaptive practice text biased toward the user's weakest keys.
 * Takes the top N problem keys and builds a practice string from words that
 * exercise those keys, with more repetitions for worse-performing keys.
 */
export function generateAdaptiveText(progress: UserProgress, wordCount = 50): string {
  const topKeys = getTopProblemKeys(progress, 5);
  if (topKeys.length === 0) return '';

  const pool: string[] = [];
  for (const { key, count } of topKeys) {
    const words = wordsByKey[key.toLowerCase()] ?? [];
    if (words.length === 0) continue;
    // Weight by error count — more errors = more words in pool
    const weight = Math.max(1, Math.ceil(count / topKeys[0]!.count * 3));
    for (let i = 0; i < weight; i++) {
      pool.push(...words);
    }
  }

  if (pool.length === 0) return '';

  // Shuffle and pick
  const result: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool[idx]!);
  }
  return result.join(' ');
}
