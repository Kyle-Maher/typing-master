import { useUser } from '@/context/UserContext';
import { getWpmOverTime, getAverageWpm, getAverageAccuracy, getTopProblemKeys } from '@/services/analytics';
import { StatsChart } from '@/components/stats/StatsChart';
import { ProblemKeys } from '@/components/stats/ProblemKeys';
import { StreakDisplay } from '@/components/stats/StreakDisplay';
import styles from './StatsPage.module.css';

export function StatsPage() {
  const { progress } = useUser();

  if (!progress) {
    return (
      <div className={styles.page}>
        <h1>Statistics</h1>
        <p>Create a profile to start tracking your stats.</p>
      </div>
    );
  }

  const wpmData = getWpmOverTime(progress);
  const avgWpm = getAverageWpm(progress);
  const avgAccuracy = getAverageAccuracy(progress);
  const topProblemKeys = getTopProblemKeys(progress);
  const totalLessons = progress.lessonHistory.length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Statistics</h1>
        <StreakDisplay streak={progress.currentStreak} />
      </div>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <span className={styles.cardValue}>{avgWpm}</span>
          <span className={styles.cardLabel}>Avg WPM</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{avgAccuracy}%</span>
          <span className={styles.cardLabel}>Avg Accuracy</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{totalLessons}</span>
          <span className={styles.cardLabel}>Lessons Done</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{progress.totalPoints}</span>
          <span className={styles.cardLabel}>Total Points</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{progress.longestStreak}</span>
          <span className={styles.cardLabel}>Best Streak</span>
        </div>
      </div>

      <section>
        <h2 className={styles.sectionTitle}>Progress Over Time</h2>
        <StatsChart data={wpmData} />
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Problem Keys</h2>
        <ProblemKeys problemKeys={progress.problemKeys} />
        {topProblemKeys.length > 0 && (
          <div className={styles.problemList}>
            {topProblemKeys.map(({ key, count }) => (
              <span key={key} className={styles.problemBadge}>
                {key === ' ' ? 'Space' : key}: {count}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
