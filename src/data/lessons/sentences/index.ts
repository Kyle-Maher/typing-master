import type { Lesson } from '@/types/lesson';
import accuracy from './accuracy';
// Add new batches here: import numbers from './numbers';

export const sentenceLessons: Lesson[] = [
  ...accuracy,
  // ...numbers,
].sort((a, b) => a.order - b.order);
