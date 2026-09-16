/**
 * The ranker — deterministic, explainable, sub-millisecond.
 *
 *   gain_p(a)   = min(2, plate_p + 1) − plate_p for p in a.raises  (0 or 1)
 *   tiers       = [ceiling, ceiling−1, ceiling−2] ∩ [0..3], one card per tier,
 *                 cheapest tier picked first; ceiling 0 → up to 3 free adds
 *   score(a)    = Σ w_p · gain_p · [p ∉ raised]   (novel gain — must add something new)
 *               + 0.5 · Σ w_p · gain_p             (total gain)
 *               − 0.1 · tier(a)                    (price penalty; only matters across ties)
 *   argmax by (score desc, authored index asc); raised ∪= pillars the pick raised
 *   output      = picks sorted by (tier asc, authored index asc)
 *
 * The output is a pure function of (content, plate, ceiling, weights). Ties
 * resolve on authored order in addons.json, so the three asserted queries in
 * tests/rank.test.ts are stable across runs and machines.
 */
import {
  PILLARS,
  type Add,
  type Levels,
  type Plate,
  type Tier,
  type Weights,
  isAvailable,
  levelsAfter,
} from './pillars';

export interface Card {
  add: Add;
  /** Authored index in addons.json — the tie-break, exposed for explainability. */
  index: number;
  tier: Tier;
  /** Pillars this add actually lifts on THIS plate (a full pillar gains nothing). */
  raises: readonly (typeof PILLARS)[number][];
  /** The ring after tapping this card. */
  after: Levels;
  score: number;
}

function gains(plate: Levels, add: Add) {
  return add.raises.filter((p) => plate[p] < 2);
}

export function tiersFor(ceiling: Tier): Tier[] {
  if (ceiling === 0) return [0, 0, 0];
  // [ceiling−2 .. ceiling] ∩ [0..3], cheapest first — one card per tier.
  const out: Tier[] = [];
  for (let t = Math.max(0, ceiling - 2); t <= ceiling; t++) out.push(t as Tier);
  return out;
}

export function rankAdds(
  plate: Plate,
  ceiling: Tier,
  adds: readonly Add[],
  weights: Weights,
): Card[] {
  const raised = new Set<string>();
  const picked = new Set<string>();
  const cards: Card[] = [];

  for (const tier of tiersFor(ceiling)) {
    let best: Card | null = null;
    for (let i = 0; i < adds.length; i++) {
      const add = adds[i];
      if (add.tier !== tier || picked.has(add.id) || !isAvailable(add, plate)) continue;
      const g = gains(plate.levels, add);
      if (g.length === 0) continue;
      let novel = 0;
      let total = 0;
      for (const p of g) {
        total += weights[p];
        if (!raised.has(p)) novel += weights[p];
      }
      const score = novel + 0.5 * total - 0.1 * tier;
      if (!best || score > best.score) {
        best = { add, index: i, tier, raises: g, after: levelsAfter(plate.levels, add), score };
      }
    }
    if (!best) continue;
    picked.add(best.add.id);
    for (const p of best.raises) raised.add(p);
    cards.push(best);
  }

  return cards.sort((a, b) => a.tier - b.tier || a.index - b.index);
}

/** How many pillars sit at level ≥ 1 — the "4 of 5 lit" hero beat. */
export function litCount(levels: Levels): number {
  return PILLARS.filter((p) => levels[p] >= 1).length;
}
