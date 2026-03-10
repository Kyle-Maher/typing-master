/** Standard WPM: (chars typed / 5) / minutes */
export function calculateWpm(charsTyped: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60000;
  return Math.round((charsTyped / 5) / minutes);
}

/** Net WPM: gross WPM - (errors / minutes) */
export function calculateNetWpm(charsTyped: number, errors: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60000;
  const gross = (charsTyped / 5) / minutes;
  const net = gross - (errors / minutes);
  return Math.max(0, Math.round(net));
}
