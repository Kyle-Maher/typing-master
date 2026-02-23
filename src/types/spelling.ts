export interface SpellingWord {
  word: string;
  hint?: string;
  difficulty: number; // 1-5
}

export interface SpellingLesson {
  id: string;
  title: string;
  gradeLevel: string;
  words: SpellingWord[];
}
