import { useState, useCallback, useRef, useEffect } from 'react';
import { useTimer } from './useTimer';
import { useWpm } from './useWpm';
import { calculateAccuracy } from '@/utils/accuracy';
import type { ErrorDetail } from '@/types/user';

export interface TypingState {
  cursor: number;
  typed: string[];
  correct: boolean[];
  errors: ErrorDetail[];
  problemKeys: Record<string, number>;
  isComplete: boolean;
  isStarted: boolean;
  lastErrorKey: string | null;
}

export interface TypingEngine {
  state: TypingState;
  wpm: number;
  netWpm: number;
  accuracy: number;
  elapsedMs: number;
  errorCount: number;
  handleKey: (key: string) => void;
  reset: (newText?: string) => void;
  forceComplete: () => void;
  text: string;
}

const IGNORED_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape']);

export function useTypingEngine(initialText: string): TypingEngine {
  const [text, setText] = useState(initialText);
  const timer = useTimer();

  const [state, setState] = useState<TypingState>(() => ({
    cursor: 0,
    typed: [],
    correct: [],
    errors: [],
    problemKeys: {},
    isComplete: false,
    isStarted: false,
    lastErrorKey: null,
  }));

  // Keep refs so handleKey can read current values without re-creating
  const textRef = useRef(text);
  textRef.current = text;
  const timerRef = useRef(timer);
  timerRef.current = timer;

  const { wpm, netWpm } = useWpm(
    state.cursor,
    state.errors.length,
    timer.elapsedMs,
  );

  const correctCount = state.correct.filter(Boolean).length;
  const accuracy = calculateAccuracy(correctCount, state.correct.length);

  // Use an effect to start/stop the timer based on state changes,
  // rather than calling timer methods inside setState.
  const needsTimerStart = useRef(false);
  const needsTimerStop = useRef(false);

  useEffect(() => {
    if (needsTimerStart.current) {
      needsTimerStart.current = false;
      timer.start();
    }
    if (needsTimerStop.current) {
      needsTimerStop.current = false;
      timer.stop();
    }
  });

  // Stable handleKey — no dependencies that change on every keystroke
  const handleKey = useCallback(
    (key: string) => {
      if (IGNORED_KEYS.has(key)) return;

      setState((prev) => {
        if (prev.isComplete) return prev;

        const currentText = textRef.current;

        // Flag timer start on first keypress
        if (!prev.isStarted) {
          needsTimerStart.current = true;
        }

        // Backspace
        if (key === 'Backspace') {
          if (prev.cursor === 0) return prev;
          const newCursor = prev.cursor - 1;
          const newTyped = prev.typed.slice(0, -1);
          const newCorrect = prev.correct.slice(0, -1);
          return { ...prev, cursor: newCursor, typed: newTyped, correct: newCorrect, isStarted: true, lastErrorKey: null };
        }

        // Normal character
        if (key.length === 1 && prev.cursor < currentText.length) {
          const expected = currentText[prev.cursor]!;
          const isCorrect = key === expected;
          const newCursor = prev.cursor + 1;
          const newTyped = [...prev.typed, key];
          const newCorrect = [...prev.correct, isCorrect];

          let newErrors = prev.errors;
          let newProblemKeys = prev.problemKeys;

          if (!isCorrect) {
            newErrors = [...prev.errors, {
              expected,
              typed: key,
              position: prev.cursor,
              timestamp: Date.now(),
            }];
            newProblemKeys = { ...prev.problemKeys, [expected]: (prev.problemKeys[expected] ?? 0) + 1 };
          }

          const isComplete = newCursor >= currentText.length;
          if (isComplete) {
            needsTimerStop.current = true;
          }

          return {
            ...prev,
            cursor: newCursor,
            typed: newTyped,
            correct: newCorrect,
            errors: newErrors,
            problemKeys: newProblemKeys,
            isComplete,
            isStarted: true,
            lastErrorKey: isCorrect ? null : expected,
          };
        }

        return prev;
      });
    },
    [], // stable — reads everything through refs or setState prev
  );

  const forceComplete = useCallback(() => {
    needsTimerStop.current = true;
    setState((prev) => (prev.isStarted && !prev.isComplete ? { ...prev, isComplete: true } : prev));
  }, []);

  const reset = useCallback(
    (newText?: string) => {
      if (newText !== undefined) setText(newText);
      timer.reset();
      needsTimerStart.current = false;
      needsTimerStop.current = false;
      setState({
        cursor: 0,
        typed: [],
        correct: [],
        errors: [],
        problemKeys: {},
        isComplete: false,
        isStarted: false,
        lastErrorKey: null,
      });
    },
    [timer],
  );

  return {
    state,
    wpm,
    netWpm,
    accuracy,
    elapsedMs: timer.elapsedMs,
    errorCount: state.errors.length,
    handleKey,
    reset,
    forceComplete,
    text,
  };
}
