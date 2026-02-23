export type LessonCategory = 'home-row' | 'common-words' | 'sentences' | 'paragraphs' | 'custom';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  difficulty: DifficultyLevel;
  text: string;
  /** Order within category for unlock progression */
  order: number;
}
