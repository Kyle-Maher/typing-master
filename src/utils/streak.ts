/** Calculate streak based on last practice date */
export function updateStreak(
  currentStreak: number,
  longestStreak: number,
  lastPracticeDate: string | null,
): { currentStreak: number; longestStreak: number } {
  const today = new Date().toISOString().split('T')[0]!;

  if (!lastPracticeDate) {
    return { currentStreak: 1, longestStreak: Math.max(longestStreak, 1) };
  }

  if (lastPracticeDate === today) {
    return { currentStreak, longestStreak };
  }

  const last = new Date(lastPracticeDate);
  const now = new Date(today);
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    const newStreak = currentStreak + 1;
    return { currentStreak: newStreak, longestStreak: Math.max(longestStreak, newStreak) };
  }

  // Streak broken
  return { currentStreak: 1, longestStreak: Math.max(longestStreak, currentStreak) };
}
