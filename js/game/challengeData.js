import { OBJECTS } from './objects.js';
import { CLUES, TIMELINES, BADGES } from './challenges.js';

export const MIN_TO_PLAY = 3;

const shuffle = (arr) => {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export function exploredObjects(planet, ids) {
  const set = new Set(ids);
  return (OBJECTS[planet] || []).filter((o) => set.has(o.id));
}

export function badgeFor(planet) {
  return BADGES[planet] || { emoji: '🚀', title: 'Space Explorer', color: '#9fe9ff' };
}

// Builds a fresh challenge from the objects the child has already explored on
// this planet. Returns null when there is not enough to test yet.
export function buildChallenge(planet, ids) {
  const found = exploredObjects(planet, ids).filter((o) => CLUES[o.id] && TIMELINES[o.id]);
  if (found.length < MIN_TO_PLAY) return null;

  const picked = shuffle(found).slice(0, 4);
  const pairs = picked.map((o) => ({ id: o.id, name: o.name, emoji: CLUES[o.id].emoji, clue: CLUES[o.id].clue }));

  const tObj = picked[Math.floor(Math.random() * picked.length)];
  const cards = TIMELINES[tObj.id].map((line, idx) => {
    const [date, text] = line.split('|');
    return { id: `${tObj.id}-${idx}`, idx, date, text };
  });

  return {
    planet,
    pairs,
    clues: shuffle(pairs.map((p) => ({ id: p.id, text: p.clue }))),
    timeline: {
      id: tObj.id,
      name: tObj.name,
      emoji: CLUES[tObj.id].emoji,
      truth: cards.map((c) => c.id),
      cards: (() => {
        const scrambled = shuffle(cards);
        return scrambled.every((c, i) => c.idx === i) ? scrambled.slice().reverse() : scrambled;
      })(),
    },
  };
}