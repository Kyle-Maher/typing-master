import { useState, useRef, useCallback } from 'react';

export function useTimer() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    if (startTimeRef.current !== null) {
      setElapsedMs(Date.now() - startTimeRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  const start = useCallback(() => {
    if (startTimeRef.current !== null) return;
    startTimeRef.current = Date.now();
    setIsRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    if (startTimeRef.current !== null) {
      setElapsedMs(Date.now() - startTimeRef.current);
    }
    cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;
    setIsRunning(false);
    setElapsedMs(0);
  }, []);

  return { elapsedMs, isRunning, start, stop, reset };
}
