/**
 * The ranker verified across its whole input space, not on examples.
 *
 * 12 plates × 4 ceilings × 5^5 weighting profiles (each pillar in
 * {0.5, 0.75, 1.0, 1.25, 1.5}) = 150,000 queries. For every one:
 *   - at least one card, at most three, all distinct
 *   - no card costs more than the ceiling; every tier lies in [ceiling−2, ceiling]
 *   - every card lifts at least one hollow pillar on THIS plate
 *   - cards are ordered cheapest first
 *   - the ring after a card never exceeds level 2 on any pillar
 * The count is printed so the README can quote it.
 */
import { describe, expect, it } from 'vitest';
import { ADDS, PLATES } from '../app/src/core/content';
import { PILLARS, TIERS, type Weights } from '../app/src/core/pillars';
import { rankAdds } from '../app/src/core/rank';

const LEVELS = [0.5, 0.75, 1, 1.25, 1.5];

function* profiles(): Generator<Weights> {
  for (const a of LEVELS)
    for (const b of LEVELS)
      for (const c of LEVELS)
        for (const d of LEVELS)
          for (const e of LEVELS) yield { filling: a, fresh: b, rich: c, bright: d, crunch: e };
}

describe('exhaustive ranker verification', () => {
  it('150,000 (plate, ceiling, weighting) queries — every card affordable, useful, distinct, cheapest-first', () => {
    let cases = 0;
    let violations = 0;
    for (const w of profiles())
      for (const p of PLATES)
        for (const t of TIERS) {
          cases++;
          const cards = rankAdds(p, t, ADDS, w);
          const ok =
            cards.length >= 1 &&
            cards.length <= 3 &&
            new Set(cards.map((c) => c.add.id)).size === cards.length &&
            cards.every((c) => c.tier <= t && c.tier >= Math.max(0, t - 2)) &&
            cards.every((c) => c.raises.length > 0 && c.raises.every((r) => p.levels[r] < 2)) &&
            cards.every((c, i) => i === 0 || c.tier >= cards[i - 1].tier) &&
            cards.every((c) => PILLARS.every((k) => c.after[k] <= 2));
          if (!ok) violations++;
        }
    expect(cases).toBe(12 * 4 * 5 ** 5);
    expect(violations).toBe(0);
    console.log(`exhaustive: ${cases.toLocaleString()} queries verified, ${violations} violations`);
  });
});
