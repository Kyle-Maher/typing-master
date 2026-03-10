import type { ErrorDetail } from '@/types/user';

export function extractMissedWords(text: string, errors: ErrorDetail[]): string[] {
  if (errors.length === 0) return [];
  const errorPositions = new Set(errors.map((e) => e.position));
  const words: string[] = [];
  let charIdx = 0;
  for (const word of text.split(/\s+/)) {
    const wordEnd = charIdx + word.length;
    for (let i = charIdx; i < wordEnd; i++) {
      if (errorPositions.has(i)) {
        const cleaned = word.replace(/[^a-zA-Z']/g, '').toLowerCase();
        if (cleaned) words.push(cleaned);
        break;
      }
    }
    charIdx = wordEnd + 1;
  }
  return [...new Set(words)];
}
