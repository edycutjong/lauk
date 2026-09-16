/**
 * Writes the product's content — 12 plates, 40 adds, every UI string — into
 * app/src/core/content/*.json and stamps CONTENT_HASH into content/index.ts.
 *
 * The tables live here as TypeScript constants so the repo is self-contained.
 * Ordering is fixed: the authored order of ADDS is the ranker's tie-break, so
 * moving a row changes the product. `npm run bench` recomputes the hash and
 * fails on drift; Settings → About shows its first 12 hex chars.
 *
 * Exits non-zero on a duplicate id or an unknown pillar/deck.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DECKS, PILLARS, type Add, type Plate } from '../app/src/core/pillars';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../app/src/core/content');

const L = (filling: number, fresh: number, rich: number, bright: number, crunch: number) =>
  ({ filling, fresh, rich, bright, crunch }) as Plate['levels'];

export const PLATES: Plate[] = [
  {
    id: 'rice_side',
    deck: 'counter',
    name: 'Rice plate + one side',
    local: 'nasi + 1 lauk',
    levels: L(2, 0, 1, 0, 0),
  },
  {
    id: 'fried_rice',
    deck: 'counter',
    name: 'Fried rice',
    local: 'nasi goreng',
    levels: L(2, 0, 2, 0, 1),
  },
  {
    id: 'noodle_soup',
    deck: 'counter',
    name: 'Noodle soup',
    local: 'soto · mie ayam · pho',
    levels: L(1, 1, 1, 1, 0),
  },
  {
    id: 'instant_noodles',
    deck: 'instant',
    name: 'Instant noodles',
    local: 'mie instan',
    levels: L(1, 0, 1, 0, 0),
  },
  {
    id: 'bread_spread',
    deck: 'instant',
    name: 'Bread + spread',
    local: 'roti + selai / kaya',
    levels: L(1, 0, 1, 0, 1),
  },
  {
    id: 'packet_meal',
    deck: 'instant',
    name: 'Ready meal (packet)',
    local: 'microwave rice + sachet',
    levels: L(2, 0, 1, 0, 0),
  },
  {
    id: 'fried_chicken_rice',
    deck: 'delivery',
    name: 'Fried chicken + rice',
    local: 'ayam goreng + nasi',
    levels: L(2, 0, 2, 0, 2),
  },
  {
    id: 'burger_fries',
    deck: 'delivery',
    name: 'Burger + fries',
    local: '',
    levels: L(2, 0, 2, 0, 1),
  },
  { id: 'pizza', deck: 'delivery', name: 'Pizza slices', local: '', levels: L(2, 0, 2, 0, 1) },
  {
    id: 'tray',
    deck: 'cafeteria',
    name: 'Cafeteria tray',
    local: 'rice + meat or egg + cooked veg',
    levels: L(2, 1, 1, 0, 0),
  },
  {
    id: 'sandwich_chips',
    deck: 'cafeteria',
    name: 'Sandwich + chips',
    local: '',
    levels: L(1, 1, 1, 0, 2),
  },
  {
    id: 'salad_bowl',
    deck: 'cafeteria',
    name: 'Salad / grain bowl',
    local: '',
    levels: L(0, 2, 0, 1, 1),
  },
];

type D = Add['where'];
const all: D = 'all';
const A = (
  id: string,
  name: string,
  local: string,
  tier: Add['tier'],
  idr: number,
  raises: Add['raises'],
  where: D,
  plates?: string[],
): Add =>
  plates
    ? { id, name, local, tier, idr, raises, where, plates }
    : { id, name, local, tier, idr, raises, where };

/** Authored order = tie-break order. Do not reorder. */
export const ADDS: Add[] = [
  // tier 0 — free
  A('lime_wedge', 'Lime wedge', 'jeruk nipis', 0, 0, ['bright'], ['counter', 'cafeteria']),
  A('extra_chili', 'Extra chili / hot sauce', 'sambal, chili flakes', 0, 0, ['bright'], all),
  A(
    'free_raw_veg',
    'Extra raw veg (if the stall gives it)',
    'lalapan',
    0,
    0,
    ['fresh'],
    ['counter'],
  ),
  A(
    'pickles',
    'Pickles / relish',
    'acar',
    0,
    0,
    ['bright', 'crunch'],
    ['delivery', 'cafeteria'],
    ['fried_rice'],
  ),
  A('extra_broth', 'Extra broth ladle', 'kuah', 0, 0, ['filling'], ['counter'], ['noodle_soup']),
  A(
    'fried_shallots',
    'Fried shallots / crispy bits',
    'bawang goreng',
    0,
    0,
    ['crunch'],
    ['counter', 'instant'],
  ),
  A(
    'extra_lettuce',
    'Extra lettuce + tomato (ask)',
    '',
    0,
    0,
    ['fresh'],
    ['delivery', 'cafeteria'],
  ),
  A(
    'extra_gravy',
    'Extra sauce / gravy',
    'kuah, saus',
    0,
    0,
    ['rich'],
    ['counter'],
    ['rice_side', 'tray', 'packet_meal'],
  ),
  // tier 1 — small
  A('crackers', 'Crackers', 'kerupuk', 1, 1000, ['crunch'], ['counter', 'instant', 'cafeteria']),
  A(
    'raw_veg_chili',
    'Raw veg + chili',
    'lalapan + sambal',
    1,
    2000,
    ['fresh', 'bright'],
    ['counter'],
  ),
  A(
    'cucumber_tomato',
    'Sliced cucumber / tomato',
    'timun, tomat',
    1,
    2000,
    ['fresh'],
    ['counter', 'instant', 'delivery'],
  ),
  A(
    'boiled_egg',
    'Boiled egg',
    'telur rebus',
    1,
    2000,
    ['filling', 'rich'],
    ['counter', 'instant', 'cafeteria'],
  ),
  A(
    'peanuts',
    'Handful of peanuts',
    'kacang',
    1,
    2000,
    ['crunch', 'rich'],
    ['instant', 'cafeteria', 'delivery'],
  ),
  A('banana', 'Banana', 'pisang', 1, 2000, ['fresh', 'filling'], all),
  A(
    'fried_tofu_tempe',
    'Fried tofu / tempe piece',
    'tahu / tempe goreng',
    1,
    2000,
    ['filling', 'rich'],
    ['counter'],
  ),
  A('extra_rice', 'Extra rice', 'nasi tambah', 1, 2000, ['filling'], ['counter', 'cafeteria']),
  A('chili_soy', 'Sliced chili + soy', 'sambal kecap', 1, 1000, ['bright'], ['counter', 'instant']),
  A('chips_sachet', 'Chips sachet', 'keripik', 1, 2000, ['crunch'], ['instant', 'delivery']),
  // tier 2 — medium
  A(
    'fried_egg',
    'Fried egg',
    'telur dadar / ceplok',
    2,
    5000,
    ['rich', 'filling'],
    ['counter', 'instant', 'cafeteria'],
  ),
  A(
    'veg_side',
    'Vegetable side',
    'sayur, tumis',
    2,
    3000,
    ['fresh', 'filling'],
    ['counter', 'cafeteria'],
  ),
  A('fruit_cup', 'Fruit cup / sliced fruit', 'buah potong', 2, 5000, ['fresh', 'bright'], all),
  A('side_salad', 'Side salad', '', 2, 5000, ['fresh', 'crunch'], ['delivery', 'cafeteria']),
  A('yogurt', 'Yogurt cup', '', 2, 5000, ['rich', 'bright'], ['instant', 'cafeteria']),
  A('soup_cup', 'Soup cup', 'sup', 2, 5000, ['filling', 'fresh'], ['counter', 'cafeteria']),
  A('cheese', 'Cheese slice / extra cheese', 'keju', 2, 3000, ['rich'], ['delivery', 'instant']),
  A(
    'pickled_veg_cup',
    'Pickled veg / kimchi cup',
    'acar, kimchi',
    2,
    5000,
    ['bright', 'fresh', 'crunch'],
    ['cafeteria', 'delivery'],
  ),
  A('corn', 'Corn cup / cob', 'jagung', 2, 5000, ['filling', 'bright'], ['counter', 'cafeteria']),
  A(
    'nuts_seeds',
    'Nuts + seeds mix',
    '',
    2,
    5000,
    ['crunch', 'rich', 'filling'],
    ['instant', 'cafeteria', 'delivery'],
  ),
  A(
    'sausage_meatball',
    'Sausage / meatball skewer',
    'sosis, bakso tusuk',
    2,
    3000,
    ['rich', 'filling'],
    ['counter', 'instant'],
  ),
  A('avocado', 'Half an avocado', 'alpukat', 2, 5000, ['rich', 'fresh'], ['cafeteria', 'delivery']),
  // tier 3 — treat
  A(
    'grilled_chicken',
    'Grilled chicken piece',
    'ayam bakar',
    3,
    10000,
    ['filling', 'rich'],
    ['counter', 'instant', 'cafeteria', 'delivery'],
  ),
  A('fresh_juice', 'Fresh juice', 'jus', 3, 8000, ['bright', 'fresh'], ['counter', 'cafeteria']),
  A(
    'roast_veg',
    'Grilled / roasted veg plate',
    '',
    3,
    10000,
    ['fresh', 'filling', 'rich'],
    ['cafeteria', 'delivery'],
  ),
  A(
    'veg_dip',
    'Veg sticks + dip',
    '',
    3,
    10000,
    ['fresh', 'crunch', 'rich'],
    ['cafeteria', 'delivery'],
  ),
  A('coleslaw', 'Coleslaw', '', 3, 8000, ['fresh', 'crunch', 'bright'], ['delivery']),
  A(
    'extra_side',
    'Extra side (wedges / fries)',
    '',
    3,
    10000,
    ['filling', 'crunch', 'rich'],
    ['delivery'],
  ),
  A(
    'big_fruit',
    'Big fruit box',
    'mangga, pepaya',
    3,
    10000,
    ['fresh', 'bright', 'filling'],
    ['counter', 'instant', 'cafeteria'],
  ),
  A(
    'tempe_stirfry',
    'Tempe stir-fry serving',
    'orek tempe',
    3,
    7000,
    ['filling', 'rich', 'crunch'],
    ['counter', 'instant'],
  ),
  A(
    'smoothie',
    'Smoothie / lassi',
    '',
    3,
    10000,
    ['filling', 'rich', 'bright'],
    ['cafeteria', 'delivery'],
  ),
  A(
    'grilled_corn',
    'Grilled corn + butter',
    'jagung bakar',
    3,
    8000,
    ['filling', 'rich', 'bright'],
    ['counter'],
  ),
];

/** Every user-facing string. Lint-checked by tests/lint.test.ts. */
export const COPY = {
  app: { name: 'Lauk', tagline: 'Tap the plate you already bought.' },
  pillars: {
    filling: { name: 'filling', hint: 'you stop thinking about food for a while' },
    fresh: { name: 'fresh', hint: 'something raw or green on the plate' },
    rich: { name: 'rich', hint: 'something fried, creamy or savoury' },
    bright: { name: 'bright', hint: 'something sour, spicy or sharp' },
    crunch: { name: 'crunch', hint: 'something that makes a noise' },
  },
  decks: {
    counter: 'Counter',
    instant: 'Instant',
    delivery: 'Delivery',
    cafeteria: 'Cafeteria',
  },
  onboarding: {
    title: 'Where do you mostly eat?',
    student: 'Student housing',
    office: 'An office',
    road: 'On the road',
    footer: 'Lauk never counts. It asks how satisfying the plate is.',
  },
  plates: {
    title: 'What is in front of you?',
    checksToday: 'Checks today',
    unlimited: 'Unlimited',
    locked: 'Locked',
    settings: 'Settings',
  },
  ceiling: {
    title: 'How much more would you spend?',
    tiers: { 0: 'Free', 1: 'Small', 2: 'Medium', 3: 'Treat' },
  },
  result: {
    title: 'One add that would help',
    ateAsIs: 'I ate it as it was',
    raises: 'lifts',
    litOf: 'of 5 lit',
  },
  cue: {
    line: 'Eat until satisfied, not until empty.',
    skip: 'tap anywhere to continue',
  },
  faces: {
    title: 'After the meal — how was it?',
    hungry: 'still hungry',
    fine: 'fine',
    satisfied: 'satisfied',
    week: 'This week',
    later: 'Ask me later',
  },
  decksShelf: {
    title: 'Decks',
    buy: 'Open',
    once: 'once',
    unlimitedTitle: 'Unlimited',
    unlimitedBody: 'Every deck, no daily limit. 7 days free.',
    restore: 'Restore purchases',
    manage: 'Manage subscription',
    owned: 'Open',
  },
  settings: {
    title: 'Settings',
    context: 'Where you mostly eat',
    learned: 'What Lauk has learned you value',
    reset: 'Reset',
    never: 'What Lauk never does',
    about: 'About',
    content: 'Content',
    version: 'Version',
  },
  never: {
    title: 'What Lauk never does',
    line: 'None of these words appear anywhere in Lauk. A test fails if one ever does.',
    also: 'No streaks. No misses. No red days. No camera. No account. No cloud.',
  },
  cap: {
    reached: 'That was today’s check.',
    more: 'Unlimited opens every deck with no daily limit — 7 days free.',
  },
  paywall: {
    deckHeadline: 'Open the {deck} deck',
    deckSub: 'Three plates, every add that fits them — yours once, forever.',
  },
} as const;

function main() {
  const ids = new Set<string>();
  for (const p of PLATES) {
    if (ids.has(p.id)) fail(`duplicate plate id ${p.id}`);
    ids.add(p.id);
    if (!DECKS.includes(p.deck)) fail(`unknown deck ${p.deck} on ${p.id}`);
  }
  const addIds = new Set<string>();
  for (const a of ADDS) {
    if (addIds.has(a.id)) fail(`duplicate add id ${a.id}`);
    addIds.add(a.id);
    for (const r of a.raises) if (!PILLARS.includes(r)) fail(`unknown pillar ${r} on ${a.id}`);
    if (a.where !== 'all')
      for (const d of a.where) if (!DECKS.includes(d)) fail(`unknown deck ${d} on ${a.id}`);
    if (a.plates)
      for (const pl of a.plates) if (!ids.has(pl)) fail(`unknown plate ${pl} on ${a.id}`);
  }

  mkdirSync(OUT, { recursive: true });
  const files = {
    'plates.json': canonical(PLATES),
    'addons.json': canonical(ADDS),
    'copy.en.json': canonical(COPY),
  };
  const hash = createHash('sha256');
  for (const [name, body] of Object.entries(files)) {
    writeFileSync(resolve(OUT, name), body + '\n');
    hash.update(name).update(body);
  }
  const digest = hash.digest('hex');
  writeFileSync(
    resolve(OUT, 'index.ts'),
    `// GENERATED by scripts/seed.ts — do not edit. \`npm run seed\` regenerates.
import plates from './plates.json';
import addons from './addons.json';
import copy from './copy.en.json';
import type { Add, Plate } from '../pillars';

export const PLATES = plates as unknown as readonly Plate[];
export const ADDS = addons as unknown as readonly Add[];
export const COPY = copy;
/** sha256 over the canonical JSON bytes of the three files above. */
export const CONTENT_HASH = '${digest}';
`,
  );
  console.log(`seed: ${PLATES.length} plates · ${ADDS.length} adds · hash ${digest.slice(0, 12)}`);
}

export function canonical(v: unknown): string {
  return JSON.stringify(v, null, 2);
}

export function contentHash(files: Record<string, string>): string {
  const h = createHash('sha256');
  for (const name of ['plates.json', 'addons.json', 'copy.en.json'])
    h.update(name).update(files[name]);
  return h.digest('hex');
}

function fail(msg: string): never {
  console.error(`seed: ${msg}`);
  process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
