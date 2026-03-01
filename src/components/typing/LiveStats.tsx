import styles from './LiveStats.module.css';

interface LiveStatsProps {
  wpm: number;
  accuracy: number;
  elapsedMs: number;
  errorCount: number;
  countdownMs?: number | null;
}

export function LiveStats({ wpm, accuracy, elapsedMs, errorCount, countdownMs }: LiveStatsProps) {
  const seconds = Math.floor(elapsedMs / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  let countdownStr: string | null = null;
  if (countdownMs != null) {
    const cdSec = Math.ceil(countdownMs / 1000);
    const cdMin = Math.floor(cdSec / 60);
    const cdS = cdSec % 60;
    countdownStr = `${cdMin}:${cdS.toString().padStart(2, '0')}`;
  }

  return (
    <div className={styles.stats} aria-label="Live typing statistics">
      <div className={styles.stat}>
        <span className={styles.value}>{wpm}</span>
        <span className={styles.label}>WPM</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.value}>{accuracy}%</span>
        <span className={styles.label}>Accuracy</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.value}>{countdownStr ?? timeStr}</span>
        <span className={styles.label}>{countdownStr ? 'Remaining' : 'Time'}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.value}>{errorCount}</span>
        <span className={styles.label}>Errors</span>
      </div>
    </div>
  );
}
