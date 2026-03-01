import { useEffect, useRef, useState } from 'react';
import { CharacterDisplay, type CharState } from './CharacterDisplay';
import { useSound } from '@/hooks/useSound';
import type { TypingEngine } from '@/hooks/useTypingEngine';
import styles from './TypingArea.module.css';

interface TypingAreaProps {
  engine: TypingEngine;
}

export function TypingArea({ engine }: TypingAreaProps) {
  const { text, state, handleKey } = engine;
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const { playKeystroke, playSuccess, playError } = useSound();
  const prevCursorRef = useRef(0);
  const [shaking, setShaking] = useState(false);

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
        setShaking(true);
      } else {
        playKeystroke();
      }
    }
    prevCursorRef.current = state.cursor;
  }, [state.cursor, state.isComplete, state.correct, playKeystroke, playSuccess, playError]);

  // Clear shake after animation completes
  useEffect(() => {
    if (!shaking) return;
    const timer = setTimeout(() => setShaking(false), 300);
    return () => clearTimeout(timer);
  }, [shaking]);

  const getCharState = (index: number): CharState => {
    if (index === state.cursor) return 'current';
    if (index < state.cursor) return state.correct[index] ? 'correct' : 'incorrect';
    return 'pending';
  };

  return (
    <div
      className={`${styles.container} ${shaking ? styles.shake : ''}`}
      ref={containerRef}
      tabIndex={0}
      role="textbox"
      aria-label="Typing area"
      aria-live="off"
    >
      <div className={styles.text}>
        {text.split('').map((char, i) => (
          <span key={i} ref={i === state.cursor ? cursorRef : undefined}>
            <CharacterDisplay char={char} state={getCharState(i)} />
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
