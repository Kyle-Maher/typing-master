import { useEffect, useRef } from 'react';
import { CharacterDisplay, type CharState } from './CharacterDisplay';
import { useSound } from '@/hooks/useSound';
import { useSettings } from '@/context/SettingsContext';
import type { TypingEngine } from '@/hooks/useTypingEngine';
import styles from './TypingArea.module.css';

interface TypingAreaProps {
  engine: TypingEngine;
}

export function TypingArea({ engine }: TypingAreaProps) {
  const { text, state, handleKey } = engine;
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const { playSuccess, playError } = useSound();
  const { settings } = useSettings();
  const zenMode = settings.zenMode;
  const prevCursorRef = useRef(0);

  // Stable ref so the keydown listener never needs to be re-attached
  const handleKeyRef = useRef(handleKey);
  handleKeyRef.current = handleKey;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.length === 1 || e.key === 'Backspace') {
        e.preventDefault();
      }
      handleKeyRef.current(e.key);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-scroll to keep cursor visible + sound feedback + shake on error
  useEffect(() => {
    cursorRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    if (state.cursor > prevCursorRef.current) {
      if (state.isComplete) {
        playSuccess();
      } else if (state.correct[state.cursor - 1] === false) {
        playError();
      }
    }
    prevCursorRef.current = state.cursor;
  }, [state.cursor, state.isComplete, state.correct, playSuccess, playError]);

  const getCharState = (index: number): CharState => {
    if (index === state.cursor) return zenMode ? 'pending' : 'current';
    if (index < state.cursor) return state.correct[index] ? 'pending' : 'incorrect';
    return 'pending';
  };

  // Group chars into words (splitting on spaces) to prevent mid-word line breaks
  const words: { chars: string[]; startIndex: number }[] = [];
  let wordStart = 0;
  for (let i = 0; i <= text.length; i++) {
    if (i === text.length || text[i] === ' ') {
      if (i > wordStart) words.push({ chars: text.slice(wordStart, i).split(''), startIndex: wordStart });
      if (i < text.length) words.push({ chars: [' '], startIndex: i });
      wordStart = i + 1;
    }
  }

  return (
    <div
      className={styles.container}
      ref={containerRef}
      tabIndex={0}
      role="textbox"
      aria-label="Typing area"
      aria-live="off"
    >
      <div className={styles.text}>
        {words.map((word) => (
          <span key={word.startIndex} className={styles.word}>
            {word.chars.map((char, j) => {
              const i = word.startIndex + j;
              return (
                <span key={i} ref={i === state.cursor ? cursorRef : undefined}>
                  <CharacterDisplay char={char} state={getCharState(i)} />
                </span>
              );
            })}
          </span>
        ))}
      </div>
      {state.isComplete && (
        <div className={styles.complete} aria-live="assertive">
          Complete! Press Enter to view results, or click Retry.
        </div>
      )}
    </div>
  );
}
