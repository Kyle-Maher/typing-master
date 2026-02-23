import { useState } from 'react';
import { useSpellingEngine } from '@/hooks/useSpellingEngine';
import { getAllSpellingLessons, getSpellingLessonById } from '@/data/spelling/index';
import { WordPrompt } from '@/components/spelling/WordPrompt';
import { SpellingArea } from '@/components/spelling/SpellingArea';
import { Button } from '@/components/common/Button';
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
      lesson={selectedLesson}
      onBack={() => setSelectedLessonId(null)}
    />
  );
}

function SpellingSession({ lesson, onBack }: { lesson: NonNullable<ReturnType<typeof getSpellingLessonById>>; onBack: () => void }) {
  const engine = useSpellingEngine(lesson.words);

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
