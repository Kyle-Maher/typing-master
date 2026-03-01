import { useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/common/Button';
import { getLessonById, getLessonsByCategory } from '@/data/lessons';
import styles from './ResultsPage.module.css';

export function ResultsPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { progress } = useUser();

  const lastResult = useMemo(() => {
    if (!progress || progress.lessonHistory.length === 0) return undefined;
    if (lessonId) {
      // Find the most recent result for this lesson
      for (let i = progress.lessonHistory.length - 1; i >= 0; i--) {
        if (progress.lessonHistory[i]!.lessonId === lessonId) {
          return progress.lessonHistory[i];
        }
      }
    }
    // Fallback to last entry
    return progress.lessonHistory[progress.lessonHistory.length - 1];
  }, [progress, lessonId]);

  const bestResult = progress?.bestResults[lastResult?.lessonId ?? ''];
  const isNewBest = lastResult != null && bestResult != null && lastResult.id === bestResult.id;

  const goToNextLesson = useCallback(() => {
    if (!lastResult) return;
    const lesson = getLessonById(lastResult.lessonId);
    if (lesson) {
      const categoryLessons = getLessonsByCategory(lesson.category);
      const nextLesson = categoryLessons.find((l) => l.order === lesson.order + 1);
      if (nextLesson) {
        navigate(`/typing/${nextLesson.id}`);
        return;
      }
    }
    navigate('/lessons');
  }, [lastResult, navigate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') goToNextLesson();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goToNextLesson]);

  if (!lastResult) {
    return (
      <div className={styles.page}>
        <h1>No Results Yet</h1>
        <p>Complete a lesson to see your results here.</p>
        <Button onClick={() => navigate('/lessons')}>Browse Lessons</Button>
      </div>
    );
  }

  const stars = lastResult.stars;
  const starDisplay = Array.from({ length: 3 }, (_, i) => (i < stars ? '★' : '☆')).join(' ');

  return (
    <div className={styles.page}>
      <div className={styles.stars}>{starDisplay}</div>
      <h1 className={styles.title}>Lesson Complete!</h1>

      {isNewBest && (
        <div className={styles.newBest}>New Personal Best!</div>
      )}
      {!isNewBest && bestResult && (
        <div className={styles.prevBest}>Personal Best: {bestResult.wpm} WPM</div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{lastResult.wpm}</span>
          <span className={styles.statLabel}>WPM</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{lastResult.netWpm}</span>
          <span className={styles.statLabel}>Net WPM</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{lastResult.accuracy}%</span>
          <span className={styles.statLabel}>Accuracy</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{lastResult.timeSeconds}s</span>
          <span className={styles.statLabel}>Time</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{lastResult.points}</span>
          <span className={styles.statLabel}>Points</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{lastResult.errors.length}</span>
          <span className={styles.statLabel}>Errors</span>
        </div>
      </div>

      {Object.keys(lastResult.problemKeys).length > 0 && (
        <div className={styles.problemKeys}>
          <h3>Problem Keys</h3>
          <div className={styles.keyList}>
            {Object.entries(lastResult.problemKeys)
              .sort((a, b) => b[1] - a[1])
              .map(([key, count]) => (
                <span key={key} className={styles.problemKey}>
                  {key === ' ' ? 'Space' : key} ({count})
                </span>
              ))}
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => navigate(`/typing/${lastResult.lessonId}`)}>
          Retry
        </Button>
        <Button onClick={goToNextLesson}>
          Next Lesson
        </Button>
      </div>
    </div>
  );
}
