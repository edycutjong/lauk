/**
 * The five satisfaction pillars. This is the whole vocabulary of the app —
 * there is no calorie, macro, portion or "healthy" field anywhere, and the
 * copy-lint (lint.ts) fails the build if one appears.
 */
export const PILLARS = ['filling', 'fresh', 'rich', 'bright', 'crunch'] as const;
export type Pillar = (typeof PILLARS)[number];

/** 0 = hollow · 1 = half · 2 = full. */
export type Level = 0 | 1 | 2;
export type Levels = Record<Pillar, Level>;

/** Pillar weights the faces nudge (weights.ts). Default 1.0, clamped 0.5–1.5. */
export type Weights = Record<Pillar, number>;

export const DEFAULT_WEIGHTS: Weights = {
  filling: 1,
  fresh: 1,
  rich: 1,
  bright: 1,
  crunch: 1,
};

export const DECKS = ['counter', 'instant', 'delivery', 'cafeteria'] as const;
export type DeckId = (typeof DECKS)[number];

/** 0 free · 1 small · 2 medium · 3 treat. */
export type Tier = 0 | 1 | 2 | 3;
export const TIERS: readonly Tier[] = [0, 1, 2, 3];

export interface Plate {
  id: string;
  deck: DeckId;
  name: string;
  /** Local example shown as a subtitle, never as the name. */
  local: string;
  levels: Levels;
}

export interface Add {
  id: string;
  name: string;
  local: string;
  tier: Tier;
  /** Reference price in IDR; other currencies show the tier label only. */
  idr: number;
  /** +1 per listed pillar (a delta of 1 is the only delta in v1). */
  raises: readonly Pillar[];
  /** Decks the add is available at; 'all' = every deck. Ignored when `plates` is set. */
  where: readonly DeckId[] | 'all';
  /** When present, narrows availability to exactly these plate ids. */
  plates?: readonly string[];
}

export function clampLevel(n: number): Level {
  return (n <= 0 ? 0 : n >= 2 ? 2 : 1) as Level;
}

export function levelsAfter(plate: Levels, add: Add): Levels {
  const out = { ...plate };
  for (const p of add.raises) out[p] = clampLevel(out[p] + 1);
  return out;
}

export function isAvailable(add: Add, plate: Plate): boolean {
  if (add.plates) return add.plates.includes(plate.id);
  return add.where === 'all' || add.where.includes(plate.deck);
}
