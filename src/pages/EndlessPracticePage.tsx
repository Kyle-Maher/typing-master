import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { TypingArea } from '@/components/typing/TypingArea';
import { Button } from '@/components/common/Button';
import { TOPICS, generateChunk } from '@/data/endless';
import type { TopicId } from '@/data/endless';
import styles from './EndlessPracticePage.module.css';

interface SessionResult {
  wpm: number;
  accuracy: number;
  wordsTyped: number;
  elapsedSeconds: number;
  chunksCompleted: number;
}

interface AccumulatedStats {
  totalChars: number;
  totalErrors: number;
  startTime: number | null;
  chunksCompleted: number;
  chunkIndex: number;
}

// ── EndlessSession ────────────────────────────────────────────────────────────
// Owns useTypingEngine. Remounts via key={topic} when topic changes.
interface EndlessSessionProps {
  topic: TopicId;
  onEnd: (result: SessionResult) => void;
}

function EndlessSession({ topic, onEnd }: EndlessSessionProps) {
  const [accumulated, setAccumulated] = useState<AccumulatedStats>({
    totalChars: 0,
    totalErrors: 0,
    startTime: null,
    chunksCompleted: 0,
    chunkIndex: 0,
  });
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);

  const accRef = useRef(accumulated);
  accRef.current = accumulated;
  const instantRef = useRef({ wpm: 0, accuracy: 100 });

  const engine = useTypingEngine(generateChunk(topic, 60, 0));

  // Live stats — computed from accumulated + current engine state each render
  const elapsedMs = accumulated.startTime ? Date.now() - accumulated.startTime : 0;
  const totalChars = accumulated.totalChars + engine.state.cursor;
  const totalErrors = accumulated.totalErrors + engine.state.errors.length;
  const currentSecond = Math.floor(elapsedMs / 1000);
  const instantWpm = currentSecond > 0 ? Math.round((totalChars / 5) / (currentSecond / 60)) : 0;
  const instantAccuracy = totalChars > 0
    ? Math.round(((totalChars - totalErrors) / totalChars) * 100)
    : 100;
  instantRef.current = { wpm: instantWpm, accuracy: instantAccuracy };

  // Capture start time on first keypress
  useEffect(() => {
    if (engine.state.isStarted) {
      setAccumulated(prev =>
        prev.startTime === null ? { ...prev, startTime: Date.now() } : prev
      );
    }
  }, [engine.state.isStarted]);

  // Auto-advance to next chunk on completion
  useEffect(() => {
    if (!engine.state.isComplete) return;
    const cursor = engine.state.cursor;
    const errorsLen = engine.state.errors.length;
    const nextIndex = accRef.current.chunkIndex + 1;
    setAccumulated(prev => ({
      ...prev,
      totalChars: prev.totalChars + cursor,
      totalErrors: prev.totalErrors + errorsLen,
      chunksCompleted: prev.chunksCompleted + 1,
      chunkIndex: nextIndex,
    }));
    engine.reset(generateChunk(topic, 60, nextIndex));
  }, [engine.state.isComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // Throttle live WPM/accuracy display to 1-second boundaries
  useEffect(() => {
    setLiveWpm(instantRef.current.wpm);
    setLiveAccuracy(instantRef.current.accuracy);
  }, [currentSecond]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnd = () => {
    const acc = accRef.current;
    const totalChars = acc.totalChars + engine.state.cursor;
    const totalErrors = acc.totalErrors + engine.state.errors.length;
    const elapsedMs = acc.startTime ? Date.now() - acc.startTime : 0;
    const mins = elapsedMs / 60000;
    onEnd({
      wpm: mins > 0 ? Math.round((totalChars / 5) / mins) : 0,
      accuracy: totalChars > 0
        ? Math.round(((totalChars - totalErrors) / totalChars) * 100)
        : 100,
      wordsTyped: Math.round(totalChars / 5),
      elapsedSeconds: Math.round(elapsedMs / 1000),
      chunksCompleted: acc.chunksCompleted,
    });
  };

  const mins = Math.floor(elapsedMs / 1000 / 60);
  const secs = Math.floor((elapsedMs / 1000) % 60);
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className={styles.session}>
      <div className={styles.sessionHeader}>
        <h1 className={styles.sessionTitle}>Endless Practice</h1>
        <Button variant="secondary" size="sm" onClick={handleEnd}>
          End Session
        </Button>
      </div>
      <div className={styles.sessionStats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{liveWpm}</span>
          <span className={styles.statLabel}>WPM</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{liveAccuracy}%</span>
          <span className={styles.statLabel}>Accuracy</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{timeStr}</span>
          <span className={styles.statLabel}>Time</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{accumulated.chunksCompleted}</span>
          <span className={styles.statLabel}>Chunks</span>
        </div>
      </div>
      <TypingArea engine={engine} />
    </div>
  );
}

// ── SummaryScreen ─────────────────────────────────────────────────────────────
interface SummaryScreenProps {
  result: SessionResult;
  onTryAgain: () => void;
}

function SummaryScreen({ result, onTryAgain }: SummaryScreenProps) {
  const navigate = useNavigate();
  const mins = Math.floor(result.elapsedSeconds / 60);
  const secs = result.elapsedSeconds % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className={styles.summary}>
      <h1 className={styles.summaryTitle}>Session Complete</h1>
      <p className={styles.summarySubtitle}>
        {result.wordsTyped === 0 ? 'No words typed.' : "Great session! Here's how you did."}
      </p>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryCardValue}>{result.wpm}</span>
          <span className={styles.summaryCardLabel}>WPM</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryCardValue}>{result.accuracy}%</span>
          <span className={styles.summaryCardLabel}>Accuracy</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryCardValue}>{result.wordsTyped}</span>
          <span className={styles.summaryCardLabel}>Words</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryCardValue}>{timeStr}</span>
          <span className={styles.summaryCardLabel}>Time</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryCardValue}>{result.chunksCompleted}</span>
          <span className={styles.summaryCardLabel}>Chunks</span>
        </div>
      </div>
      <div className={styles.summaryActions}>
        <Button variant="secondary" onClick={onTryAgain}>Try Again</Button>
        <Button onClick={() => navigate('/')}>Home</Button>
      </div>
    </div>
  );
}

// ── EndlessPracticePage ───────────────────────────────────────────────────────
export function EndlessPracticePage() {
  const [phase, setPhase] = useState<'select' | 'typing' | 'summary'>('select');
  const [topic, setTopic] = useState<TopicId | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);

  const handleTopicSelect = (id: TopicId) => {
    setTopic(id);
    setPhase('typing');
  };

  const handleEnd = (r: SessionResult) => {
    setResult(r);
    setPhase('summary');
  };

  const handleTryAgain = () => {
    setResult(null);
    setTopic(null);
    setPhase('select');
  };

  if (phase === 'typing' && topic) {
    return <EndlessSession key={topic} topic={topic} onEnd={handleEnd} />;
  }

  if (phase === 'summary' && result) {
    return <SummaryScreen result={result} onTryAgain={handleTryAgain} />;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Endless Practice</h1>
      <p className={styles.description}>
        Choose a topic and type continuously. Your session ends when you decide.
      </p>
      <div className={styles.topicGrid}>
        {TOPICS.map(t => (
          <button key={t.id} className={styles.topicCard} onClick={() => handleTopicSelect(t.id)}>
            <span className={styles.topicIcon}>{t.icon}</span>
            <span className={styles.topicLabel}>{t.label}</span>
            <span className={styles.topicDescription}>{t.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
