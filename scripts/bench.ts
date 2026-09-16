/**
 * Benchmark + invariants. Exits non-zero on any failure.
 *
 *   npm run bench
 *
 * Reports p50/p95 per query over 12 plates × 4 ceilings × 3 weighting profiles,
 * asserts the three reference queries, re-checks I1/I2 and the content hash.
 * Deterministic and offline; the numbers land in DEMO.md.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ADDS, CONTENT_HASH, PLATES } from '../app/src/core/content';
import {
  DEFAULT_WEIGHTS,
  TIERS,
  type Tier,
  type Weights,
  isAvailable,
} from '../app/src/core/pillars';
import { rankAdds } from '../app/src/core/rank';
import { contentHash } from './seed';

const here = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(here, '../app/src/core/content');
const failures: string[] = [];
const fail = (m: string) => failures.push(m);

// ── content hash ────────────────────────────────────────────────────────────
const files = Object.fromEntries(
  ['plates.json', 'addons.json', 'copy.en.json'].map((f) => [
    f,
    readFileSync(resolve(DIR, f), 'utf8').replace(/\n$/, ''),
  ]),
);
const onDisk = contentHash(files);
if (onDisk !== CONTENT_HASH)
  fail(
    `content hash drift: index.ts ${CONTENT_HASH.slice(0, 12)} ≠ disk ${onDisk.slice(0, 12)} — run npm run seed`,
  );

// ── asserted queries ────────────────────────────────────────────────────────
const expectQuery = (plateId: string, ceiling: Tier, expected: string[]) => {
  const plate = PLATES.find((p) => p.id === plateId)!;
  const got = rankAdds(plate, ceiling, ADDS, DEFAULT_WEIGHTS).map((c) => c.add.id);
  if (JSON.stringify(got) !== JSON.stringify(expected))
    fail(`${plateId}@${ceiling}: expected ${expected} got ${got}`);
};
expectQuery('rice_side', 2, ['lime_wedge', 'raw_veg_chili', 'fried_egg']);
expectQuery('instant_noodles', 1, ['extra_chili', 'boiled_egg']);
expectQuery('salad_bowl', 2, ['lime_wedge', 'boiled_egg', 'nuts_seeds']);

// ── invariants ──────────────────────────────────────────────────────────────
for (const p of PLATES)
  for (const t of TIERS)
    if (rankAdds(p, t, ADDS, DEFAULT_WEIGHTS).length === 0) fail(`I1: ${p.id}@${t} empty`);
for (const a of ADDS)
  if (!PLATES.some((p) => isAvailable(a, p) && a.raises.some((r) => p.levels[r] < 2)))
    fail(`I2: ${a.id} lifts nothing anywhere`);

// ── timing ──────────────────────────────────────────────────────────────────
const profiles: Weights[] = [
  DEFAULT_WEIGHTS,
  { filling: 1.5, fresh: 0.5, rich: 1.2, bright: 0.8, crunch: 1 },
  { filling: 0.5, fresh: 1.5, rich: 0.6, bright: 1.4, crunch: 1.3 },
];
const samples: number[] = [];
const ROUNDS = 200;
for (let r = 0; r < ROUNDS; r++)
  for (const w of profiles)
    for (const p of PLATES)
      for (const t of TIERS) {
        const t0 = performance.now();
        rankAdds(p, t, ADDS, w);
        samples.push(performance.now() - t0);
      }
samples.sort((a, b) => a - b);
const q = (f: number) => samples[Math.min(samples.length - 1, Math.floor(samples.length * f))];
const p50 = q(0.5);
const p95 = q(0.95);
const p99 = q(0.99);

console.log(
  `lauk bench — ${PLATES.length} plates × ${TIERS.length} ceilings × ${profiles.length} weighting profiles × ${ROUNDS} rounds = ${samples.length} queries`,
);
console.log(
  `  p50 ${(p50 * 1000).toFixed(1)} µs · p95 ${(p95 * 1000).toFixed(1)} µs · p99 ${(p99 * 1000).toFixed(1)} µs · max ${(samples[samples.length - 1] * 1000).toFixed(1)} µs`,
);
console.log(
  `  asserted queries: 3/3 · I1 ${PLATES.length * TIERS.length}/${PLATES.length * TIERS.length} · I2 ${ADDS.length}/${ADDS.length}`,
);
console.log(
  `  content hash ${CONTENT_HASH.slice(0, 12)} (${onDisk === CONTENT_HASH ? 'matches disk' : 'DRIFT'})`,
);

if (p95 > 1) fail(`p95 ${p95.toFixed(3)} ms exceeds the 1 ms budget`);
if (failures.length) {
  console.error('\nFAIL');
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log('  PASS');
