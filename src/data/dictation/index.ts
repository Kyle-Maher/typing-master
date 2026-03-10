import type { DictationPassage } from '@/types/dictation';
import { beginnerPassages } from './beginner';
import { intermediatePassages } from './intermediate';
import { advancedPassages } from './advanced';

const allPassages: DictationPassage[] = [
  ...beginnerPassages,
  ...intermediatePassages,
  ...advancedPassages,
];

export function getAllDictationPassages(): DictationPassage[] {
  return allPassages;
}

export function getDictationPassageById(id: string): DictationPassage | undefined {
  return allPassages.find((p) => p.id === id);
}
