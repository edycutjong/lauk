/**
 * The compassionate-flexibility criterion, made machine-checkable.
 *
 * Every user-facing string in the content and UI copy is scanned for these
 * words at test time (tests/lint.test.ts). One hit fails the suite. The only
 * exclusion is the "What Lauk never does" screen, which renders THIS list —
 * from this constant, never from copy.en.json — so the lint never scans its
 * own denylist.
 */
export const BANNED = [
  'calorie',
  'calories',
  'kcal',
  'macro',
  'macros',
  'carb',
  'carbs',
  'protein',
  'fat',
  'weight',
  'diet',
  'cheat',
  'guilt',
  'detox',
  'burn',
  'portion',
  'nutrient',
  'healthy',
  'skinny',
  'slim',
  'lose',
  'fasting',
] as const;

const PATTERN = new RegExp(`\\b(${BANNED.join('|')})\\b`, 'i');

export interface Hit {
  word: string;
  text: string;
  path: string;
}

/** Scan a list of (path, string) pairs; return every hit. Empty = pass. */
export function findBannedWords(entries: Iterable<[string, string]>): Hit[] {
  const hits: Hit[] = [];
  for (const [path, text] of entries) {
    const m = PATTERN.exec(text);
    if (m) hits.push({ word: m[1].toLowerCase(), text, path });
  }
  return hits;
}

/** Walk any JSON value and yield every string leaf with its path. */
export function* stringLeaves(value: unknown, path = '$'): Generator<[string, string]> {
  if (typeof value === 'string') yield [path, value];
  else if (Array.isArray(value))
    for (let i = 0; i < value.length; i++) yield* stringLeaves(value[i], `${path}[${i}]`);
  else if (value && typeof value === 'object')
    for (const [k, v] of Object.entries(value as Record<string, unknown>))
      yield* stringLeaves(v, `${path}.${k}`);
}
