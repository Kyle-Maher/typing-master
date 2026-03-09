import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import styles from './Navigation.module.css';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/endless', label: 'Endless Practice' },
  { to: '/lessons', label: 'Typing Lessons' },
  { to: '/spelling', label: 'Spelling Practice' },
  { to: '/dictation', label: 'Dictation Practice' },
  { to: '/stats', label: 'Stats' },
  { to: '/profile', label: 'Profile' },
];

export function Navigation() {
  const { profile, progress } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand}>
          Typing Master
        </NavLink>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {profile && (
          <div className={styles.user}>
            <span className={styles.userName}>{profile.name}</span>
            {progress && progress.currentStreak > 0 && (
              <span className={styles.streak} title={`${progress.currentStreak} day streak`}>
                {progress.currentStreak}d
              </span>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
