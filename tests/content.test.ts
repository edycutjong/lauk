import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ADDS, CONTENT_HASH, COPY, PLATES } from '../app/src/core/content';
import { DECKS, PILLARS, TIERS, isAvailable, type Tier } from '../app/src/core/pillars';
import { DEFAULT_WEIGHTS } from '../app/src/core/pillars';
import { rankAdds } from '../app/src/core/rank';
import { contentHash } from '../scripts/seed';

const DIR = resolve(__dirname, '../app/src/core/content');

describe('content invariants', () => {
  it('12 plates across 4 decks, 3 per deck', () => {
    expect(PLATES.length).toBe(12);
    for (const d of DECKS) expect(PLATES.filter((p) => p.deck === d).length).toBe(3);
  });

  it('40 adds, ids unique, every raise is a known pillar', () => {
    expect(ADDS.length).toBe(40);
    expect(new Set(ADDS.map((a) => a.id)).size).toBe(40);
    for (const a of ADDS) for (const r of a.raises) expect(PILLARS).toContain(r);
  });

  it('every plate level is 0, 1 or 2 on every pillar', () => {
    for (const p of PLATES) for (const k of PILLARS) expect([0, 1, 2]).toContain(p.levels[k]);
  });

  it('I1: every (plate, ceiling) pair returns ≥ 1 card', () => {
    for (const p of PLATES)
      for (const t of TIERS)
        expect(rankAdds(p, t, ADDS, DEFAULT_WEIGHTS).length).toBeGreaterThan(0);
  });

  it('I2: every add lifts ≥ 1 hollow pillar on ≥ 1 plate it is available for', () => {
    for (const a of ADDS) {
      const useful = PLATES.some((p) => isAvailable(a, p) && a.raises.some((r) => p.levels[r] < 2));
      expect(useful, a.id).toBe(true);
    }
  });

  it('ceiling 0 always has a candidate: extra_chili is available everywhere and no plate is fully bright', () => {
    const chili = ADDS.find((a) => a.id === 'extra_chili')!;
    expect(chili.where).toBe('all');
    for (const p of PLATES) expect(p.levels.bright).toBeLessThan(2);
  });

  it('every deck has ≥ 2 adds per tier', () => {
    for (const d of DECKS)
      for (const t of TIERS) {
        const n = ADDS.filter(
          (a) => a.tier === t && !a.plates && (a.where === 'all' || a.where.includes(d)),
        ).length;
        expect(n, `${d} tier ${t}`).toBeGreaterThanOrEqual(2);
      }
  });

  it('a plates: list narrows availability to exactly those tiles', () => {
    const broth = ADDS.find((a) => a.id === 'extra_broth')!;
    for (const p of PLATES) expect(isAvailable(broth, p)).toBe(p.id === 'noodle_soup');
  });

  it('prices are non-negative and free adds cost zero', () => {
    for (const a of ADDS) {
      expect(a.idr).toBeGreaterThanOrEqual(0);
      if (a.tier === 0) expect(a.idr).toBe(0);
      else expect(a.idr).toBeGreaterThan(0);
    }
  });

  it('tier ceilings hold: small ≤ 2k · medium ≤ 5k · treat ≤ 10k', () => {
    const max: Record<Tier, number> = { 0: 0, 1: 2000, 2: 5000, 3: 10000 };
    for (const a of ADDS) expect(a.idr).toBeLessThanOrEqual(max[a.tier]);
  });

  it('I9: CONTENT_HASH equals sha256 of the canonical JSON on disk', () => {
    const files = Object.fromEntries(
      ['plates.json', 'addons.json', 'copy.en.json'].map((f) => [
        f,
        readFileSync(resolve(DIR, f), 'utf8').replace(/\n$/, ''),
      ]),
    );
    expect(contentHash(files)).toBe(CONTENT_HASH);
    expect(CONTENT_HASH).toMatch(/^[0-9a-f]{64}$/);
  });

  it('copy has the cue line and the onboarding footer verbatim', () => {
    expect(COPY.cue.line).toBe('Eat until satisfied, not until empty.');
    expect(COPY.onboarding.footer).toBe('Lauk never counts. It asks how satisfying the plate is.');
  });
});
