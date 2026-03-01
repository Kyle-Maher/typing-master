import React from 'react';
import clsx from 'clsx';
import styles from './CharacterDisplay.module.css';

export type CharState = 'pending' | 'incorrect' | 'current';

interface CharacterDisplayProps {
  char: string;
  state: CharState;
}

export const CharacterDisplay = React.memo(function CharacterDisplay({ char, state }: CharacterDisplayProps) {
  return (
    <span className={clsx(styles.char, styles[state])} aria-hidden="true">
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
});
