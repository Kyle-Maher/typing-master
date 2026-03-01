# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Type-check (tsc -b) then bundle with Vite
npm run lint      # Run ESLint
npm run preview   # Preview the production build locally
```

There is no test framework configured in this project.

## Architecture

**Typing Master** is a React 19 + TypeScript SPA built with Vite. It has two core game modes: **Typing Practice** and **Spelling Practice**.

### Path alias
`@` maps to `./src` (configured in `vite.config.ts`). All internal imports use `@/...`.

### State management
Two React Contexts wrap the app (in `src/context/`):
- **`UserContext`** — manages multi-profile support, `UserProfile`, and `UserProgress`. All data is persisted to `localStorage` via `src/services/storage.ts` (keys prefixed `tm_`).
- **`SettingsContext`** — reads/writes `UserSettings` from the active profile. Applies `data-theme` and `data-font-size` attributes to `<html>` for CSS theming.

### Core game logic (hooks)
- **`useTypingEngine`** (`src/hooks/useTypingEngine.ts`) — stateful engine for the typing practice mode. Tracks cursor position, typed characters, correctness, errors, and problem keys. Timer starts on first keypress and stops on completion. Uses refs to keep `handleKey` stable across renders.
- **`useSpellingEngine`** (`src/hooks/useSpellingEngine.ts`) — stateful engine for spelling practice. Uses the Web Speech API (`SpeechSynthesis`) to speak words aloud. Phases: `showing → typing → result → done`. Has a 5-second fallback timeout if speech doesn't fire `onend`. A `pronunciationMap` overrides TTS text for words the engine mispronounces (e.g. "the" → "thee"). Speech is delayed 50ms after `cancel()` to work around a Chrome bug where `speak()` silently fails if called synchronously after `cancel()`. On first mount, waits for `voiceschanged` before speaking since voices may not be loaded yet.

### Lessons
Lesson data lives in `src/data/lessons/` and is aggregated by `src/data/lessons/index.ts`. Categories: `home-row`, `common-words`, `sentences`, `paragraphs`, `custom`. Custom lessons are generated from `CustomWordList` objects stored in `UserProgress`.

**Unlock progression**: the first lesson in each category is always unlocked; subsequent lessons require ≥80% accuracy on the previous lesson in that category.

### Scoring
`src/services/scoring.ts` calculates points (base points × accuracy/WPM/difficulty multipliers + streak bonus) and stars (3 stars = ≥95% accuracy AND ≥40 WPM; 2 stars = ≥85% AND ≥25 WPM; 1 star otherwise).

### Styling
- Each component has a co-located CSS Module (`.module.css`).
- Global design tokens (colors, spacing, radii, shadows) are CSS custom properties defined in `src/styles/variables.css`.
- Light/dark themes are implemented via `[data-theme='dark']` overrides on `:root` variables — no JS theme logic needed in components.
- Finger-color variables (`--finger-pinky`, `--finger-ring`, etc.) are used by the keyboard display component.

### Routing
React Router v7 with these routes:
- `/` — Home
- `/lessons` — Lesson browser
- `/typing` and `/typing/:lessonId` — Typing practice
- `/spelling` — Spelling practice
- `/stats` — Statistics and charts (Recharts)
- `/profile` — Profile management and custom word lists
- `/results/:lessonId` — Post-lesson results (Enter key navigates to next lesson in category)

### Lesson completion flow
When a typing lesson is completed, `TypingPracticePage` automatically saves the result and navigates to the results page (guarded by a `finishedRef` to prevent duplicate submissions). On the results page, pressing Enter navigates to the next lesson in the same category, or back to `/lessons` if it was the last one. The "Next Lesson" button uses the same logic.

### Known pre-existing lint errors
ESLint reports 9 errors in `Toast.tsx`, `TypingArea.tsx`, `SettingsContext.tsx`, `UserContext.tsx`, `useSound.ts`, `useTimer.ts`, and `useTypingEngine.ts` — mostly `react-hooks/refs` (ref updates during render) and `react-refresh/only-export-components`. These are pre-existing and unrelated to recent changes.
