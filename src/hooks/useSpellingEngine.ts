import { useState, useCallback, useRef, useEffect } from 'react';
import type { SpellingWord } from '@/types/spelling';

export type SpellingPhase = 'showing' | 'typing' | 'result' | 'done';

export interface SpellingState {
  currentIndex: number;
  phase: SpellingPhase;
  input: string;
  attempt: number;
  maxAttempts: number;
  results: { word: string; correct: boolean; attempts: number }[];
  showHint: boolean;
  correctCount: number;
  totalWords: number;
}

export interface SpellingEngine {
  state: SpellingState;
  currentWord: SpellingWord | undefined;
  setInput: (value: string) => void;
  submitAnswer: () => void;
  nextWord: () => void;
  revealHint: () => void;
  reset: () => void;
}

const SHOW_DURATION = 2500;

export function useSpellingEngine(words: SpellingWord[]): SpellingEngine {
  const [state, setState] = useState<SpellingState>(() => ({
    currentIndex: 0,
    phase: 'showing',
    input: '',
    attempt: 1,
    maxAttempts: 3,
    results: [],
    showHint: false,
    correctCount: 0,
    totalWords: words.length,
  }));

  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const currentWord = words[state.currentIndex];

  // Auto-hide word after showing
  useEffect(() => {
    if (state.phase === 'showing') {
      timerRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, phase: 'typing' }));
      }, SHOW_DURATION);
      return () => clearTimeout(timerRef.current);
    }
  }, [state.phase, state.currentIndex]);

  const setInput = useCallback((value: string) => {
    setState((prev) => ({ ...prev, input: value }));
  }, []);

  const submitAnswer = useCallback(() => {
    if (!currentWord) return;
    setState((prev) => {
      const isCorrect = prev.input.trim().toLowerCase() === currentWord.word.toLowerCase();

      if (isCorrect) {
        return {
          ...prev,
          phase: 'result',
          results: [...prev.results, { word: currentWord.word, correct: true, attempts: prev.attempt }],
          correctCount: prev.correctCount + 1,
        };
      }

      // Wrong answer
      if (prev.attempt >= prev.maxAttempts) {
        return {
          ...prev,
          phase: 'result',
          results: [...prev.results, { word: currentWord.word, correct: false, attempts: prev.maxAttempts }],
        };
      }

      return { ...prev, attempt: prev.attempt + 1, input: '' };
    });
  }, [currentWord]);

  const nextWord = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.totalWords) {
        return { ...prev, phase: 'done' };
      }
      return {
        ...prev,
        currentIndex: nextIndex,
        phase: 'showing',
        input: '',
        attempt: 1,
        showHint: false,
      };
    });
  }, []);

  const revealHint = useCallback(() => {
    setState((prev) => ({ ...prev, showHint: true }));
  }, []);

  const reset = useCallback(() => {
    setState({
      currentIndex: 0,
      phase: 'showing',
      input: '',
      attempt: 1,
      maxAttempts: 3,
      results: [],
      showHint: false,
      correctCount: 0,
      totalWords: words.length,
    });
  }, [words.length]);

  return { state, currentWord, setInput, submitAnswer, nextWord, revealHint, reset };
}
