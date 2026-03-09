# data/lessons/

## Entry point
Always import from `index.ts` — not from sub-files directly.

## Category → UI label
| Category ID | Displayed as |
|---|---|
| `home-row` | "Digraphs & Chunks" |
| `common-words` | "High-Frequency Words" |
| `sentences` | "Accuracy Training" |
| `paragraphs` | "Speed Building" |
| `custom` | "Custom" |

## Key functions (index.ts)

- `getAllLessons(customLists?)` — static lessons + generated custom lessons
- `getLessonById(id, customLists?)` — single lesson or undefined
- `isLessonUnlocked(lessonId, completedLessons, bestResults?)` — unlock rules:
  - `order === 1` in category → always unlocked
  - `category === 'custom'` → always unlocked
  - Otherwise: need `accuracy ≥ 80` on the **previous** lesson in same category
  - Uses `bestResults` not `completedLessons` → prevents re-locking after a bad retry

## Custom lessons
- Generated from `CustomWordList` objects stored in `UserProgress.customWordLists`
- `id` format: `custom-${list.id}`; category: `custom`; difficulty: `beginner`
- Text = words joined by spaces

## Adaptive lessons
- `adaptive.ts` is separate — **not** part of `getAllLessons`
- Generates targeted text from a profile's problem keys/words
