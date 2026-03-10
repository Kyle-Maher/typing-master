# types/

## Files
- `user.ts` — `UserProfile`, `UserSettings`, `UserProgress`, `LessonResult`, `SpellingResult`, `CustomWordList`, `ErrorDetail`
- `lesson.ts` — `Lesson`, `LessonCategory`, `DifficultyLevel`
- `scoring.ts` — `ScoringConfig` (internal to `services/scoring.ts` only)
- `spelling.ts` — `SpellingWord`, `SpellingLesson`
- `dictation.ts` — `DictationPassage`, `DictationResult`, `DictationAssessment`

## Critical distinction in UserProgress

`UserProgress` has two separate lesson result maps:

| Field | Contains |
|---|---|
| `completedLessons: Record<lessonId, LessonResult>` | **Most recent** run per lesson |
| `bestResults: Record<lessonId, LessonResult>` | **Best WPM** run per lesson |

- Unlock logic uses `bestResults`
- UI "last result" display uses `completedLessons` or `lessonHistory`
- `lessonHistory` (array) capped at 500; oldest dropped on overflow

## LessonResult fields to know
- `wpm` = gross WPM (`chars/5/minutes`)
- `netWpm` = gross − `errors/minutes` (floored at 0)
- `problemKeys: Record<expectedChar, count>` — keyed by **expected** char, not what was typed
- `stars`: 1–3 (see scoring thresholds in root CLAUDE.md)
