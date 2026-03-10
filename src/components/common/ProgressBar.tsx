import clsx from 'clsx';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export function ProgressBar({ value, className, color = 'primary' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={clsx(styles.track, className)} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div className={clsx(styles.fill, styles[color])} style={{ width: `${clamped}%` }} />
    </div>
  );
}
