import type { SpellingPhase } from '@/hooks/useSpellingEngine';
import styles from './WordPrompt.module.css';

interface WordPromptProps {
  word: string;
  hint?: string;
  sentence?: string;
  phase: SpellingPhase;
  showHint: boolean;
  showSentence: boolean;
  onRevealHint: () => void;
  onRevealSentence: () => void;
  onReplay: () => void;
}

export function WordPrompt({ word, hint, sentence, phase, showHint, showSentence, onRevealHint, onRevealSentence, onReplay }: WordPromptProps) {
  return (
    <div className={styles.prompt}>
      <div className={styles.wordContainer}>
        {phase === 'showing' ? (
          <span className={styles.hidden}>Listening...</span>
        ) : phase === 'result' ? (
          <span className={styles.word}>{word}</span>
        ) : (
          <span className={styles.hidden}>{'_ '.repeat(word.length).trim()}</span>
        )}
      </div>
      {phase === 'typing' && (
        <div className={styles.hintArea}>
          <button className={styles.hintButton} onClick={onReplay}>
            Hear Again
          </button>
          {hint && (
            showHint ? (
              <p className={styles.hint}>{hint}</p>
            ) : (
              <button className={styles.hintButton} onClick={onRevealHint}>
                Show Hint
              </button>
            )
          )}
          {sentence && (
            showSentence ? (
              <p className={styles.hint}>{sentence}</p>
            ) : (
              <button className={styles.hintButton} onClick={onRevealSentence}>
                Show in Sentence
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
