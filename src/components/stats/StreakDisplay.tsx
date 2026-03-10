import styles from './StreakDisplay.module.css';

interface StreakDisplayProps {
  streak: number;
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  if (streak <= 0) return null;
  return (
    <div className={styles.streak}>
      <span className={styles.flame}>&#128293;</span>
      <span className={styles.count}>{streak}</span>
      <span className={styles.label}>day streak</span>
    </div>
  );
}
