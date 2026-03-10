# data/

## Sub-folders

| Folder | Type | Contents |
|---|---|---|
| `lessons/` | `Lesson[]` | Typing lessons with unlock logic (see `lessons/CLAUDE.md`) |
| `spelling/` | `SpellingLesson[]` | 20 lessons (grades 1–5, themed, professional, expert); aggregated by `index.ts` |
| `dictation/` | `DictationPassage[]` | Beginner/intermediate/advanced passages |
| `endless/` | string arrays | Topic sets: food, locations, poems, random, stories + aggregator index |

## Top-level files

- `keyboard-layouts.ts` — key-to-finger mappings used by `components/keyboard/`
- `word-bank.ts` — raw word pool for endless and adaptive modes
