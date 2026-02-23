import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/common/Button';
import styles from './HomePage.module.css';

export function HomePage() {
  const { profile, progress, createProfile } = useUser();
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

  const completedCount = progress ? Object.keys(progress.completedLessons).length : 0;
  const totalPoints = progress?.totalPoints ?? 0;

  return (
    <div className={styles.dashboard}>
      <div className={styles.hero}>
        <h1 className={styles.greeting}>Welcome back, {profile.name}!</h1>
        <p className={styles.subtitle}>Ready to practice?</p>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{completedCount}</span>
          <span className={styles.statLabel}>Lessons Done</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalPoints}</span>
          <span className={styles.statLabel}>Total Points</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{progress?.currentStreak ?? 0}</span>
          <span className={styles.statLabel}>Day Streak</span>
        </div>
      </div>

      <div className={styles.quickStart}>
        <h2 className={styles.sectionTitle}>Quick Start</h2>
        <div className={styles.actions}>
          <Button size="lg" onClick={() => navigate('/lessons')}>
            Browse Lessons
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/typing')}>
            Free Practice
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/spelling')}>
            Spelling Practice
          </Button>
        </div>
      </div>

      {progress && progress.lessonHistory.length > 0 && (
        <div className={styles.recent}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <div className={styles.recentList}>
            {progress.lessonHistory.slice(-5).reverse().map((result) => (
              <div key={result.id} className={styles.recentItem}>
                <span className={styles.recentLesson}>{result.lessonId}</span>
                <span className={styles.recentWpm}>{result.wpm} WPM</span>
                <span className={styles.recentAcc}>{result.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
