import { QWERTY_LAYOUT, charToKey } from '@/data/keyboard-layouts';
import { Key } from './Key';
import styles from './KeyboardDisplay.module.css';

interface KeyboardDisplayProps {
  pressedKeys: Set<string>;
  targetKey?: string;
  errorKey?: string;
}

export function KeyboardDisplay({ pressedKeys, targetKey, errorKey }: KeyboardDisplayProps) {
  const targetKeyLower = targetKey ? charToKey(targetKey) : undefined;

  return (
    <div className={styles.keyboard} aria-hidden="true">
      {QWERTY_LAYOUT.map((row, rowIdx) => (
        <div key={rowIdx} className={styles.row}>
          {row.map((keyData) => {
            const isPressed = pressedKeys.has(keyData.key) || pressedKeys.has(keyData.key.toLowerCase());
            const isTarget = targetKeyLower === keyData.key.toLowerCase();
            const isError = errorKey === keyData.key.toLowerCase();
            return (
              <Key
                key={keyData.key}
                data={keyData}
                isPressed={isPressed}
                isTarget={isTarget}
                isError={isError}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
