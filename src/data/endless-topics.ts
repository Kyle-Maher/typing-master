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

const FOOD_WORDS = [
  'apple', 'pasta', 'bread', 'butter', 'cheese', 'chicken', 'salmon', 'tomato', 'garlic',
  'onion', 'pepper', 'lemon', 'orange', 'mango', 'banana', 'grape', 'peach', 'plum', 'berry',
  'cherry', 'carrot', 'celery', 'spinach', 'broccoli', 'mushroom', 'potato', 'sweet', 'salty',
  'spicy', 'bitter', 'roasted', 'grilled', 'baked', 'steamed', 'fried', 'boiled', 'fresh',
  'ripe', 'tender', 'crispy', 'soup', 'stew', 'salad', 'sauce', 'broth', 'cream', 'sugar',
  'honey', 'olive', 'vinegar', 'noodle', 'rice', 'flour', 'dough', 'pizza', 'burger',
  'sandwich', 'taco', 'sushi', 'curry', 'yogurt', 'custard', 'pudding', 'cookie', 'cake',
  'brownie', 'muffin', 'waffle', 'syrup', 'jam', 'toast', 'bacon', 'egg', 'omelet', 'pancake',
  'scone', 'biscuit', 'bagel', 'coffee', 'tea', 'juice', 'smoothie', 'water',
];

const LOCATION_WORDS = [
  'mountain', 'beach', 'forest', 'river', 'valley', 'canyon', 'desert', 'island', 'glacier',
  'volcano', 'harbor', 'bridge', 'tower', 'castle', 'garden', 'market', 'temple', 'museum',
  'library', 'theater', 'station', 'plaza', 'alley', 'village', 'meadow', 'cliff', 'lagoon',
  'swamp', 'reef', 'cave', 'waterfall', 'summit', 'plateau', 'delta', 'fjord', 'basin',
  'savanna', 'jungle', 'cottage', 'cabin', 'farmhouse', 'lighthouse', 'windmill', 'pier',
  'dock', 'trail', 'path', 'skyline', 'suburb', 'rooftop', 'courtyard', 'fountain', 'archway',
  'tunnel', 'capital', 'coast', 'shore', 'inlet', 'bay', 'cove', 'peninsula', 'bluff',
  'prairie', 'orchard', 'vineyard', 'field', 'tundra', 'estuary', 'ridge', 'ravine',
  'wetlands', 'marshland',
];

const STORY_SENTENCES = [
  'The old lighthouse stood at the edge of the rocky coast, its beam sweeping the dark water.',
  'She found the letter tucked inside a worn book on the highest shelf of the attic.',
  'Rain fell steadily as the traveler knocked on the door of the only lit house on the lane.',
  'He carried the photograph everywhere, a reminder of the morning everything changed.',
  'The library closed at dusk but she stayed, certain there was one more answer hidden in the stacks.',
  'Two strangers sat on opposite ends of the bench and said nothing, yet both felt less alone.',
  'The map was torn down the middle, and each sibling carried half across different oceans.',
  'Every summer the family returned to the same lake, though the dock had grown smaller each year.',
  'She wrote his name in the sand before the tide erased it, just as she had done every year since.',
  'The dog waited at the door long after the footsteps had faded into silence.',
  'In the margin of the old journal, someone had drawn a small arrow pointing to nothing.',
  'The shop bell rang as the last customer left, and the owner turned the sign to Closed for the final time.',
  'He learned to read by tracing the letters carved into the wooden table in the back room.',
  'The train slowed but never stopped at that particular station, no matter what time of day.',
  'She pressed the flower between the pages of the dictionary, between the words for loss and luck.',
];

const POEM_LINES = [
  'The wind forgets the names of leaves it scattered in the fall.',
  'A candle asks for nothing, only room to burn and glow.',
  'She counted stars until the counting felt like prayer.',
  'Each morning the sea rewrites the shore in salt and foam.',
  'He kept his silence like a stone worn smooth by years of water.',
  'The clock on the wall measures hours but not the weight of them.',
  'Light comes through the cracks in things that once were whole.',
  'Words left unsaid arrange themselves into the shape of rooms.',
  'A bird lands once and then the branch remembers it forever.',
  'The moon keeps its own schedule, indifferent to our clocks.',
  'Some days arrive like an old song you forgot you knew.',
  'The forest holds its breath just before the first snow falls.',
  'She folded her grief into the corners of an ordinary Tuesday.',
  'Two clouds meet above the ridge and pass without recognition.',
  'Rain on a window is the sound of elsewhere calling home.',
  'Every ending hides a door that only looks like a wall.',
];

const RANDOM_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on',
  'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we',
  'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
  'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
  'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into',
  'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now',
  'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
  'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any',
  'these', 'give', 'day', 'most', 'us', 'great', 'between', 'need', 'large', 'often', 'hand',
  'high', 'place', 'hold', 'turn', 'ask', 'show', 'same', 'help', 'point', 'around', 'form',
  'three', 'small', 'set', 'put', 'end', 'does', 'another', 'big', 'play', 'next', 'move',
  'live', 'try', 'let', 'keep', 'begin', 'walk', 'always', 'never', 'answer', 'found',
  'study', 'learn', 'plant', 'cover', 'food', 'sun', 'four', 'state', 'eye', 'last',
  'thought', 'city', 'tree', 'cross', 'farm', 'hard', 'start', 'might', 'story', 'saw',
  'far', 'sea', 'draw', 'left', 'late', 'run', 'while', 'press', 'close', 'night', 'real',
  'life', 'few', 'north', 'open', 'seem', 'together',
];

export function generateChunk(topicId: TopicId, targetWords = 60, chunkIndex = 0): string {
  if (topicId === 'stories' || topicId === 'poems') {
    const sentences = topicId === 'stories' ? STORY_SENTENCES : POEM_LINES;
    const result: string[] = [];
    let wordCount = 0;
    let i = chunkIndex % sentences.length;
    while (wordCount < targetWords) {
      const sentence = sentences[i % sentences.length]!;
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
