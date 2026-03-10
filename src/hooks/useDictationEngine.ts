import { useState, useCallback, useRef, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';

export type DictationPhase = 'idle' | 'listening' | 'typing' | 'done';

export interface DictationState {
  phase: DictationPhase;
  input: string;
  coverageScore: number;
  replayCount: number;
}

export interface DictationEngine {
  state: DictationState;
  startListening: () => void;
  setInput: (value: string) => void;
  submitAnswer: () => void;
  replayPassage: () => void;
  reset: () => void;
}

const SPEECH_FALLBACK_TIMEOUT = 5000;

const STOP_WORDS = new Set(
  'the a an is are was were be been being in on at to for of and or but with by from it its as that this these those'.split(' '),
);

function getContentWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w));
}

function computeCoverageScore(passageText: string, typedText: string): number {
  const contentWords = getContentWords(passageText);
  if (contentWords.length === 0) return 100;
  const typedLower = typedText.toLowerCase().replace(/[^a-z\s]/g, '');
  const matched = contentWords.filter((w) => typedLower.includes(w));
  return Math.round((matched.length / contentWords.length) * 100);
}

/**
 * Speak text using the Web Speech API.
 * Returns a cancel function. 50ms delay after cancel() works around a Chrome
 * bug where speak() silently fails if called synchronously after cancel().
 */
function speakPassage(
  text: string,
  voiceName: string | null,
  rate: number,
  onEnd?: () => void,
): () => void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.();
    return () => {};
  }
  window.speechSynthesis.cancel();
  const delayId = setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
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

export function useDictationEngine(
  passageText: string,
  mode: 'sequential' | 'simultaneous' = 'sequential',
): DictationEngine {
  const { settings } = useSettings();
  const voiceNameRef = useRef(settings.voiceName);
  voiceNameRef.current = settings.voiceName;
  const speechRateRef = useRef(settings.speechRate);
  speechRateRef.current = settings.speechRate;

  const [state, setState] = useState<DictationState>({
    phase: 'idle',
    input: '',
    coverageScore: 0,
    replayCount: 0,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const cancelSpeechRef = useRef<(() => void) | null>(null);

  // When phase transitions to 'listening', speak the passage
  useEffect(() => {
    if (state.phase !== 'listening') return;

    const transitionToTyping = () => {
      clearTimeout(timerRef.current);
      setState((prev) => (prev.phase === 'listening' ? { ...prev, phase: 'typing' } : prev));
    };

    const speak = () => {
      cancelSpeechRef.current = speakPassage(passageText, voiceNameRef.current, speechRateRef.current, transitionToTyping);
      timerRef.current = setTimeout(transitionToTyping, SPEECH_FALLBACK_TIMEOUT);
    };

    // Wait for voices to load on first mount (some browsers)
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
  }, [state.phase, state.replayCount, passageText]);

  const startListening = useCallback(() => {
    if (mode === 'simultaneous') {
      setState((prev) => (prev.phase === 'idle' ? { ...prev, phase: 'typing', replayCount: 1 } : prev));
    } else {
      setState((prev) => (prev.phase === 'idle' ? { ...prev, phase: 'listening' } : prev));
    }
  }, [mode]);

  const setInput = useCallback((value: string) => {
    setState((prev) => ({ ...prev, input: value }));
  }, []);

  const submitAnswer = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'typing') return prev;
      const score = computeCoverageScore(passageText, prev.input);
      return { ...prev, phase: 'done', coverageScore: score };
    });
  }, [passageText]);

  const replayPassage = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'typing') return prev;
      cancelSpeechRef.current?.();
      return { ...prev, replayCount: prev.replayCount + 1 };
    });
  }, []);

  // Re-speak when replayCount increments during typing phase
  useEffect(() => {
    if (state.phase !== 'typing' || state.replayCount === 0) return;
    cancelSpeechRef.current = speakPassage(passageText, voiceNameRef.current, speechRateRef.current);
    return () => {
      cancelSpeechRef.current?.();
    };
  }, [state.replayCount, state.phase, passageText]);

  const reset = useCallback(() => {
    cancelSpeechRef.current?.();
    clearTimeout(timerRef.current);
    setState({ phase: 'idle', input: '', coverageScore: 0, replayCount: 0 });
  }, []);

  return { state, startListening, setInput, submitAnswer, replayPassage, reset };
}
