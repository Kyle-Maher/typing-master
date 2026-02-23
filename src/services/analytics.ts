import type { UserProgress, LessonResult } from '@/types/user';

export interface WpmOverTime {
  date: string;
  wpm: number;
  accuracy: number;
}

export interface CategoryProgress {
  category: string;
  completed: number;
  total: number;
}

export function getWpmOverTime(progress: UserProgress): WpmOverTime[] {
  const byDate = new Map<string, { totalWpm: number; totalAcc: number; count: number }>();

  for (const result of progress.lessonHistory) {
    const date = result.completedAt.split('T')[0]!;
    const existing = byDate.get(date) ?? { totalWpm: 0, totalAcc: 0, count: 0 };
    existing.totalWpm += result.wpm;
    existing.totalAcc += result.accuracy;
    existing.count += 1;
    byDate.set(date, existing);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      wpm: Math.round(data.totalWpm / data.count),
      accuracy: Math.round(data.totalAcc / data.count),
    }));
}

export function getTopProblemKeys(progress: UserProgress, limit = 10): { key: string; count: number }[] {
  return Object.entries(progress.problemKeys)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

export function getTopProblemWords(progress: UserProgress, limit = 10): { word: string; count: number }[] {
  return Object.entries(progress.problemWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

export function getAverageWpm(progress: UserProgress): number {
  if (progress.lessonHistory.length === 0) return 0;
  const total = progress.lessonHistory.reduce((sum, r) => sum + r.wpm, 0);
  return Math.round(total / progress.lessonHistory.length);
}

export function getAverageAccuracy(progress: UserProgress): number {
  if (progress.lessonHistory.length === 0) return 0;
  const total = progress.lessonHistory.reduce((sum, r) => sum + r.accuracy, 0);
  return Math.round(total / progress.lessonHistory.length);
}

export function getLessonsPerDay(progress: UserProgress): { date: string; count: number }[] {
  const byDate = new Map<string, number>();
  for (const result of progress.lessonHistory) {
    const date = result.completedAt.split('T')[0]!;
    byDate.set(date, (byDate.get(date) ?? 0) + 1);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export function getRecentBest(progress: UserProgress): LessonResult | null {
  if (progress.lessonHistory.length === 0) return null;
  return progress.lessonHistory.reduce((best, r) => (r.wpm > best.wpm ? r : best));
}
