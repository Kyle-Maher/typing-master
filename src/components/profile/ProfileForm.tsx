import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/common/Button';
import type { UserSettings } from '@/types/user';
import styles from './ProfileForm.module.css';

export function ProfileForm() {
  const { profile, updateProfile } = useUser();
  const { settings, updateSettings } = useSettings();
  const [name, setName] = useState(profile?.name ?? '');

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
    </div>
  );
}
