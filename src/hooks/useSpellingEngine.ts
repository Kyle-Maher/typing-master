import { useState, useCallback, useRef, useEffect } from 'react';
import type { SpellingWord } from '@/types/spelling';
import { useSettings } from '@/context/SettingsContext';

export type SpellingPhase = 'showing' | 'typing' | 'result' | 'done';

export interface SpellingState {
  currentIndex: number;
  phase: SpellingPhase;
  input: string;
  attempt: number;
  maxAttempts: number;
  results: { word: string; correct: boolean; attempts: number }[];
  showHint: boolean;
  showSentence: boolean;
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
  revealSentence: () => void;
  replayWord: () => void;
  reset: () => void;
}

const SPEECH_FALLBACK_TIMEOUT = 5000;

/** Words whose spelling‑out pronunciation differs from normal reading. */
const pronunciationMap: Record<string, string> = {
  the: 'thee',
};

/**
 * Speak a word using the Web Speech API.
 * Returns a cancel function that aborts both the delay and the utterance.
 * A short delay after cancel() is needed to work around a Chrome bug where
 * speak() silently fails if called synchronously after cancel().
 */
function speakWord(
  word: string,
  voiceName: string | null,
  rate: number,
  onEnd?: () => void,
): () => void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.();
    return () => {};
  }
  window.speechSynthesis.cancel();
  const textToSpeak = pronunciationMap[word.toLowerCase()] ?? word;
  const delayId = setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    const voice = voiceName
      ? window.speechSynthesis.getVoices().find((v) => v.name === voiceName) ?? null
      : null;
    utterance.voice = voice;
    if (onEnd) utterance.onend = onEnd;
    if (onEnd) utterance.onerror = onEnd;
    window.speechSynthesis.speak(utterance);
  }, 50);
  return () => {
    clearTimeout(delayId);
    window.speechSynthesis?.cancel();
  };
}

export function useSpellingEngine(words: SpellingWord[]): SpellingEngine {
  const { settings } = useSettings();
  const voiceNameRef = useRef(settings.voiceName);
  voiceNameRef.current = settings.voiceName;
  const speechRateRef = useRef(settings.speechRate);
  speechRateRef.current = settings.speechRate;

  const [state, setState] = useState<SpellingState>(() => ({
    currentIndex: 0,
    phase: 'showing',
    input: '',
    attempt: 1,
    maxAttempts: 3,
    results: [],
    showHint: false,
    showSentence: false,
    correctCount: 0,
    totalWords: words.length,
  }));

  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const currentWord = words[state.currentIndex];

  const cancelSpeechRef = useRef<(() => void) | null>(null);

  // Speak word and transition to typing phase
  useEffect(() => {
    if (state.phase === 'showing' && currentWord) {
      const transitionToTyping = () => {
        clearTimeout(timerRef.current);
        setState((prev) => (prev.phase === 'showing' ? { ...prev, phase: 'typing' } : prev));
      };

      const speak = () => {
        cancelSpeechRef.current = speakWord(currentWord.word, voiceNameRef.current, speechRateRef.current, transitionToTyping);
        // Fallback in case speech doesn't fire onend
        timerRef.current = setTimeout(transitionToTyping, SPEECH_FALLBACK_TIMEOUT);
      };

      // On first mount, voices may not be loaded yet. Wait for them before speaking.
      if (window.speechSynthesis && window.speechSynthesis.getVoices().length === 0) {
        let spoken = false;
        const speakOnce = () => {
          if (spoken) return;
          spoken = true;
          window.speechSynthesis?.removeEventListener('voiceschanged', onVoices);
          clearTimeout(timerRef.current);
          speak();
        };
        const onVoices = () => speakOnce();
        window.speechSynthesis.addEventListener('voiceschanged', onVoices);
        // Fallback in case voiceschanged never fires (some browsers)
        timerRef.current = setTimeout(speakOnce, SPEECH_FALLBACK_TIMEOUT);
        return () => {
          spoken = true;
          clearTimeout(timerRef.current);
          window.speechSynthesis?.removeEventListener('voiceschanged', onVoices);
          cancelSpeechRef.current?.();
        };
      }

      speak();
      return () => {
        clearTimeout(timerRef.current);
        cancelSpeechRef.current?.();
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
        showSentence: false,
      };
    });
  }, []);

  const replayWord = useCallback(() => {
    if (currentWord) speakWord(currentWord.word, voiceNameRef.current, speechRateRef.current);
  }, [currentWord]);

  const revealHint = useCallback(() => {
    setState((prev) => ({ ...prev, showHint: true }));
  }, []);

  const revealSentence = useCallback(() => {
    setState((prev) => ({ ...prev, showSentence: true }));
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
      showSentence: false,
      correctCount: 0,
      totalWords: words.length,
    });
  }, [words.length]);

  return { state, currentWord, setInput, submitAnswer, nextWord, revealHint, revealSentence, replayWord, reset };
}
