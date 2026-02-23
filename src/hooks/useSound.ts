import { useCallback, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';

const audioCtxRef = { current: null as AudioContext | null };

function getAudioContext(): AudioContext {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new AudioContext();
  }
  return audioCtxRef.current;
}

function playTone(frequency: number, duration: number, volume = 0.1) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = frequency;
  osc.type = 'sine';
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function useSound() {
  const { settings } = useSettings();
  const enabled = useRef(settings.soundEnabled);
  enabled.current = settings.soundEnabled;

  const playKeystroke = useCallback(() => {
    if (!enabled.current) return;
    playTone(800, 0.05, 0.05);
  }, []);

  const playSuccess = useCallback(() => {
    if (!enabled.current) return;
    playTone(523, 0.1, 0.08);
    setTimeout(() => playTone(659, 0.1, 0.08), 100);
    setTimeout(() => playTone(784, 0.15, 0.08), 200);
  }, []);

  const playError = useCallback(() => {
    if (!enabled.current) return;
    playTone(200, 0.15, 0.08);
  }, []);

  return { playKeystroke, playSuccess, playError };
}
