import { useEffect } from 'react';
import clsx from 'clsx';
import type { SpellingEngine } from '@/hooks/useSpellingEngine';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/common/Button';
import styles from './SpellingArea.module.css';

interface SpellingAreaProps {
  engine: SpellingEngine;
}

export function SpellingArea({ engine }: SpellingAreaProps) {
  const { state, submitAnswer, nextWord, setInput } = engine;
  const progress = ((state.currentIndex + (state.phase === 'done' ? 0 : 0)) / state.totalWords) * 100;

  useEffect(() => {
    if (state.phase !== 'result') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') nextWord();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.phase, nextWord]);

  if (state.phase === 'done') {
    return (
      <div className={styles.done}>
        <h2>Session Complete!</h2>
        <p className={styles.score}>{state.correctCount} / {state.totalWords} correct</p>
        <div className={styles.resultsList}>
          {state.results.map((r, i) => (
            <div key={i} className={clsx(styles.resultItem, r.correct ? styles.correctItem : styles.wrongItem)}>
              <span>{r.word}</span>
              <span>{r.correct ? `Correct (attempt ${r.attempts})` : 'Incorrect'}</span>
            </div>
          ))}
        </div>
        <Button onClick={engine.reset}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className={styles.area}>
      <div className={styles.progressRow}>
        <span className={styles.progressText}>Word {state.currentIndex + 1} of {state.totalWords}</span>
        <ProgressBar value={progress} />
      </div>

      {state.phase === 'typing' && (
        <div className={styles.inputArea}>
          <p className={styles.attemptText}>Attempt {state.attempt} of {state.maxAttempts}</p>
          <input
            className={styles.input}
            type="text"
            value={state.input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && state.input.trim()) submitAnswer();
            }}
            placeholder="Type the word..."
            autoFocus
          />
          <Button onClick={submitAnswer} disabled={!state.input.trim()}>
            Submit
          </Button>
        </div>
      )}

      {state.phase === 'result' && (
        <div className={styles.feedback}>
          {state.results[state.results.length - 1]?.correct ? (
            <p className={styles.correct}>Correct!</p>
          ) : (
            <p className={styles.wrong}>The correct spelling is shown above.</p>
          )}
          <Button onClick={nextWord}>
            {state.currentIndex + 1 < state.totalWords ? 'Next Word' : 'Finish'}
          </Button>
        </div>
      )}

      {state.phase === 'showing' && (
        <p className={styles.showingText}>Listen carefully...</p>
      )}
    </div>
  );
}
