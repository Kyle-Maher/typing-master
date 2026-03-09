import { FOOD_WORDS } from './food';
import { LOCATION_WORDS } from './locations';
import { STORY_SENTENCES } from './stories';
import { POEM_LINES } from './poems';
import { RANDOM_WORDS } from './random';

export type TopicId = 'food' | 'locations' | 'stories' | 'poems' | 'random';

export interface Topic {
  id: TopicId;
  label: string;
  icon: string;
  description: string;
}

export const TOPICS: Topic[] = [
  { id: 'food',      label: 'Food',      icon: '🍎', description: 'Ingredients, flavors, and dishes' },
  { id: 'locations', label: 'Locations', icon: '🗺',  description: 'Places near and far' },
  { id: 'stories',   label: 'Stories',   icon: '📖', description: 'Short narrative sentences' },
  { id: 'poems',     label: 'Poems',     icon: '✦',  description: 'Lyrical lines and imagery' },
  { id: 'random',    label: 'Random',    icon: '⟳',  description: 'A mix of everyday words' },
];

// Fisher-Yates shuffle seeded by a simple LCG
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

export function generateChunk(topicId: TopicId, targetWords = 60, chunkIndex = 0): string {
  if (topicId === 'stories' || topicId === 'poems') {
    const sentences = topicId === 'stories' ? STORY_SENTENCES : POEM_LINES;
    const shuffled = seededShuffle(sentences, chunkIndex + 1);
    const result: string[] = [];
    let wordCount = 0;
    let i = 0;
    while (wordCount < targetWords) {
      const sentence = shuffled[i % shuffled.length]!;
      result.push(sentence);
      wordCount += sentence.split(' ').length;
      i++;
    }
    return result.join(' ');
  }

  const wordList =
    topicId === 'food' ? FOOD_WORDS :
    topicId === 'locations' ? LOCATION_WORDS :
    RANDOM_WORDS;
  const shuffled = seededShuffle(wordList, chunkIndex + 1);
  const result: string[] = [];
  for (let i = 0; result.length < targetWords; i++) {
    result.push(shuffled[i % shuffled.length]!);
  }
  return result.join(' ');
}
