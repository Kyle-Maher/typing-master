export interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  showKeyboard: boolean;
  fontSize: 'small' | 'medium' | 'large';
  zenMode: boolean;
}

export interface ErrorDetail {
  expected: string;
  typed: string;
  position: number;
  timestamp: number;
}

export interface LessonResult {
  id: string;
  lessonId: string;
  profileId: string;
  wpm: number;
  netWpm: number;
  accuracy: number;
  errors: ErrorDetail[];
  problemKeys: Record<string, number>;
  timeSeconds: number;
  points: number;
  stars: number; // 1-3
  completedAt: string;
}

export interface SpellingResult {
  id: string;
  lessonId: string;
  profileId: string;
  correctCount: number;
  totalWords: number;
  accuracy: number;
  results: { word: string; correct: boolean; attempts: number }[];
  points: number;
  completedAt: string;
}

export interface DictationResult {
  id: string;
  passageId: string;
  profileId: string;
  coverageScore: number; // 0–100
  typedText: string;
  points: number;
  completedAt: string;
}

export interface CustomWordList {
  id: string;
  name: string;
  words: string[];
  createdAt: string;
}

export interface UserProgress {
  profileId: string;
  completedLessons: Record<string, LessonResult>;
  bestResults: Record<string, LessonResult>;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  problemKeys: Record<string, number>;
  problemWords: Record<string, number>;
  customWordLists: CustomWordList[];
  lessonHistory: LessonResult[];
  spellingHistory: SpellingResult[];
  dictationHistory: DictationResult[];
}
