import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { UserProfile, UserProgress, LessonResult, SpellingResult, DictationResult } from '@/types/user';
import * as storage from '@/services/storage';
import { updateStreak } from '@/utils/streak';
import { getLessonById } from '@/data/lessons';
import { extractMissedWords } from '@/utils/missedWords';

interface UserContextValue {
  profile: UserProfile | null;
  progress: UserProgress | null;
  profiles: UserProfile[];
  createProfile: (name: string) => UserProfile;
  switchProfile: (id: string) => void;
  updateProfile: (profile: UserProfile) => void;
  updateProgress: (progress: UserProgress) => void;
  addLessonResult: (result: LessonResult) => void;
  addSpellingResult: (result: SpellingResult) => void;
  addDictationResult: (result: DictationResult) => void;
  addWordsToSpellingList: (words: string[]) => void;
  clearHistory: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => storage.getProfiles());
  const [activeId, setActiveId] = useState<string | null>(() => storage.getActiveProfileId());
  const [progress, setProgress] = useState<UserProgress | null>(null);

  const profile = profiles.find((p) => p.id === activeId) ?? null;

  useEffect(() => {
    if (activeId) {
      setProgress(storage.getProgress(activeId));
    }
  }, [activeId]);

  const handleCreateProfile = useCallback((name: string) => {
    const newProfile = storage.createProfile(name);
    setProfiles(storage.getProfiles());
    storage.setActiveProfileId(newProfile.id);
    setActiveId(newProfile.id);
    return newProfile;
  }, []);

  const handleSwitchProfile = useCallback((id: string) => {
    storage.setActiveProfileId(id);
    setActiveId(id);
  }, []);

  const handleUpdateProfile = useCallback((updated: UserProfile) => {
    storage.updateProfile(updated);
    setProfiles(storage.getProfiles());
  }, []);

  const handleUpdateProgress = useCallback((updated: UserProgress) => {
    storage.saveProgress(updated);
    setProgress(updated);
  }, []);

  const handleAddLessonResult = useCallback(
    (result: LessonResult) => {
      if (!progress) return;
      const updated: UserProgress = {
        ...progress,
        completedLessons: { ...progress.completedLessons, [result.lessonId]: result },
        lessonHistory: [...progress.lessonHistory, result],
        totalPoints: progress.totalPoints + result.points,
      };

      // Update best result
      const currentBest = progress.bestResults[result.lessonId];
      if (!currentBest || result.wpm > currentBest.wpm) {
        updated.bestResults = { ...progress.bestResults, [result.lessonId]: result };
      }

      // Merge problem keys
      const newProblemKeys = { ...progress.problemKeys };
      for (const [key, count] of Object.entries(result.problemKeys)) {
        newProblemKeys[key] = (newProblemKeys[key] ?? 0) + count;
      }
      updated.problemKeys = newProblemKeys;

      // Extract problem words from error positions
      const lesson = getLessonById(result.lessonId, progress.customWordLists);
      if (lesson && result.errors.length > 0) {
        const missed = extractMissedWords(lesson.text, result.errors);
        const newProblemWords = { ...progress.problemWords };
        for (const word of missed) {
          newProblemWords[word] = (newProblemWords[word] ?? 0) + 1;
        }
        updated.problemWords = newProblemWords;
      }

      // Cap lesson history to 500 entries
      if (updated.lessonHistory.length > 500) {
        updated.lessonHistory = updated.lessonHistory.slice(-500);
      }

      // Update streak
      const streakUpdate = updateStreak(progress.currentStreak, progress.longestStreak, progress.lastPracticeDate);
      updated.currentStreak = streakUpdate.currentStreak;
      updated.longestStreak = streakUpdate.longestStreak;
      updated.lastPracticeDate = new Date().toISOString().split('T')[0]!;

      handleUpdateProgress(updated);
    },
    [progress, handleUpdateProgress],
  );

  const handleAddSpellingResult = useCallback(
    (result: SpellingResult) => {
      if (!progress) return;
      const spellingHistory = [...(progress.spellingHistory ?? []), result];
      if (spellingHistory.length > 500) {
        spellingHistory.splice(0, spellingHistory.length - 500);
      }
      const updated: UserProgress = {
        ...progress,
        spellingHistory,
        totalPoints: progress.totalPoints + result.points,
      };

      const streakUpdate = updateStreak(progress.currentStreak, progress.longestStreak, progress.lastPracticeDate);
      updated.currentStreak = streakUpdate.currentStreak;
      updated.longestStreak = streakUpdate.longestStreak;
      updated.lastPracticeDate = new Date().toISOString().split('T')[0]!;

      handleUpdateProgress(updated);
    },
    [progress, handleUpdateProgress],
  );

  const handleAddDictationResult = useCallback(
    (result: DictationResult) => {
      if (!progress) return;
      const dictationHistory = [...(progress.dictationHistory ?? []), result];
      if (dictationHistory.length > 500) {
        dictationHistory.splice(0, dictationHistory.length - 500);
      }
      const updated: UserProgress = {
        ...progress,
        dictationHistory,
        totalPoints: progress.totalPoints + result.points,
      };

      const streakUpdate = updateStreak(progress.currentStreak, progress.longestStreak, progress.lastPracticeDate);
      updated.currentStreak = streakUpdate.currentStreak;
      updated.longestStreak = streakUpdate.longestStreak;
      updated.lastPracticeDate = new Date().toISOString().split('T')[0]!;

      handleUpdateProgress(updated);
    },
    [progress, handleUpdateProgress],
  );

  const handleAddWordsToSpellingList = useCallback(
    (words: string[]) => {
      if (!progress) return;
      const lists = [...(progress.customWordLists ?? [])];
      const idx = lists.findIndex((l) => l.id === 'personal-spelling');
      if (idx >= 0) {
        const existing = new Set(lists[idx]!.words);
        const merged = [...lists[idx]!.words, ...words.filter((w) => !existing.has(w))];
        lists[idx] = { ...lists[idx]!, words: merged };
      } else {
        lists.unshift({
          id: 'personal-spelling',
          name: 'My Spelling Words',
          words: [...new Set(words)],
          createdAt: new Date().toISOString(),
        });
      }
      handleUpdateProgress({ ...progress, customWordLists: lists });
    },
    [progress, handleUpdateProgress],
  );

  const handleClearHistory = useCallback(() => {
    if (!progress) return;
    handleUpdateProgress({
      ...progress,
      completedLessons: {},
      bestResults: {},
      lessonHistory: [],
      spellingHistory: [],
      dictationHistory: [],
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
      problemKeys: {},
      problemWords: {},
    });
  }, [progress, handleUpdateProgress]);

  return (
    <UserContext.Provider
      value={{
        profile,
        progress,
        profiles,
        createProfile: handleCreateProfile,
        switchProfile: handleSwitchProfile,
        updateProfile: handleUpdateProfile,
        updateProgress: handleUpdateProgress,
        addLessonResult: handleAddLessonResult,
        addSpellingResult: handleAddSpellingResult,
        addDictationResult: handleAddDictationResult,
        addWordsToSpellingList: handleAddWordsToSpellingList,
        clearHistory: handleClearHistory,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
