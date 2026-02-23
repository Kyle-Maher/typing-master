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
    { id: 'home-row', label: 'Home Row' },
    { id: 'common-words', label: 'Common Words' },
    { id: 'sentences', label: 'Sentences' },
    { id: 'paragraphs', label: 'Paragraphs' },
    { id: 'custom', label: 'Custom' },
  ];
}

/** Check if a lesson is unlocked. First in each category is free; rest require 80%+ on previous. */
export function isLessonUnlocked(
  lessonId: string,
  completedLessons: Record<string, { accuracy: number }>,
): boolean {
  const lesson = getLessonById(lessonId);
  if (!lesson) return false;

  // First lesson in category is always unlocked
  if (lesson.order === 1) return true;

  // Custom lessons are always unlocked
  if (lesson.category === 'custom') return true;

  // Find previous lesson in same category
  const categoryLessons = getLessonsByCategory(lesson.category);
  const prevLesson = categoryLessons.find((l) => l.order === lesson.order - 1);
  if (!prevLesson) return true;

  const prevResult = completedLessons[prevLesson.id];
  return prevResult !== undefined && prevResult.accuracy >= 80;
}
