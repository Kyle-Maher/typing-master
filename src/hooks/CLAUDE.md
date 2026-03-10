# hooks/

## useTypingEngine

Core typing game loop. Key patterns:
- `handleKey` is **zero-dep stable** — reads everything via `textRef`/refs or `setState(prev =>` to avoid stale closures
- Timer start/stop deferred via `needsTimerStart`/`needsTimerStop` refs + unconditional `useEffect` — never call timer methods inside setState
- `problemKeys` keyed by **expected** char (not what the user typed)
- `forceComplete()` sets isComplete without requiring cursor to reach end — used by timed mode

## useSpellingEngine

Phase machine: `showing → typing → result → done`

Non-obvious behaviors:
- **50ms delay** after `cancel()` before `speak()` — Chrome silently drops speak() if called synchronously after cancel()
- Waits for `voiceschanged` event on first mount (voices may not be loaded yet)
- **5s fallback timer** if speech `onend` never fires
- `pronunciationMap` overrides TTS text for mispronounced words (e.g. `"the"` → `"thee"`)
- `replayWord()` re-speaks without resetting phase or state
- `speakWord()` returns a cancel function

## useDictationEngine

Phase machine: `idle → listening → typing → done`

- Same 50ms speech delay as useSpellingEngine
- Accepts `mode` param: `'sequential'` (default, listen-then-type) or `'simultaneous'` (type while audio plays)
- `replay()` increments `replayCount`, re-speaks; does not reset phase
- Timer starts on `startTyping()`, stops on `submit()`
- Score = `coverageScore` (content-word coverage), not typing accuracy

## Supporting hooks

| Hook | Purpose |
|---|---|
| `useTimer` | rAF loop; `start` / `stop` / `reset` |
| `useWpm` | thin memo wrapper around `utils/wpm` |
| `useKeyboardInput` | tracks `Set<string>` of currently pressed keys |
| `useLocalStorage` | generic typed useState + localStorage sync |
| `useSound` | audio playback (has pre-existing lint error — see root CLAUDE.md) |
