# utils/

## Files

| File | Function | Notes |
|---|---|---|
| `accuracy.ts` | `calculateAccuracy(correct, total)` | Returns integer %; returns 100 if total=0 |
| `wpm.ts` | `calculateWpm`, `calculateNetWpm` | See formulas below |
| `streak.ts` | `updateStreak(current, longest, lastDate)` | See logic below |
| `text.ts` | `normalizeText`, `splitIntoLines` | Curly quotes → straight; word-wrap helper |
| `missedWords.ts` | `extractMissedWords(text, errors)` | Returns deduplicated words containing error positions |

## WPM formulas
- Gross WPM = `(charsTyped / 5) / minutes` (standard 5-char word unit)
- Net WPM = `gross − (errors / minutes)`, floored at 0

## Streak logic
- Same day as `lastPracticeDate` → no change (idempotent)
- `diffDays === 1` → increment streak
- `diffDays > 1` → reset to 1
- `lastPracticeDate === null` → start at 1
