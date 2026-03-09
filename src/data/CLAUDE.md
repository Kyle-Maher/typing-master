# data/

## Sub-folders

| Folder | Type | Contents |
|---|---|---|
| `lessons/` | `Lesson[]` | Typing lessons with unlock logic (see `lessons/CLAUDE.md`) |
| `spelling/` | `SpellingWord[]` | Grade-1, grade-3, advanced word lists |
| `dictation/` | `DictationPassage[]` | Beginner/intermediate/advanced passages |
| `endless/` | string arrays | Topic sets: food, locations, poems, random, stories + aggregator index |

## Top-level files

- `keyboard-layouts.ts` — key-to-finger mappings used by `components/keyboard/`
- `word-bank.ts` — raw word pool for endless and adaptive modes
