import { useState, useEffect, useCallback } from 'react';

export function useKeyboardInput() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setPressedKeys((prev) => new Set(prev).add(e.key));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.delete(e.key);
      return next;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return { pressedKeys };
}
