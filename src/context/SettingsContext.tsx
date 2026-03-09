import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { UserSettings } from '@/types/user';
import { useUser } from './UserContext';

interface SettingsContextValue {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
}

const defaultSettings: UserSettings = {
  theme: 'light',
  soundEnabled: true,
  showKeyboard: true,
  fontSize: 'medium',
  zenMode: false,
  voiceName: null,
  speechRate: 0.8,
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile } = useUser();

  const settings = profile?.settings ?? defaultSettings;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
  }, [settings.theme, settings.fontSize]);

  const handleUpdateSettings = (partial: Partial<UserSettings>) => {
    if (!profile) return;
    const updated = { ...profile, settings: { ...profile.settings, ...partial } };
    updateProfile(updated);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings: handleUpdateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
