import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { ADDS, PLATES } from '../app/src/core/content';
import { DEFAULT_WEIGHTS, PILLARS, type Tier } from '../app/src/core/pillars';
import { litCount, rankAdds, tiersFor } from '../app/src/core/rank';

const plate = (id: string) => {
  const p = PLATES.find((x) => x.id === id);
  if (!p) throw new Error(`no plate ${id}`);
  return p;
};
const ids = (cards: ReturnType<typeof rankAdds>) => cards.map((c) => c.add.id);

describe('the three asserted queries (seed-data.md §1) — I4', () => {
  it('rice_side @ Medium → lime wedge · raw veg + chili · fried egg', () => {
    const cards = rankAdds(plate('rice_side'), 2, ADDS, DEFAULT_WEIGHTS);
    expect(ids(cards)).toEqual(['lime_wedge', 'raw_veg_chili', 'fried_egg']);
    expect(cards.map((c) => c.tier)).toEqual([0, 1, 2]);
    expect(cards[0].raises).toEqual(['bright']);
    expect(cards[1].raises).toEqual(['fresh', 'bright']);
    expect(cards[2].raises).toEqual(['rich']);
  });

  it('the hero beat: tapping card 2 lights 4 of 5 pillars', () => {
    const cards = rankAdds(plate('rice_side'), 2, ADDS, DEFAULT_WEIGHTS);
    expect(cards[1].after).toEqual({ filling: 2, fresh: 1, rich: 1, bright: 1, crunch: 0 });
    expect(litCount(cards[1].after)).toBe(4);
  });

  it('instant_noodles @ Small → extra chili · boiled egg', () => {
    const cards = rankAdds(plate('instant_noodles'), 1, ADDS, DEFAULT_WEIGHTS);
    expect(ids(cards)).toEqual(['extra_chili', 'boiled_egg']);
    expect(cards[1].raises).toEqual(['filling', 'rich']);
  });

  it('salad_bowl @ Medium → lime wedge · boiled egg · nuts + seeds', () => {
    const cards = rankAdds(plate('salad_bowl'), 2, ADDS, DEFAULT_WEIGHTS);
    expect(ids(cards)).toEqual(['lime_wedge', 'boiled_egg', 'nuts_seeds']);
  });
});

describe('ranker mechanics', () => {
  it('tiers considered: cheapest first, one per tier, three free at ceiling 0', () => {
    expect(tiersFor(0)).toEqual([0, 0, 0]);
    expect(tiersFor(1)).toEqual([0, 1]);
    expect(tiersFor(2)).toEqual([0, 1, 2]);
    expect(tiersFor(3)).toEqual([1, 2, 3]);
  });

  it('ceiling 0 returns up to three distinct free adds', () => {
    const cards = rankAdds(plate('rice_side'), 0, ADDS, DEFAULT_WEIGHTS);
    expect(cards.length).toBeGreaterThanOrEqual(1);
    expect(cards.length).toBeLessThanOrEqual(3);
    expect(new Set(ids(cards)).size).toBe(cards.length);
    for (const c of cards) expect(c.tier).toBe(0);
  });

  it('cards are sorted cheapest first', () => {
    for (const p of PLATES)
      for (const t of [0, 1, 2, 3] as Tier[]) {
        const cards = rankAdds(p, t, ADDS, DEFAULT_WEIGHTS);
        for (let i = 1; i < cards.length; i++)
          expect(cards[i].tier).toBeGreaterThanOrEqual(cards[i - 1].tier);
      }
  });

  it('never suggests an add that lifts nothing on this plate', () => {
    for (const p of PLATES)
      for (const t of [0, 1, 2, 3] as Tier[])
        for (const c of rankAdds(p, t, ADDS, DEFAULT_WEIGHTS))
          expect(c.raises.length).toBeGreaterThan(0);
  });

  it('a second card prefers a pillar the first did not lift (novelty)', () => {
    const cards = rankAdds(plate('rice_side'), 2, ADDS, DEFAULT_WEIGHTS);
    const first = new Set(cards[0].raises);
    expect(cards[1].raises.some((p) => !first.has(p))).toBe(true);
  });

  it('weights change the pick: value crunch → fried shallots beat the lime wedge for the free slot', () => {
    const w = { ...DEFAULT_WEIGHTS, crunch: 1.5, fresh: 0.5, bright: 0.5 };
    expect(ids(rankAdds(plate('rice_side'), 1, ADDS, DEFAULT_WEIGHTS))[0]).toBe('lime_wedge');
    expect(ids(rankAdds(plate('rice_side'), 1, ADDS, w))[0]).toBe('fried_shallots');
  });

  it('a full pillar gains nothing (level clamps at 2)', () => {
    const cards = rankAdds(plate('fried_chicken_rice'), 3, ADDS, DEFAULT_WEIGHTS);
    for (const c of cards) expect(c.raises).not.toContain('crunch');
  });

  it('is deterministic across 1,000 runs — I3', () => {
    const digest = () => {
      const h = createHash('sha256');
      for (const p of PLATES)
        for (const t of [0, 1, 2, 3] as Tier[])
          h.update(JSON.stringify(ids(rankAdds(p, t, ADDS, DEFAULT_WEIGHTS))));
      return h.digest('hex');
    };
    const first = digest();
    for (let i = 0; i < 1000; i++) expect(digest()).toBe(first);
  });

  it('ranks 48 queries in well under a millisecond each', () => {
    const t0 = performance.now();
    for (let i = 0; i < 100; i++)
      for (const p of PLATES)
        for (const t of [0, 1, 2, 3] as Tier[]) rankAdds(p, t, ADDS, DEFAULT_WEIGHTS);
    const perQuery = (performance.now() - t0) / (100 * 48);
    expect(perQuery).toBeLessThan(1);
  });

  it('litCount counts pillars at level ≥ 1', () => {
    expect(litCount({ filling: 0, fresh: 0, rich: 0, bright: 0, crunch: 0 })).toBe(0);
    expect(litCount({ filling: 2, fresh: 1, rich: 1, bright: 1, crunch: 0 })).toBe(4);
    expect(PILLARS.length).toBe(5);
  });
});
