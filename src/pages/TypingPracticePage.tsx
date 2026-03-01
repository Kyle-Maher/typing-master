import { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { useKeyboardInput } from '@/hooks/useKeyboardInput';
import { TypingArea } from '@/components/typing/TypingArea';
import { LiveStats } from '@/components/typing/LiveStats';
import { KeyboardDisplay } from '@/components/keyboard/KeyboardDisplay';
import { Button } from '@/components/common/Button';
import { useUser } from '@/context/UserContext';
import { useSettings } from '@/context/SettingsContext';
import { getLessonById } from '@/data/lessons/index';
import { paragraphLessons } from '@/data/lessons/paragraphs';
import { calculatePoints, calculateStars } from '@/services/scoring';
import type { LessonResult } from '@/types/user';
import styles from './TypingPracticePage.module.css';

const DEFAULT_TEXT = 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.';

type TimedMode = null | 30 | 60 | 120;

function getTimedText(): string {
  // Concatenate all paragraph lesson texts to provide enough text for timed mode
  return paragraphLessons.map((l) => l.text).join(' ');
}

export function TypingPracticePage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, progress, addLessonResult } = useUser();
  const { settings } = useSettings();
  const { pressedKeys } = useKeyboardInput();
  const [timedMode, setTimedMode] = useState<TimedMode>(null);

  const adaptiveText = (location.state as { adaptiveText?: string } | null)?.adaptiveText;
  const lesson = lessonId ? getLessonById(lessonId, progress?.customWordLists) : undefined;
  const textToUse = timedMode ? getTimedText() : (adaptiveText ?? lesson?.text ?? DEFAULT_TEXT);
  const isAdaptive = !lessonId && !timedMode && !!adaptiveText;
  const engine = useTypingEngine(textToUse);

  const targetChar = engine.text[engine.state.cursor];
  const finishedRef = useRef(false);

  // Timed mode: force complete when time runs out
  const { isStarted, isComplete } = engine.state;
  const { elapsedMs, forceComplete } = engine;
  useEffect(() => {
    if (!timedMode || !isStarted || isComplete) return;
    const remaining = timedMode * 1000 - elapsedMs;
    if (remaining <= 0) {
      forceComplete();
      return;
    }
    const timer = setTimeout(() => forceComplete(), remaining);
    return () => clearTimeout(timer);
  }, [timedMode, isStarted, isComplete, elapsedMs, forceComplete]);

  const handleFinish = useCallback(() => {
    if (!profile || !engine.state.isComplete || finishedRef.current) return;
    finishedRef.current = true;

    const effectiveLessonId = lessonId ?? (timedMode ? `timed-${timedMode}s` : 'free-practice');
    const wordsTyped = engine.state.cursor > 0 ? engine.text.slice(0, engine.state.cursor).split(' ').length : 0;

    const result: LessonResult = {
      id: crypto.randomUUID(),
      lessonId: effectiveLessonId,
      profileId: profile.id,
      wpm: engine.wpm,
      netWpm: engine.netWpm,
      accuracy: engine.accuracy,
      errors: engine.state.errors,
      problemKeys: engine.state.problemKeys,
      timeSeconds: Math.round(engine.elapsedMs / 1000),
      points: calculatePoints(
        wordsTyped,
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
  }, [profile, engine, lessonId, timedMode, lesson, progress, addLessonResult, navigate]);

  useEffect(() => {
    if (engine.state.isComplete) handleFinish();
  }, [engine.state.isComplete, handleFinish]);

  const handleTimedModeChange = (mode: TimedMode) => {
    setTimedMode(mode);
    finishedRef.current = false;
    engine.reset(mode ? getTimedText() : (lesson?.text ?? DEFAULT_TEXT));
  };

  const remainingMs = timedMode && engine.state.isStarted ? Math.max(0, timedMode * 1000 - engine.elapsedMs) : null;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{lesson?.title ?? (timedMode ? `Timed Practice (${timedMode}s)` : (isAdaptive ? 'Adaptive Practice' : 'Free Practice'))}</h1>

      {!lessonId && (
        <div className={styles.modeSelector}>
          <button
            className={`${styles.modeBtn} ${timedMode === null ? styles.modeBtnActive : ''}`}
            onClick={() => handleTimedModeChange(null)}
          >
            Standard
          </button>
          {([30, 60, 120] as const).map((sec) => (
            <button
              key={sec}
              className={`${styles.modeBtn} ${timedMode === sec ? styles.modeBtnActive : ''}`}
              onClick={() => handleTimedModeChange(sec)}
            >
              {sec}s
            </button>
          ))}
        </div>
      )}

      <LiveStats
        wpm={engine.wpm}
        accuracy={engine.accuracy}
        elapsedMs={engine.elapsedMs}
        errorCount={engine.errorCount}
        countdownMs={remainingMs}
      />
      <TypingArea engine={engine} />
      {settings.showKeyboard && (
        <KeyboardDisplay pressedKeys={pressedKeys} targetKey={targetChar} errorKey={engine.state.lastErrorKey ?? undefined} />
      )}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => { finishedRef.current = false; engine.reset(); }}>
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
