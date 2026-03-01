import { useState, useEffect, useRef } from 'react';
import { useSpellingEngine } from '@/hooks/useSpellingEngine';
import { getAllSpellingLessons, getSpellingLessonById } from '@/data/spelling/index';
import { WordPrompt } from '@/components/spelling/WordPrompt';
import { SpellingArea } from '@/components/spelling/SpellingArea';
import { Button } from '@/components/common/Button';
import { useUser } from '@/context/UserContext';
import type { SpellingResult } from '@/types/user';
import styles from './SpellingPracticePage.module.css';

export function SpellingPracticePage() {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const spellingLessons = getAllSpellingLessons();
  const selectedLesson = selectedLessonId ? getSpellingLessonById(selectedLessonId) : undefined;

  if (!selectedLesson) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Spelling Practice</h1>
        <p className={styles.subtitle}>Choose a word list to practice spelling.</p>
        <div className={styles.lessonGrid}>
          {spellingLessons.map((lesson) => (
            <button
              key={lesson.id}
              className={styles.lessonCard}
              onClick={() => setSelectedLessonId(lesson.id)}
            >
              <h3>{lesson.title}</h3>
              <p>{lesson.words.length} words</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <SpellingSession
      key={selectedLessonId}
      lessonId={selectedLessonId!}
      lesson={selectedLesson}
      onBack={() => setSelectedLessonId(null)}
    />
  );
}

function SpellingSession({ lessonId, lesson, onBack }: { lessonId: string; lesson: NonNullable<ReturnType<typeof getSpellingLessonById>>; onBack: () => void }) {
  const engine = useSpellingEngine(lesson.words);
  const { profile, addSpellingResult } = useUser();
  const savedRef = useRef(false);

  useEffect(() => {
    if (engine.state.phase === 'done' && profile && !savedRef.current) {
      savedRef.current = true;
      const accuracy = engine.state.totalWords > 0
        ? Math.round((engine.state.correctCount / engine.state.totalWords) * 100)
        : 0;
      const points = engine.state.correctCount * 10;
      const result: SpellingResult = {
        id: crypto.randomUUID(),
        lessonId,
        profileId: profile.id,
        correctCount: engine.state.correctCount,
        totalWords: engine.state.totalWords,
        accuracy,
        results: engine.state.results,
        points,
        completedAt: new Date().toISOString(),
      };
      addSpellingResult(result);
    }
  }, [engine.state.phase, engine.state.correctCount, engine.state.totalWords, engine.state.results, profile, lessonId, addSpellingResult]);

  if (engine.state.phase === 'done') {
    const accuracy = engine.state.totalWords > 0
      ? Math.round((engine.state.correctCount / engine.state.totalWords) * 100)
      : 0;
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Spelling Complete!</h1>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryValue}>{engine.state.correctCount}/{engine.state.totalWords}</span>
            <span className={styles.summaryLabel}>Correct</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryValue}>{accuracy}%</span>
            <span className={styles.summaryLabel}>Accuracy</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryValue}>{engine.state.correctCount * 10}</span>
            <span className={styles.summaryLabel}>Points</span>
          </div>
        </div>
        <div className={styles.wordResults}>
          {engine.state.results.map((r, i) => (
            <div key={i} className={`${styles.wordResult} ${r.correct ? styles.wordCorrect : styles.wordIncorrect}`}>
              <span>{r.word}</span>
              <span>{r.correct ? 'Correct' : 'Missed'}</span>
            </div>
          ))}
        </div>
        <div className={styles.doneActions}>
          <Button variant="secondary" onClick={() => { savedRef.current = false; engine.reset(); }}>
            Retry
          </Button>
          <Button onClick={onBack}>
            Back to Lessons
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button variant="ghost" size="sm" onClick={onBack}>&larr; Back</Button>
        <h1 className={styles.title}>{lesson.title}</h1>
      </div>
      {engine.currentWord && (
        <WordPrompt
          word={engine.currentWord.word}
          hint={engine.currentWord.hint}
          phase={engine.state.phase}
          showHint={engine.state.showHint}
          onRevealHint={engine.revealHint}
          onReplay={engine.replayWord}
        />
      )}
      <SpellingArea engine={engine} />
    </div>
  );
}
