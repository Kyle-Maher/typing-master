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

**Typing Master** is a React 19 + TypeScript SPA built with Vite. It has four game modes: **Typing Practice**, **Spelling Practice**, **Dictation**, and **Endless Practice**.

### Path alias
`@` maps to `./src` (configured in `vite.config.ts`). All internal imports use `@/...`.

### State management
Two React Contexts wrap the app (in `src/context/`):
- **`UserContext`** — manages multi-profile support, `UserProfile`, and `UserProgress`. All data is persisted to `localStorage` via `src/services/storage.ts` (keys prefixed `tm_`).
- **`SettingsContext`** — reads/writes `UserSettings` from the active profile. Applies `data-theme` and `data-font-size` attributes to `<html>` for CSS theming.

### Core game logic (hooks)
- **`useTypingEngine`** (`src/hooks/useTypingEngine.ts`) — stateful engine for the typing practice mode. Tracks cursor position, typed characters, correctness, errors, and problem keys. Timer starts on first keypress and stops on completion. Uses refs to keep `handleKey` stable across renders.
- **`useSpellingEngine`** (`src/hooks/useSpellingEngine.ts`) — stateful engine for spelling practice. Uses the Web Speech API (`SpeechSynthesis`) to speak words aloud. Phases: `showing → typing → result → done`. Has a 5-second fallback timeout if speech doesn't fire `onend`. A `pronunciationMap` overrides TTS text for words the engine mispronounces (e.g. "the" → "thee"). Speech is delayed 50ms after `cancel()` to work around a Chrome bug where `speak()` silently fails if called synchronously after `cancel()`. On first mount, waits for `voiceschanged` before speaking since voices may not be loaded yet.
- **`useDictationEngine`** (`src/hooks/useDictationEngine.ts`) — stateful engine for dictation mode. Phases: `idle → listening → typing → done`. Same 50ms speech delay as spelling. Score is `coverageScore` (fuzzy content-word coverage), not typing accuracy.

### Data
- **Lessons** (`src/data/lessons/`) — aggregated by `index.ts`. Categories: `home-row`, `common-words`, `sentences`, `paragraphs`, `custom`. Always import from `index.ts`, not sub-files directly. `adaptive.ts` is separate — not part of `getAllLessons`; generates targeted text from a profile's problem keys/words.
- **Spelling** (`src/data/spelling/`) — 20 lessons (grades 1–5, themed, academic/SAT/business, advanced, expert). Aggregated by `index.ts`. Each lesson has ~20 words with hints and sentences for TTS-based practice.
- **Dictation** (`src/data/dictation/`) — beginner/intermediate/advanced passages.
- **Endless** (`src/data/endless/`) — topic sets (food, locations, poems, random, stories) with an aggregator index.
- `keyboard-layouts.ts` — key-to-finger mappings used by `components/keyboard/`.

**Unlock progression**: the first lesson in each category is always unlocked; subsequent lessons require ≥80% accuracy on the previous lesson in that category. Unlock logic uses `bestResults` (not `completedLessons`) to prevent re-locking after a bad retry.

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
- `/dictation` — Dictation practice
- `/endless` — Endless practice (topic select → auto-advancing chunks → summary)
- `/stats` — Statistics and charts (Recharts)
- `/profile` — Profile management and custom word lists
- `/results/:lessonId` — Post-lesson results (Enter key navigates to next lesson in category)

### Lesson completion flow
When a typing lesson is completed, `TypingPracticePage` automatically saves the result and navigates to the results page (guarded by a `finishedRef` to prevent duplicate submissions). On the results page, pressing Enter navigates to the next lesson in the same category, or back to `/lessons` if it was the last one. The "Next Lesson" button uses the same logic.

Timed mode (30/60/120s) is only available when no `lessonId` param; calls `forceComplete()` on expiry. Adaptive text is passed via `location.state.adaptiveText`, not a URL param.

### Utils
`src/utils/` contains pure calculation helpers — no React, no side effects:
- `accuracy.ts` — `calculateAccuracy(correct, total)` → integer %; returns 100 if total=0
- `wpm.ts` — gross WPM = `(charsTyped / 5) / minutes`; net WPM = `gross − (errors / minutes)` floored at 0
- `streak.ts` — same-day → no change; +1 day → increment; gap > 1 → reset to 1
- `text.ts` — `normalizeText` (curly quotes → straight), `splitIntoLines` (word-wrap)

### Known pre-existing lint errors
ESLint reports 9 errors in `Toast.tsx`, `TypingArea.tsx`, `SettingsContext.tsx`, `UserContext.tsx`, `useSound.ts`, `useTimer.ts`, and `useTypingEngine.ts` — mostly `react-hooks/refs` (ref updates during render) and `react-refresh/only-export-components`. These are pre-existing and unrelated to recent changes.
