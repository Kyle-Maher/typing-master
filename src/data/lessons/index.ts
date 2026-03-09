import type { Lesson, LessonCategory, DifficultyLevel } from '@/types/lesson';
import type { CustomWordList } from '@/types/user';
import { homeRowLessons } from './home-row';
import { commonWordsLessons } from './common-words';
import { sentenceLessons } from './sentences';
import { paragraphLessons } from './paragraphs';

const allLessons: Lesson[] = [
  ...homeRowLessons,
  ...commonWordsLessons,
  ...sentenceLessons,
  ...paragraphLessons,
];

export function getAllLessons(customLists?: CustomWordList[]): Lesson[] {
  return [...allLessons, ...generateCustomLessons(customLists)];
}

export function getLessonById(id: string, customLists?: CustomWordList[]): Lesson | undefined {
  return getAllLessons(customLists).find((l) => l.id === id);
}

export function generateCustomLessons(customLists?: CustomWordList[]): Lesson[] {
  if (!customLists || customLists.length === 0) return [];
  return customLists.map((list, i) => ({
    id: `custom-${list.id}`,
    title: list.name,
    description: `Custom word list: ${list.words.length} words`,
    category: 'custom' as LessonCategory,
    difficulty: 'beginner' as DifficultyLevel,
    text: list.words.join(' '),
    order: i + 1,
  }));
}

export function getLessonsByCategory(category: LessonCategory): Lesson[] {
  return allLessons.filter((l) => l.category === category).sort((a, b) => a.order - b.order);
}

export function getLessonsByDifficulty(difficulty: DifficultyLevel): Lesson[] {
  return allLessons.filter((l) => l.difficulty === difficulty);
}

export function getCategories(): { id: LessonCategory; label: string }[] {
  return [
    { id: 'home-row', label: 'Digraphs & Chunks' },
    { id: 'common-words', label: 'High-Frequency Words' },
    { id: 'sentences', label: 'Accuracy Training' },
    { id: 'paragraphs', label: 'Speed Building' },
    { id: 'custom', label: 'Custom' },
  ];
}

/** Check if a lesson is unlocked. First in each category is free; rest require 80%+ on previous.
 *  When bestResults is provided, it's preferred for the accuracy check (prevents re-locking on poor retry).
 */
export function isLessonUnlocked(
  lessonId: string,
  completedLessons: Record<string, { accuracy: number }>,
  bestResults?: Record<string, { accuracy: number }>,
): boolean {
  // Custom lessons are always unlocked (getLessonById needs customLists which isn't available here)
  if (lessonId.startsWith('custom-')) return true;

  const lesson = getLessonById(lessonId);
  if (!lesson) return false;

  // First lesson in category is always unlocked
  if (lesson.order === 1) return true;

  // Find previous lesson in same category
  const categoryLessons = getLessonsByCategory(lesson.category);
  const prevLesson = categoryLessons.find((l) => l.order === lesson.order - 1);
  if (!prevLesson) return true;

  // Prefer bestResults to avoid re-locking when a retry scores lower
  const prevResult = bestResults?.[prevLesson.id] ?? completedLessons[prevLesson.id];
  return prevResult !== undefined && prevResult.accuracy >= 80;
}
