import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { CustomWordListEditor } from '@/components/profile/CustomWordListEditor';
import { Button } from '@/components/common/Button';
import { exportUserData, importUserData } from '@/services/storage';
import { useToast } from '@/components/common/Toast';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { profile, profiles, switchProfile, createProfile } = useUser();
  const { showToast } = useToast();

  const handleExport = () => {
    if (!profile) return;
    const data = exportUserData(profile.id);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typing-master-${profile.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported!', 'success');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = importUserData(reader.result as string);
          switchProfile(data.profile.id);
          showToast('Data imported!', 'success');
        } catch {
          showToast('Invalid import file', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  if (!profile) {
    return (
      <div className={styles.page}>
        <h1>Profile</h1>
        <p>Create a profile from the home page to get started.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Profile</h1>

      <section>
        <h2 className={styles.sectionTitle}>Settings</h2>
        <ProfileForm />
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Custom Word Lists</h2>
        <CustomWordListEditor />
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Data</h2>
        <div className={styles.dataActions}>
          <Button variant="secondary" onClick={handleExport}>Export Progress</Button>
          <Button variant="secondary" onClick={handleImport}>Import Progress</Button>
        </div>
      </section>

      {profiles.length > 1 && (
        <section>
          <h2 className={styles.sectionTitle}>Switch Profile</h2>
          <div className={styles.profileList}>
            {profiles.filter((p) => p.id !== profile.id).map((p) => (
              <button key={p.id} className={styles.profileItem} onClick={() => switchProfile(p.id)}>
                {p.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className={styles.sectionTitle}>Add Profile</h2>
        <AddProfileInline onCreate={createProfile} />
      </section>
    </div>
  );
}

function AddProfileInline({ onCreate }: { onCreate: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <div className={styles.addProfile}>
      <input
        className={styles.addInput}
        placeholder="New profile name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) { onCreate(name.trim()); setName(''); } }}
      />
      <Button size="sm" onClick={() => { if (name.trim()) { onCreate(name.trim()); setName(''); } }} disabled={!name.trim()}>
        Create
      </Button>
    </div>
  );
}
