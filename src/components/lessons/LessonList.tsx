import { useState } from 'react';
import type { LessonCategory, DifficultyLevel } from '@/types/lesson';
import { getAllLessons, getLessonsByCategory, getCategories, isLessonUnlocked } from '@/data/lessons/index';
import { useUser } from '@/context/UserContext';
import { LessonCard } from './LessonCard';
import styles from './LessonList.module.css';

export function LessonList() {
  const { progress } = useUser();
  const [activeCategory, setActiveCategory] = useState<LessonCategory | 'all'>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyLevel | 'all'>('all');

  const categories = getCategories();
  const completedLessons = progress?.completedLessons ?? {};
  const bestResults = progress?.bestResults ?? {};
  const customLists = progress?.customWordLists;

  let lessons =
    activeCategory === 'all'
      ? getAllLessons(customLists)
      : activeCategory === 'custom'
        ? getAllLessons(customLists).filter((l) => l.category === 'custom')
        : getLessonsByCategory(activeCategory as LessonCategory);
  if (activeDifficulty !== 'all') {
    lessons = lessons.filter((l) => l.difficulty === activeDifficulty);
  }

  const totalLessons = getAllLessons(customLists).length;
  const completedCount = Object.keys(completedLessons).length;

  return (
    <div className={styles.container}>
      <div className={styles.progress}>
        <span>{completedCount} / {totalLessons} lessons completed</span>
      </div>

      <div className={styles.filters}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeCategory === 'all' ? styles.activeTab : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {categories.filter((c) => c.id !== 'custom' || (customLists && customLists.length > 0)).map((cat) => (
            <button
              key={cat.id}
              className={`${styles.tab} ${activeCategory === cat.id ? styles.activeTab : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <select
          className={styles.difficultySelect}
          value={activeDifficulty}
          onChange={(e) => setActiveDifficulty(e.target.value as DifficultyLevel | 'all')}
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div className={styles.grid}>
        {lessons.map((lesson) => {
          const best = bestResults[lesson.id];
          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isUnlocked={isLessonUnlocked(lesson.id, completedLessons, bestResults)}
              isCompleted={!!completedLessons[lesson.id]}
              bestWpm={best?.wpm}
              bestAccuracy={best?.accuracy}
              bestStars={best?.stars}
            />
          );
        })}
      </div>

      {lessons.length === 0 && (
        <p className={styles.empty}>No lessons match your filters.</p>
      )}
    </div>
  );
}
