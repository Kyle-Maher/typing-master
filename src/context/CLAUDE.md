# context/

Two providers — nest SettingsProvider **inside** UserProvider (SettingsContext reads from UserContext).

## UserContext

- `profile` is derived — `profiles.find(id === activeId)`, not stored separately
- `progress` reloads from storage every time `activeId` changes
- `addLessonResult` does several things at once:
  - `completedLessons[lessonId]` ← latest run (overwrites)
  - `bestResults[lessonId]` ← only updated if new WPM > current best
  - `lessonHistory` ← appended, capped at 500 (oldest dropped)
  - `problemKeys` map merged (counts accumulated across runs)
  - `problemWords` extracted by walking char-index ranges per word in lesson text
  - streak updated via `utils/streak.ts`
- No delete function — callers filter the profiles array and re-save

## SettingsContext

- Zero internal state; reads `profile.settings`, writes back via `UserContext.updateProfile`
- `updateSettings(partial)` merges partial into profile.settings
- Applies `data-theme` and `data-font-size` to `document.documentElement` in a useEffect
- Fallback to hardcoded defaults if no profile loaded yet
