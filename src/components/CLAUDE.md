# components/

## Convention
- Components receive engine state as **props** — no engine hooks (`useTypingEngine`, `useSpellingEngine`, etc.) inside components
- Each sub-folder has co-located `.module.css` per component
- Theming via CSS custom properties only — no inline theme logic in JS

## Sub-folders

| Folder | Components | Notes |
|---|---|---|
| `common/` | Button, Modal, Navigation, ProgressBar, Toast, ErrorBoundary | Generic shared UI |
| `keyboard/` | Key, KeyboardDisplay | Highlights target/pressed/error keys; uses `--finger-*` CSS vars |
| `lessons/` | LessonCard, LessonList | Props-only; no data fetching |
| `profile/` | CustomWordListEditor, ProfileForm | Mutates via `useUser()` |
| `spelling/` | SpellingArea, WordPrompt | Controlled by useSpellingEngine state passed as props |
| `stats/` | ProblemKeys, StatsChart, StreakDisplay | Recharts; reads from `services/analytics.ts` helpers |
| `typing/` | CharacterDisplay, LiveStats, TypingArea | Controlled by useTypingEngine state passed as props |
