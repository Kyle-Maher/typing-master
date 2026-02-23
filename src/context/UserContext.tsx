import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { UserProfile, UserProgress, LessonResult } from '@/types/user';
import * as storage from '@/services/storage';
import { updateStreak } from '@/utils/streak';

interface UserContextValue {
  profile: UserProfile | null;
  progress: UserProgress | null;
  profiles: UserProfile[];
  createProfile: (name: string) => UserProfile;
  switchProfile: (id: string) => void;
  updateProfile: (profile: UserProfile) => void;
  updateProgress: (progress: UserProgress) => void;
  addLessonResult: (result: LessonResult) => void;
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

      // Update streak
      const streakUpdate = updateStreak(progress.currentStreak, progress.longestStreak, progress.lastPracticeDate);
      updated.currentStreak = streakUpdate.currentStreak;
      updated.longestStreak = streakUpdate.longestStreak;
      updated.lastPracticeDate = new Date().toISOString().split('T')[0]!;

      handleUpdateProgress(updated);
    },
    [progress, handleUpdateProgress],
  );

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
