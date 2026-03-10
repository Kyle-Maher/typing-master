import type { Lesson } from '@/types/lesson';
import frequency from './frequency';
// Add new batches here: import advanced from './advanced';

export const commonWordsLessons: Lesson[] = [
  ...frequency,
  // ...advanced,
].sort((a, b) => a.order - b.order);
