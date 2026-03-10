import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/common/Button';
import type { UserSettings } from '@/types/user';
import styles from './ProfileForm.module.css';

export function ProfileForm() {
  const { profile, updateProfile } = useUser();
  const { settings, updateSettings } = useSettings();
  const [name, setName] = useState(profile?.name ?? '');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const update = () => {
      const all = window.speechSynthesis?.getVoices() ?? [];
      setVoices(all.filter((v) => v.lang.startsWith('en')));
    };
    update();
    window.speechSynthesis?.addEventListener('voiceschanged', update);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', update);
  }, []);

  if (!profile) return null;

  const handleSaveName = () => {
    if (name.trim()) {
      updateProfile({ ...profile, name: name.trim() });
    }
  };

  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>Name</label>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
          />
          <Button size="sm" onClick={handleSaveName}>Save</Button>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Theme</label>
        <select
          className={styles.select}
          value={settings.theme}
          onChange={(e) => updateSettings({ theme: e.target.value as UserSettings['theme'] })}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Font Size</label>
        <select
          className={styles.select}
          value={settings.fontSize}
          onChange={(e) => updateSettings({ fontSize: e.target.value as UserSettings['fontSize'] })}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={settings.showKeyboard}
            onChange={(e) => updateSettings({ showKeyboard: e.target.checked })}
          />
          Show Keyboard Display
        </label>
      </div>

      <div className={styles.field}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
          />
          Sound Effects
        </label>
      </div>

      <div className={styles.field}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={settings.zenMode ?? false}
            onChange={(e) => updateSettings({ zenMode: e.target.checked })}
          />
          Zen Mode (hide cursor)
        </label>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Voice</label>
        <select
          className={styles.select}
          value={settings.voiceName ?? ''}
          onChange={(e) => updateSettings({ voiceName: e.target.value || null })}
        >
          <option value="">Browser Default</option>
          {voices.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name.includes('Natural') || v.name.includes('Online') ? `${v.name} ★` : v.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Speech Rate</label>
        <div className={styles.inputRow}>
          <select
            className={styles.select}
            value={settings.speechRate ?? 0.8}
            onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })}
          >
            <option value={0.6}>Slow</option>
            <option value={0.8}>Normal</option>
            <option value={1.0}>Fast</option>
            <option value={1.2}>Faster</option>
          </select>
          <Button
            size="sm"
            onClick={() => {
              if (!window.speechSynthesis) return;
              window.speechSynthesis.cancel();
              setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance("Hello, let's practice spelling");
                utterance.lang = 'en-US';
                utterance.rate = settings.speechRate ?? 0.8;
                const voice = settings.voiceName
                  ? window.speechSynthesis.getVoices().find((v) => v.name === settings.voiceName) ?? null
                  : null;
                utterance.voice = voice;
                window.speechSynthesis.speak(utterance);
              }, 50);
            }}
          >
            Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
