import type { Lesson } from '@/types/lesson';
import chunks from './chunks';
// Add new batches here: import bigrams from './bigrams';

export const homeRowLessons: Lesson[] = [
  ...chunks,
  // ...bigrams,
].sort((a, b) => a.order - b.order);
