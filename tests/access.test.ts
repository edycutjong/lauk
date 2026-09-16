import { describe, expect, it } from 'vitest';
import { DECKS, type DeckId } from '../app/src/core/pillars';
import {
  DECK_ENTITLEMENT,
  ENT_UNLIMITED,
  canCheck,
  canUseDeck,
  checksChip,
  dailyCap,
  hasUnlimited,
} from '../app/src/rc/access';

const info = (...ids: string[]) => ({
  entitlements: { active: Object.fromEntries(ids.map((i) => [i, {}])) },
});
const ALL = [ENT_UNLIMITED, ...Object.values(DECK_ENTITLEMENT)];

/** Every subset of the four entitlements. */
function* subsets(): Generator<string[]> {
  for (let mask = 0; mask < 1 << ALL.length; mask++) yield ALL.filter((_, i) => mask & (1 << i));
}

describe('entitlement truth table — I7', () => {
  it('Counter is always open, even with no CustomerInfo at all', () => {
    expect(canUseDeck('counter', null)).toBe(true);
    expect(canUseDeck('counter', undefined)).toBe(true);
    for (const s of subsets()) expect(canUseDeck('counter', info(...s))).toBe(true);
  });

  it('a paid deck opens with its own entitlement or with unlimited — and only those', () => {
    for (const s of subsets())
      for (const d of DECKS) {
        if (d === 'counter') continue;
        const expected =
          s.includes(ENT_UNLIMITED) ||
          s.includes(DECK_ENTITLEMENT[d as Exclude<DeckId, 'counter'>]);
        expect(canUseDeck(d, info(...s)), `${d} with [${s}]`).toBe(expected);
      }
  });

  it('daily cap: 1 free · 3 with any deck · unlimited with the subscription', () => {
    for (const s of subsets()) {
      const expected = s.includes(ENT_UNLIMITED) ? Infinity : s.length > 0 ? 3 : 1;
      expect(dailyCap(info(...s)), `[${s}]`).toBe(expected);
    }
  });

  it('canCheck compares checks today against the cap', () => {
    expect(canCheck(null, 0)).toBe(true);
    expect(canCheck(null, 1)).toBe(false);
    expect(canCheck(info('deck_instant'), 2)).toBe(true);
    expect(canCheck(info('deck_instant'), 3)).toBe(false);
    expect(canCheck(info(ENT_UNLIMITED), 999)).toBe(true);
  });

  it('the chip reads "n of cap" or the unlimited label', () => {
    expect(checksChip(null, 0, 'Unlimited')).toBe('0 of 1');
    expect(checksChip(null, 5, 'Unlimited')).toBe('1 of 1');
    expect(checksChip(info('deck_delivery'), 2, 'Unlimited')).toBe('2 of 3');
    expect(checksChip(info(ENT_UNLIMITED), 2, 'Unlimited')).toBe('Unlimited');
  });

  it('a malformed CustomerInfo (no entitlements) is treated as free, not as a crash', () => {
    expect(dailyCap({} as never)).toBe(1);
    expect(canUseDeck('delivery', { entitlements: undefined } as never)).toBe(false);
  });

  it('hasUnlimited is true only when the unlimited entitlement itself is active', () => {
    expect(hasUnlimited(null)).toBe(false);
    expect(hasUnlimited(undefined)).toBe(false);
    expect(hasUnlimited(info())).toBe(false);
    expect(hasUnlimited(info(DECK_ENTITLEMENT.instant))).toBe(false);
    expect(hasUnlimited(info(ENT_UNLIMITED))).toBe(true);
    expect(hasUnlimited(info(ENT_UNLIMITED, DECK_ENTITLEMENT.delivery))).toBe(true);
  });
});
