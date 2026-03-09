import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from '@/context/UserContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ToastProvider } from '@/components/common/Toast';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Navigation } from '@/components/common/Navigation';
import { HomePage } from '@/pages/HomePage';
import { LessonsPage } from '@/pages/LessonsPage';
import { TypingPracticePage } from '@/pages/TypingPracticePage';
import { SpellingPracticePage } from '@/pages/SpellingPracticePage';
import { StatsPage } from '@/pages/StatsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ResultsPage } from '@/pages/ResultsPage';
import { EndlessPracticePage } from '@/pages/EndlessPracticePage';
import { DictationPage } from '@/pages/DictationPage';

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <UserProvider>
        <SettingsProvider>
          <ToastProvider>
            <Navigation />
            <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 1.5rem' }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/lessons" element={<LessonsPage />} />
                <Route path="/typing" element={<TypingPracticePage />} />
                <Route path="/typing/:lessonId" element={<TypingPracticePage />} />
                <Route path="/spelling" element={<SpellingPracticePage />} />
                <Route path="/dictation" element={<DictationPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/results/:lessonId" element={<ResultsPage />} />
                <Route path="/endless" element={<EndlessPracticePage />} />
              </Routes>
            </main>
          </ToastProvider>
        </SettingsProvider>
      </UserProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
