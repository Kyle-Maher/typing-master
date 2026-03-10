export type FingerGroup = 'pinky-l' | 'ring-l' | 'middle-l' | 'index-l' | 'thumb' | 'index-r' | 'middle-r' | 'ring-r' | 'pinky-r';

export interface KeyData {
  key: string;
  label: string;
  shiftLabel?: string;
  width: number; // relative width, 1 = standard key
  finger: FingerGroup;
  row: number;
}

export const QWERTY_LAYOUT: KeyData[][] = [
  // Row 0: Number row
  [
    { key: '`', label: '`', shiftLabel: '~', width: 1, finger: 'pinky-l', row: 0 },
    { key: '1', label: '1', shiftLabel: '!', width: 1, finger: 'pinky-l', row: 0 },
    { key: '2', label: '2', shiftLabel: '@', width: 1, finger: 'ring-l', row: 0 },
    { key: '3', label: '3', shiftLabel: '#', width: 1, finger: 'middle-l', row: 0 },
    { key: '4', label: '4', shiftLabel: '$', width: 1, finger: 'index-l', row: 0 },
    { key: '5', label: '5', shiftLabel: '%', width: 1, finger: 'index-l', row: 0 },
    { key: '6', label: '6', shiftLabel: '^', width: 1, finger: 'index-r', row: 0 },
    { key: '7', label: '7', shiftLabel: '&', width: 1, finger: 'index-r', row: 0 },
    { key: '8', label: '8', shiftLabel: '*', width: 1, finger: 'middle-r', row: 0 },
    { key: '9', label: '9', shiftLabel: '(', width: 1, finger: 'ring-r', row: 0 },
    { key: '0', label: '0', shiftLabel: ')', width: 1, finger: 'pinky-r', row: 0 },
    { key: '-', label: '-', shiftLabel: '_', width: 1, finger: 'pinky-r', row: 0 },
    { key: '=', label: '=', shiftLabel: '+', width: 1, finger: 'pinky-r', row: 0 },
    { key: 'Backspace', label: 'Back', width: 2, finger: 'pinky-r', row: 0 },
  ],
  // Row 1: QWERTY
  [
    { key: 'Tab', label: 'Tab', width: 1.5, finger: 'pinky-l', row: 1 },
    { key: 'q', label: 'Q', width: 1, finger: 'pinky-l', row: 1 },
    { key: 'w', label: 'W', width: 1, finger: 'ring-l', row: 1 },
    { key: 'e', label: 'E', width: 1, finger: 'middle-l', row: 1 },
    { key: 'r', label: 'R', width: 1, finger: 'index-l', row: 1 },
    { key: 't', label: 'T', width: 1, finger: 'index-l', row: 1 },
    { key: 'y', label: 'Y', width: 1, finger: 'index-r', row: 1 },
    { key: 'u', label: 'U', width: 1, finger: 'index-r', row: 1 },
    { key: 'i', label: 'I', width: 1, finger: 'middle-r', row: 1 },
    { key: 'o', label: 'O', width: 1, finger: 'ring-r', row: 1 },
    { key: 'p', label: 'P', width: 1, finger: 'pinky-r', row: 1 },
    { key: '[', label: '[', shiftLabel: '{', width: 1, finger: 'pinky-r', row: 1 },
    { key: ']', label: ']', shiftLabel: '}', width: 1, finger: 'pinky-r', row: 1 },
    { key: '\\', label: '\\', shiftLabel: '|', width: 1.5, finger: 'pinky-r', row: 1 },
  ],
  // Row 2: Home row
  [
    { key: 'CapsLock', label: 'Caps', width: 1.75, finger: 'pinky-l', row: 2 },
    { key: 'a', label: 'A', width: 1, finger: 'pinky-l', row: 2 },
    { key: 's', label: 'S', width: 1, finger: 'ring-l', row: 2 },
    { key: 'd', label: 'D', width: 1, finger: 'middle-l', row: 2 },
    { key: 'f', label: 'F', width: 1, finger: 'index-l', row: 2 },
    { key: 'g', label: 'G', width: 1, finger: 'index-l', row: 2 },
    { key: 'h', label: 'H', width: 1, finger: 'index-r', row: 2 },
    { key: 'j', label: 'J', width: 1, finger: 'index-r', row: 2 },
    { key: 'k', label: 'K', width: 1, finger: 'middle-r', row: 2 },
    { key: 'l', label: 'L', width: 1, finger: 'ring-r', row: 2 },
    { key: ';', label: ';', shiftLabel: ':', width: 1, finger: 'pinky-r', row: 2 },
    { key: "'", label: "'", shiftLabel: '"', width: 1, finger: 'pinky-r', row: 2 },
    { key: 'Enter', label: 'Enter', width: 2.25, finger: 'pinky-r', row: 2 },
  ],
  // Row 3: Bottom row
  [
    { key: 'Shift', label: 'Shift', width: 2.25, finger: 'pinky-l', row: 3 },
    { key: 'z', label: 'Z', width: 1, finger: 'pinky-l', row: 3 },
    { key: 'x', label: 'X', width: 1, finger: 'ring-l', row: 3 },
    { key: 'c', label: 'C', width: 1, finger: 'middle-l', row: 3 },
    { key: 'v', label: 'V', width: 1, finger: 'index-l', row: 3 },
    { key: 'b', label: 'B', width: 1, finger: 'index-l', row: 3 },
    { key: 'n', label: 'N', width: 1, finger: 'index-r', row: 3 },
    { key: 'm', label: 'M', width: 1, finger: 'index-r', row: 3 },
    { key: ',', label: ',', shiftLabel: '<', width: 1, finger: 'middle-r', row: 3 },
    { key: '.', label: '.', shiftLabel: '>', width: 1, finger: 'ring-r', row: 3 },
    { key: '/', label: '/', shiftLabel: '?', width: 1, finger: 'pinky-r', row: 3 },
    { key: 'ShiftRight', label: 'Shift', width: 2.75, finger: 'pinky-r', row: 3 },
  ],
  // Row 4: Space bar
  [
    { key: ' ', label: 'Space', width: 8, finger: 'thumb', row: 4 },
  ],
];

/** Map a character to the key that produces it (lowercase) */
export function charToKey(char: string): string {
  if (char === ' ') return ' ';
  return char.toLowerCase();
}

/** Get the finger color CSS variable for a finger group */
export function fingerColor(finger: FingerGroup): string {
  const map: Record<FingerGroup, string> = {
    'pinky-l': 'var(--finger-pinky)',
    'ring-l': 'var(--finger-ring)',
    'middle-l': 'var(--finger-middle)',
    'index-l': 'var(--finger-index)',
    'thumb': 'var(--finger-thumb)',
    'index-r': 'var(--finger-index)',
    'middle-r': 'var(--finger-middle)',
    'ring-r': 'var(--finger-ring)',
    'pinky-r': 'var(--finger-pinky)',
  };
  return map[finger];
}
