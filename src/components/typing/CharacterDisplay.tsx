import clsx from 'clsx';
import styles from './CharacterDisplay.module.css';

export type CharState = 'pending' | 'correct' | 'incorrect' | 'current';

interface CharacterDisplayProps {
  char: string;
  state: CharState;
}

export function CharacterDisplay({ char, state }: CharacterDisplayProps) {
  return (
    <span className={clsx(styles.char, styles[state])} aria-hidden="true">
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
}
