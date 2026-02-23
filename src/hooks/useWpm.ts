import { useMemo } from 'react';
import { calculateWpm, calculateNetWpm } from '@/utils/wpm';

export function useWpm(charsTyped: number, errors: number, elapsedMs: number) {
  const wpm = useMemo(() => calculateWpm(charsTyped, elapsedMs), [charsTyped, elapsedMs]);
  const netWpm = useMemo(() => calculateNetWpm(charsTyped, errors, elapsedMs), [charsTyped, errors, elapsedMs]);
  return { wpm, netWpm };
}
