# pages/

## Routes

| Path | Page |
|---|---|
| `/` | HomePage |
| `/lessons` | LessonsPage |
| `/typing/:lessonId?` | TypingPracticePage |
| `/spelling` | SpellingPracticePage |
| `/dictation` | DictationPage |
| `/endless` | EndlessPracticePage |
| `/results/:lessonId` | ResultsPage |
| `/stats` | StatsPage |
| `/profile` | ProfilePage |

## Non-obvious behaviors

**TypingPracticePage**
- `finishedRef` prevents duplicate `addLessonResult` calls if `isComplete` fires more than once
- Timed mode (30/60/120s) only available when no `lessonId` param; calls `forceComplete()` on expiry
- Adaptive text passed via `location.state.adaptiveText` — not a URL param

**ResultsPage**
- Reads result from `lessonHistory` scanning backward for matching lessonId — not a passed prop
- Enter key → next lesson in same category; last lesson in category → `/lessons`
- `isNewBest` = `lastResult.id === bestResult.id`

**DictationPage**
- Phases driven by `useDictationEngine`: `idle → listening → typing → done`
- Score = `coverageScore` (fuzzy content-word match), not typing accuracy

**EndlessPracticePage**
- Flow: topic select → auto-advancing chunks session → summary screen
- Accumulates WPM/accuracy stats across all chunks
