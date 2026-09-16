/**
 * Fails on anything a judge would trip over. Run by hand before the Devpost
 * submit and in CI.
 *
 *  - placeholder tokens (TBD / TODO / FILL_ME / <...>) in README.md, DEMO.md
 *  - a kill-switch flag anywhere on the reproduce path (MOCK=, DEMO_MODE, OFFLINE=1, --dry-run)
 *  - banned words in README.md / DEMO.md prose that describe the app
 *  - the stall test mentioned while DEMO.md carries no kill-test rows (intention-as-fact)
 *  - a creator's name in judge-facing files (set LAUK_CREATOR_NAMES="name,channel" in the env)
 *  - app.json package id, icon and adaptive icon present
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBannedWords } from '../app/src/core/lint';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p: string) =>
  existsSync(resolve(root, p)) ? readFileSync(resolve(root, p), 'utf8') : null;
const problems: string[] = [];
const warns: string[] = [];

const judgeFacing = [
  'README.md',
  'DEMO.md',
  'ARCHITECTURE.md',
  'docs/RANKER.md',
  'docs/paywall-copy.md',
];
for (const f of judgeFacing) {
  const body = read(f);
  if (body === null) {
    problems.push(`${f} missing`);
    continue;
  }
  for (const m of body.matchAll(/\b(TBD|TODO|FIXME|FILL_ME|XXX)\b|<(insert|paste|your)[^>]*>/gi))
    problems.push(`${f}: placeholder "${m[0]}"`);
  for (const m of body.matchAll(/(MOCK=|MOCK_MODE|USE_MOCK|DEMO_MODE|OFFLINE=1|--dry-run)/g))
    problems.push(`${f}: kill-switch flag "${m[0]}"`);
}

// Banned words in the prose that describes the app. The one allowed context is
// quoting the award's own criterion, which README does inside a blockquote.
for (const f of ['README.md', 'DEMO.md']) {
  const body = read(f);
  if (!body) continue;
  const prose = body
    .split('\n')
    .filter((l) => !l.startsWith('>'))
    .join('\n');
  for (const h of findBannedWords([[f, prose]])) problems.push(`${f}: banned word "${h.word}"`);
}

// Intention-as-fact: the stall test may only be described once its rows exist.
const demo = read('DEMO.md') ?? '';
const mentionsStall = /stall test|kill test|kill-test/i.test(demo);
const hasRows = /\|\s*\d+\s*\|[^\n]*\|[^\n]*\|/.test(demo) && /k\s*=\s*\d/i.test(demo);
if (mentionsStall && !hasRows)
  warns.push('DEMO.md mentions the stall/kill test but carries no result rows (n, k, plates) yet');

// Creator hygiene — never a creator's name, channel or brand in judge-facing files.
const names = (process.env.LAUK_CREATOR_NAMES ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
if (names.length === 0) warns.push('LAUK_CREATOR_NAMES not set — creator-name scan skipped');
for (const f of judgeFacing)
  for (const n of names)
    if ((read(f) ?? '').toLowerCase().includes(n.toLowerCase()))
      problems.push(`${f}: creator name "${n}" present`);

// Store package essentials.
const appJson = read('app/app.json');
if (!appJson) problems.push('app/app.json missing');
else {
  const cfg = JSON.parse(appJson);
  if (cfg.expo?.android?.package !== 'dev.edycu.lauk')
    problems.push(`app.json package is ${cfg.expo?.android?.package}`);
  for (const p of ['app/assets/icon.png', 'app/assets/adaptive-icon.png', 'app/assets/splash.png'])
    if (!existsSync(resolve(root, p))) problems.push(`${p} missing`);
}

// URLs the submission needs, once they exist.
const readme = read('README.md') ?? '';
for (const [label, re] of [
  ['Play listing URL', /play\.google\.com\/store\/apps\/details\?id=dev\.edycu\.lauk/],
  ['demo video URL', /youtu\.?be/],
] as const)
  if (!re.test(readme)) warns.push(`README.md has no ${label} yet`);

for (const w of warns) console.log(`  ⚠ ${w}`);
for (const p of problems) console.log(`  ✗ ${p}`);
if (problems.length) {
  console.log(`\nreadiness: ${problems.length} problem(s), ${warns.length} warning(s)`);
  process.exit(1);
}
console.log(`\nreadiness: 0 problems, ${warns.length} warning(s)`);
