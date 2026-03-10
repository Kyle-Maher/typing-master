import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { Lesson } from '@/types/lesson';
import styles from './LessonCard.module.css';

interface LessonCardProps {
  lesson: Lesson;
  isUnlocked: boolean;
  isCompleted: boolean;
  bestWpm?: number;
  bestAccuracy?: number;
  bestStars?: number;
}

export function LessonCard({ lesson, isUnlocked, isCompleted, bestWpm, bestAccuracy, bestStars }: LessonCardProps) {
  const navigate = useNavigate();

  const difficultyColor = {
    beginner: styles.beginner,
    intermediate: styles.intermediate,
    advanced: styles.advanced,
  }[lesson.difficulty];

  return (
    <button
      className={clsx(styles.card, { [styles.locked]: !isUnlocked, [styles.completed]: isCompleted })}
      onClick={() => isUnlocked && navigate(`/typing/${lesson.id}`)}
      disabled={!isUnlocked}
      aria-label={`${lesson.title}${!isUnlocked ? ' (locked)' : ''}`}
    >
      <div className={styles.header}>
        <span className={clsx(styles.difficulty, difficultyColor)}>{lesson.difficulty}</span>
        {isCompleted && <span className={styles.checkmark} aria-label="Completed">&#10003;</span>}
        {!isUnlocked && <span className={styles.lock} aria-label="Locked">&#128274;</span>}
      </div>
      <h3 className={styles.title}>{lesson.title}</h3>
      <p className={styles.description}>{lesson.description}</p>
      {isCompleted && bestWpm !== undefined && (
        <div className={styles.best}>
          {bestStars !== undefined && (
            <span className={styles.stars} aria-label={`${bestStars} of 3 stars`}>
              {Array.from({ length: 3 }, (_, i) => (i < bestStars ? '★' : '☆')).join('')}
            </span>
          )}
          <span>{bestWpm} WPM</span>
          <span>{bestAccuracy}%</span>
        </div>
      )}
    </button>
  );
}
