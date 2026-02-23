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
  replayWord: () => void;
  reset: () => void;
}

const SPEECH_FALLBACK_TIMEOUT = 5000;

function speakWord(word: string, onEnd?: () => void): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.();
    return null;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.8;
  if (onEnd) utterance.onend = onEnd;
  if (onEnd) utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
  return utterance;
}

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

  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const currentWord = words[state.currentIndex];

  // Speak word and transition to typing phase
  useEffect(() => {
    if (state.phase === 'showing' && currentWord) {
      const transitionToTyping = () => {
        clearTimeout(timerRef.current);
        setState((prev) => (prev.phase === 'showing' ? { ...prev, phase: 'typing' } : prev));
      };
      speakWord(currentWord.word, transitionToTyping);
      // Fallback in case speech doesn't fire onend
      timerRef.current = setTimeout(transitionToTyping, SPEECH_FALLBACK_TIMEOUT);
      return () => {
        clearTimeout(timerRef.current);
        window.speechSynthesis?.cancel();
      };
    }
  }, [state.phase, state.currentIndex, currentWord]);

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

  const replayWord = useCallback(() => {
    if (currentWord) speakWord(currentWord.word);
  }, [currentWord]);

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

  return { state, currentWord, setInput, submitAnswer, nextWord, revealHint, replayWord, reset };
}
