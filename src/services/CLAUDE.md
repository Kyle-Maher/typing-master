# services/

## scoring.ts

`calculatePoints(wordCount, wpm, accuracy, difficulty, streakDays)`:
1. base = `wordCount × 10`
2. × `1.5` if accuracy ≥ 95%
3. × WPM tier (first matching): 100+ → 2.5x | 70+ → 2.0x | 50+ → 1.5x | 30+ → 1.2x
4. × difficulty: `beginner=1` | `intermediate=1.5` | `advanced=2`
5. + streak bonus: `50 × min(streakDays, 30)`

`calculateStars(accuracy, wpm)`:
- 3★ — accuracy ≥ 95% **AND** wpm ≥ 40
- 2★ — accuracy ≥ 85% **AND** wpm ≥ 25
- 1★ — otherwise

## storage.ts

Keys: `tm_profiles` | `tm_active_profile_id` | `tm_progress_{id}` | `tm_schema_version`

- `getProgress(id)` lazy-creates default if no entry exists
- JSON parse errors swallowed silently (returns null / empty default)
- Import = upsert by ID; no delete function — callers filter + re-save
- `exportUserData` / `importUserData` for profile portability (JSON)

## analytics.ts

Read-only aggregations over `UserProgress` — no writes. Key fns:
`getWpmOverTime`, `getTopProblemKeys`, `getTopProblemWords`, `getAverageWpm`, `getAverageAccuracy`, `getLessonsPerDay`, `getRecentBest`

## dictationScoring.ts

`assessDictation(original, typed)` → `DictationAssessment`
- Coverage = % of **content words** (stop-words stripped) from original found in typed
- Fuzzy match: Levenshtein distance ≤ `floor(wordLength / 4)`
