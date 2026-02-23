import type { SpellingLesson } from '@/types/spelling';
import { grade1 } from './grade-1';
import { grade3 } from './grade-3';
import { advanced } from './advanced';

const allSpellingLessons: SpellingLesson[] = [grade1, grade3, advanced];

export function getAllSpellingLessons(): SpellingLesson[] {
  return allSpellingLessons;
}

export function getSpellingLessonById(id: string): SpellingLesson | undefined {
  return allSpellingLessons.find((l) => l.id === id);
}
