import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { useKeyboardInput } from '@/hooks/useKeyboardInput';
import { TypingArea } from '@/components/typing/TypingArea';
import { LiveStats } from '@/components/typing/LiveStats';
import { KeyboardDisplay } from '@/components/keyboard/KeyboardDisplay';
import { Button } from '@/components/common/Button';
import { useUser } from '@/context/UserContext';
import { useSettings } from '@/context/SettingsContext';
import { getLessonById } from '@/data/lessons/index';
import { calculatePoints, calculateStars } from '@/services/scoring';
import type { LessonResult } from '@/types/user';
import styles from './TypingPracticePage.module.css';

const DEFAULT_TEXT = 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.';

export function TypingPracticePage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { profile, progress, addLessonResult } = useUser();
  const { settings } = useSettings();
  const { pressedKeys } = useKeyboardInput();

  const lesson = lessonId ? getLessonById(lessonId, progress?.customWordLists) : undefined;
  const engine = useTypingEngine(lesson?.text ?? DEFAULT_TEXT);

  const targetChar = engine.text[engine.state.cursor];

  const handleFinish = useCallback(() => {
    if (!profile || !engine.state.isComplete) return;
    const result: LessonResult = {
      id: crypto.randomUUID(),
      lessonId: lessonId ?? 'free-practice',
      profileId: profile.id,
      wpm: engine.wpm,
      netWpm: engine.netWpm,
      accuracy: engine.accuracy,
      errors: engine.state.errors,
      problemKeys: engine.state.problemKeys,
      timeSeconds: Math.round(engine.elapsedMs / 1000),
      points: calculatePoints(
        Math.round(engine.text.split(' ').length),
        engine.wpm,
        engine.accuracy,
        lesson?.difficulty ?? 'beginner',
        progress?.currentStreak ?? 0,
      ),
      stars: calculateStars(engine.accuracy, engine.wpm),
      completedAt: new Date().toISOString(),
    };
    addLessonResult(result);
    navigate(`/results/${result.lessonId}`);
  }, [profile, engine, lessonId, lesson, progress, addLessonResult, navigate]);

  useEffect(() => {
    if (!engine.state.isComplete) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleFinish();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [engine.state.isComplete, handleFinish]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{lesson?.title ?? 'Free Practice'}</h1>
      <LiveStats
        wpm={engine.wpm}
        accuracy={engine.accuracy}
        elapsedMs={engine.elapsedMs}
        errorCount={engine.errorCount}
      />
      <TypingArea engine={engine} />
      {settings.showKeyboard && (
        <KeyboardDisplay pressedKeys={pressedKeys} targetKey={targetChar} />
      )}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => engine.reset()}>
          Retry
        </Button>
        {engine.state.isComplete && (
          <Button onClick={handleFinish}>
            View Results
          </Button>
        )}
      </div>
    </div>
  );
}
