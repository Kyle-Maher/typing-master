import { useState, useEffect, useRef } from 'react';
import { useDictationEngine } from '@/hooks/useDictationEngine';
import { getAllDictationPassages, getDictationPassageById } from '@/data/dictation/index';
import { Button } from '@/components/common/Button';
import { useUser } from '@/context/UserContext';
import type { DictationResult } from '@/types/user';
import type { DictationPassage } from '@/types/dictation';
import styles from './DictationPage.module.css';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

function getBestScores(history: DictationResult[], passageId: string) {
  const records = history.filter((r) => r.passageId === passageId);
  const seqBest = records
    .filter((r) => (r.mode ?? 'sequential') === 'sequential')
    .reduce<number | null>(
      (best, r) => (best === null || r.coverageScore > best ? r.coverageScore : best),
      null,
    );
  const simBest = records
    .filter((r) => r.mode === 'simultaneous')
    .reduce<number | null>(
      (best, r) => (best === null || r.coverageScore > best ? r.coverageScore : best),
      null,
    );
  return { sequential: seqBest, simultaneous: simBest };
}

export function DictationPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const passages = getAllDictationPassages();
  const { progress } = useUser();
  const selected = selectedId ? getDictationPassageById(selectedId) : undefined;

  if (!selected) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Dictation Practice</h1>
        <p className={styles.subtitle}>Listen to a passage, then type what you heard.</p>

        {DIFFICULTIES.map((diff) => {
          const group = passages.filter((p) => p.difficulty === diff);
          return (
            <section key={diff} className={styles.group}>
              <h2 className={styles.groupTitle}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</h2>
              <div className={styles.passageGrid}>
                {group.map((p) => {
                  const scores = getBestScores(progress?.dictationHistory ?? [], p.id);
                  return (
                    <button
                      key={p.id}
                      className={styles.passageCard}
                      onClick={() => setSelectedId(p.id)}
                    >
                      <h3>{p.title}</h3>
                      <p>{p.text.split(' ').length} words</p>
                      <div className={styles.passageScores}>
                        <span className={scores.sequential !== null ? styles.scoreChip : styles.scoreChipMuted}>
                          Listen First: {scores.sequential !== null ? `${scores.sequential}%` : '—'}
                        </span>
                        <span className={scores.simultaneous !== null ? styles.scoreChip : styles.scoreChipMuted}>
                          Type Along: {scores.simultaneous !== null ? `${scores.simultaneous}%` : '—'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <DictationSession
      key={selectedId}
      passage={selected}
      onBack={() => setSelectedId(null)}
    />
  );
}

function DictationSession({
  passage,
  onBack,
}: {
  passage: DictationPassage;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<'sequential' | 'simultaneous'>('sequential');
  const engine = useDictationEngine(passage.text, mode);
  const { profile, addDictationResult } = useUser();
  const savedRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Save result when done
  useEffect(() => {
    if (engine.state.phase === 'done' && profile && !savedRef.current) {
      savedRef.current = true;
      const points = Math.round(engine.state.coverageScore * passage.text.split(' ').length * 0.1);
      const result: DictationResult = {
        id: crypto.randomUUID(),
        passageId: passage.id,
        profileId: profile.id,
        coverageScore: engine.state.coverageScore,
        typedText: engine.state.input,
        points,
        completedAt: new Date().toISOString(),
        mode,
      };
      addDictationResult(result);
    }
  }, [engine.state.phase, engine.state.coverageScore, engine.state.input, profile, passage, addDictationResult, mode]);

  // Focus textarea when typing phase starts
  useEffect(() => {
    if (engine.state.phase === 'typing') {
      textareaRef.current?.focus();
    }
  }, [engine.state.phase]);

  const { phase } = engine.state;

  if (phase === 'done') {
    const score = engine.state.coverageScore;
    const points = Math.round(score * passage.text.split(' ').length * 0.1);
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Dictation Complete!</h1>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryValue}>{score}%</span>
            <span className={styles.summaryLabel}>Coverage</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryValue}>{points}</span>
            <span className={styles.summaryLabel}>Points</span>
          </div>
        </div>
        <div className={styles.comparison}>
          <div className={styles.comparisonBlock}>
            <h3 className={styles.comparisonLabel}>Original</h3>
            <p className={styles.comparisonText}>{passage.text}</p>
          </div>
          <div className={styles.comparisonBlock}>
            <h3 className={styles.comparisonLabel}>Your Answer</h3>
            <p className={styles.comparisonText}>{engine.state.input || <em>Nothing typed</em>}</p>
          </div>
        </div>
        <div className={styles.doneActions}>
          <Button variant="secondary" onClick={() => { savedRef.current = false; engine.reset(); }}>
            Retry
          </Button>
          <Button onClick={onBack}>
            Back to Passages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button variant="ghost" size="sm" onClick={onBack}>&larr; Back</Button>
        <h1 className={styles.title}>{passage.title}</h1>
        <span className={styles.modeBadge}>
          {mode === 'sequential' ? 'Listen First' : 'Type Along'}
        </span>
      </div>

      {phase === 'idle' && (
        <div className={styles.idleState}>
          <div className={styles.modeSelector}>
            <button
              className={`${styles.modeBtn} ${mode === 'sequential' ? styles.modeBtnActive : ''}`}
              onClick={() => setMode('sequential')}
            >
              Listen First
            </button>
            <button
              className={`${styles.modeBtn} ${mode === 'simultaneous' ? styles.modeBtnActive : ''}`}
              onClick={() => setMode('simultaneous')}
            >
              Type Along
            </button>
          </div>
          <p className={styles.instruction}>
            {mode === 'simultaneous'
              ? 'Press start to hear the passage while you type along.'
              : 'Press listen to hear the passage, then type what you heard.'}
          </p>
          <Button onClick={engine.startListening}>
            {mode === 'simultaneous' ? 'Start' : 'Listen to Passage'}
          </Button>
        </div>
      )}

      {phase === 'listening' && (
        <div className={styles.listeningState}>
          <div className={styles.listeningIndicator}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
          <p className={styles.instruction}>Listening&hellip;</p>
        </div>
      )}

      {phase === 'typing' && (
        <div className={styles.typingState}>
          <p className={styles.instruction}>
            {mode === 'simultaneous'
              ? 'Listen and type along. Replay anytime.'
              : 'Type what you heard. Don\u2019t worry about perfection.'}
          </p>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={engine.state.input}
            onChange={(e) => engine.setInput(e.target.value)}
            placeholder="Start typing here..."
            rows={6}
          />
          <div className={styles.typingActions}>
            <Button variant="secondary" onClick={engine.replayPassage}>
              Replay
            </Button>
            <Button onClick={engine.submitAnswer} disabled={engine.state.input.trim().length === 0}>
              Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
