import type { UserProfile, UserProgress, UserSettings } from '@/types/user';

const SCHEMA_VERSION = 1;
const STORAGE_KEYS = {
  schemaVersion: 'tm_schema_version',
  profiles: 'tm_profiles',
  activeProfileId: 'tm_active_profile_id',
  progress: (id: string) => `tm_progress_${id}`,
} as const;

function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function migrateIfNeeded(): void {
  const version = getItem<number>(STORAGE_KEYS.schemaVersion);
  if (version === SCHEMA_VERSION) return;
  // Future migrations go here
  setItem(STORAGE_KEYS.schemaVersion, SCHEMA_VERSION);
}

// --- Profiles ---

export function getProfiles(): UserProfile[] {
  migrateIfNeeded();
  return getItem<UserProfile[]>(STORAGE_KEYS.profiles) ?? [];
}

export function saveProfiles(profiles: UserProfile[]): void {
  setItem(STORAGE_KEYS.profiles, profiles);
}

export function getActiveProfileId(): string | null {
  return getItem<string>(STORAGE_KEYS.activeProfileId);
}

export function setActiveProfileId(id: string): void {
  setItem(STORAGE_KEYS.activeProfileId, id);
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  soundEnabled: true,
  showKeyboard: true,
  fontSize: 'medium',
};

export function createProfile(name: string): UserProfile {
  const profile: UserProfile = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    settings: { ...DEFAULT_SETTINGS },
  };
  const profiles = getProfiles();
  profiles.push(profile);
  saveProfiles(profiles);
  return profile;
}

export function updateProfile(profile: UserProfile): void {
  const profiles = getProfiles();
  const idx = profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) {
    profiles[idx] = profile;
    saveProfiles(profiles);
  }
}

// --- Progress ---

export function getProgress(profileId: string): UserProgress {
  const saved = getItem<UserProgress>(STORAGE_KEYS.progress(profileId));
  if (saved) return saved;
  return createDefaultProgress(profileId);
}

export function saveProgress(progress: UserProgress): void {
  setItem(STORAGE_KEYS.progress(progress.profileId), progress);
}

function createDefaultProgress(profileId: string): UserProgress {
  return {
    profileId,
    completedLessons: {},
    bestResults: {},
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    problemKeys: {},
    problemWords: {},
    customWordLists: [],
    lessonHistory: [],
    spellingHistory: [],
  };
}

// --- Export/Import ---

export function exportUserData(profileId: string): string {
  const profiles = getProfiles();
  const profile = profiles.find((p) => p.id === profileId);
  const progress = getProgress(profileId);
  return JSON.stringify({ profile, progress, schemaVersion: SCHEMA_VERSION }, null, 2);
}

export function importUserData(json: string): { profile: UserProfile; progress: UserProgress } {
  const data = JSON.parse(json) as { profile: UserProfile; progress: UserProgress };
  const profiles = getProfiles();
  const existingIdx = profiles.findIndex((p) => p.id === data.profile.id);
  if (existingIdx >= 0) {
    profiles[existingIdx] = data.profile;
  } else {
    profiles.push(data.profile);
  }
  saveProfiles(profiles);
  saveProgress(data.progress);
  return data;
}
