import { LessonList } from '@/components/lessons/LessonList';
import styles from './LessonsPage.module.css';

export function LessonsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Lessons</h1>
      <p className={styles.subtitle}>Progress through structured lessons to build your typing skills.</p>
      <LessonList />
    </div>
  );
}
