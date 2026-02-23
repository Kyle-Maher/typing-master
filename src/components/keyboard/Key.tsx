import clsx from 'clsx';
import { fingerColor, type KeyData } from '@/data/keyboard-layouts';
import styles from './Key.module.css';

interface KeyProps {
  data: KeyData;
  isPressed: boolean;
  isTarget: boolean;
  isError: boolean;
}

export function Key({ data, isPressed, isTarget, isError }: KeyProps) {
  return (
    <div
      className={clsx(styles.key, {
        [styles.pressed]: isPressed,
        [styles.target]: isTarget && !isError,
        [styles.error]: isError,
      })}
      style={{
        width: `${data.width * 48}px`,
        '--finger-color': fingerColor(data.finger),
      } as React.CSSProperties}
      aria-hidden="true"
    >
      <span className={styles.label}>{data.label}</span>
      {data.shiftLabel && <span className={styles.shiftLabel}>{data.shiftLabel}</span>}
    </div>
  );
}
