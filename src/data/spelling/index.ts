import type { SpellingLesson } from '@/types/spelling';
import { grade1 } from './grade-1';
import { grade1Phonics } from './grade-1-phonics';
import { grade2 } from './grade-2';
import { grade2Challenge } from './grade-2-challenge';
import { grade3 } from './grade-3';
import { grade3Challenge } from './grade-3-challenge';
import { grade4 } from './grade-4';
import { grade5 } from './grade-5';
import { silentLetters } from './silent-letters';
import { doubleLetters } from './double-letters';
import { trickyEndings } from './tricky-endings';
import { commonlyMisspelled } from './commonly-misspelled';
import { greekLatinRoots } from './greek-latin-roots';
import { science } from './science';
import { academic } from './academic';
import { satPrep } from './sat-prep';
import { business } from './business';
import { advanced } from './advanced';
import { expert1 } from './expert-1';
import { expert2 } from './expert-2';

const allSpellingLessons: SpellingLesson[] = [
  grade1,
  grade1Phonics,
  grade2,
  grade2Challenge,
  grade3,
  grade3Challenge,
  grade4,
  grade5,
  silentLetters,
  doubleLetters,
  trickyEndings,
  commonlyMisspelled,
  greekLatinRoots,
  science,
  academic,
  satPrep,
  business,
  advanced,
  expert1,
  expert2,
];

export function getAllSpellingLessons(): SpellingLesson[] {
  return allSpellingLessons;
}

export function getSpellingLessonById(id: string): SpellingLesson | undefined {
  return allSpellingLessons.find((l) => l.id === id);
}
