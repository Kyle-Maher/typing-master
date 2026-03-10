import { useMemo } from 'react';
import { calculateWpm, calculateNetWpm } from '@/utils/wpm';

export function useWpm(charsTyped: number, errors: number, elapsedMs: number) {
  const snapped = Math.floor(elapsedMs / 1000) * 1000;
  const wpm = useMemo(() => calculateWpm(charsTyped, snapped), [charsTyped, snapped]);
  const netWpm = useMemo(() => calculateNetWpm(charsTyped, errors, snapped), [charsTyped, errors, snapped]);
  return { wpm, netWpm };
}
