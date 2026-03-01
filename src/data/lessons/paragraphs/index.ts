import type { Lesson } from '@/types/lesson';
import speed from './speed';
// Add new batches here: import technical from './technical';

export const paragraphLessons: Lesson[] = [
  ...speed,
  // ...technical,
].sort((a, b) => a.order - b.order);
