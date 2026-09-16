/**
 * The no-credential CLI — prints exactly what the app shows, in the terminal.
 *
 *   npm run check -- rice_side 2
 *   npm run check -- instant_noodles 1 --currency USD
 *   npm run check -- --list
 *
 * The whole core is offline; this is the judge's first reproduce step.
 */
import { ADDS, CONTENT_HASH, PLATES } from '../app/src/core/content';
import { DEFAULT_WEIGHTS, PILLARS, type Tier } from '../app/src/core/pillars';
import { litCount, rankAdds } from '../app/src/core/rank';
import { TIER_NAMES, ceilingLabel, costLabel } from '../app/src/core/tiers';

const args = process.argv.slice(2);
const flag = (name: string, dflt: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};

if (args.includes('--list') || args.length === 0) {
  console.log('plates:');
  for (const p of PLATES)
    console.log(
      `  ${p.id.padEnd(20)} ${p.deck.padEnd(10)} ${p.name}${p.local ? `  (${p.local})` : ''}`,
    );
  console.log('\nceilings: 0 Free · 1 Small · 2 Medium · 3 Treat');
  console.log(
    `content: ${PLATES.length} plates · ${ADDS.length} adds · hash ${CONTENT_HASH.slice(0, 12)}`,
  );
  console.log('\nusage: npm run check -- <plate_id> <ceiling 0-3> [--currency IDR]');
  process.exit(0);
}

const plate = PLATES.find((p) => p.id === args[0]);
if (!plate) {
  console.error(`unknown plate "${args[0]}" — try --list`);
  process.exit(1);
}
const ceiling = Number(args[1] ?? 2) as Tier;
if (![0, 1, 2, 3].includes(ceiling)) {
  console.error(`ceiling must be 0–3, got "${args[1]}"`);
  process.exit(1);
}
const currency = flag('currency', 'IDR');

const ring = (levels: typeof plate.levels) =>
  PILLARS.map((p) => `${p} ${['○', '◐', '●'][levels[p]]}`).join('  ');

console.log(
  `${plate.name}${plate.local ? ` (${plate.local})` : ''} · ${TIER_NAMES[ceiling]} ${ceilingLabel(ceiling, currency)}`,
);
console.log(`plate  ${ring(plate.levels)}   ${litCount(plate.levels)} of 5 lit\n`);

const cards = rankAdds(plate, ceiling, ADDS, DEFAULT_WEIGHTS);
cards.forEach((c, i) => {
  const cost = costLabel(c.tier, c.add.idr, currency);
  console.log(
    `${i + 1}. ${c.add.name}${c.add.local ? ` (${c.add.local})` : ''} — ${cost} → lifts ${c.raises.join(' + ')}`,
  );
  console.log(`   after  ${ring(c.after)}   ${litCount(c.after)} of 5 lit`);
});
console.log(`\nEat until satisfied, not until empty.`);
