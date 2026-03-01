import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/common/Button';
import styles from './HomePage.module.css';

const MODES = [
  {
    route: '/endless',
    title: 'Endless Practice',
    description: 'Type continuously without stopping — words keep coming',
    icon: '∞',
  },
  {
    route: '/lessons',
    title: 'Typing Lessons',
    description: 'Structured lessons to build speed and accuracy',
    icon: '⌨',
  },
  {
    route: '/spelling',
    title: 'Spelling Practice',
    description: 'Hear words spoken aloud and type them correctly',
    icon: '🔊',
  },
];

export function HomePage() {
  const { profile, createProfile } = useUser();
  const navigate = useNavigate();
  const [name, setName] = useState('');

  if (!profile) {
    return (
      <div className={styles.welcome}>
        <h1 className={styles.title}>Welcome to Typing Master</h1>
        <p className={styles.subtitle}>Improve your typing speed, accuracy, and spelling skills.</p>
        <div className={styles.createProfile}>
          <input
            className={styles.nameInput}
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) {
                createProfile(name.trim());
              }
            }}
            autoFocus
          />
          <Button onClick={() => { if (name.trim()) createProfile(name.trim()); }} disabled={!name.trim()}>
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modeSelector}>
      <div className={styles.hero}>
        <h1 className={styles.greeting}>Welcome back, {profile.name}!</h1>
        <p className={styles.subtitle}>Choose a mode to get started</p>
      </div>
      <div className={styles.modeGrid}>
        {MODES.map((mode) => (
          <button key={mode.route} className={styles.modeCard} onClick={() => navigate(mode.route)}>
            <span className={styles.modeIcon}>{mode.icon}</span>
            <span className={styles.modeTitle}>{mode.title}</span>
            <span className={styles.modeDesc}>{mode.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
