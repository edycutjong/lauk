/**
 * Permission boundary: what RevenueCat says is active is the ONLY thing
 * that opens a deck. Not a purchase record, not an expired entitlement,
 * not local storage, not a product id — `entitlements.active`.
 */
import { describe, expect, it } from 'vitest';
import {
  DECK_ENTITLEMENT,
  ENT_UNLIMITED,
  canCheck,
  canUseDeck,
  dailyCap,
} from '../app/src/rc/access';

const decks = ['instant', 'delivery', 'cafeteria'] as const;

describe('entitlement boundary', () => {
  it('an EXPIRED entitlement (in entitlements.all but not .active) opens nothing', () => {
    for (const d of decks) {
      const expired = {
        entitlements: { active: {}, all: { [DECK_ENTITLEMENT[d]]: { isActive: false } } },
      };
      expect(canUseDeck(d, expired)).toBe(false);
    }
    const expiredUnlimited = {
      entitlements: { active: {}, all: { [ENT_UNLIMITED]: { isActive: false } } },
    };
    expect(dailyCap(expiredUnlimited)).toBe(1);
  });

  it('a purchase record without an entitlement grants nothing (products are not the gate)', () => {
    const info = {
      entitlements: { active: {} },
      allPurchasedProductIdentifiers: ['deck_delivery', 'unlimited:monthly'],
      activeSubscriptions: ['unlimited:monthly'],
    };
    for (const d of decks) expect(canUseDeck(d, info)).toBe(false);
    expect(dailyCap(info)).toBe(1);
  });

  it('owning one deck never opens another deck', () => {
    for (const owned of decks)
      for (const other of decks) {
        if (owned === other) continue;
        expect(
          canUseDeck(other, { entitlements: { active: { [DECK_ENTITLEMENT[owned]]: {} } } }),
        ).toBe(false);
      }
  });

  it('a look-alike entitlement id is not the entitlement', () => {
    for (const bad of ['Unlimited', 'unlimited ', 'deck_Delivery', 'deck_delivery_trial', 'pro'])
      expect(canUseDeck('delivery', { entitlements: { active: { [bad]: {} } } })).toBe(
        bad === 'deck_delivery',
      );
    expect(dailyCap({ entitlements: { active: { Unlimited: {} } } })).toBe(1);
  });

  it('the daily cap cannot be bypassed by a negative or fractional check count', () => {
    // checksToday comes from the local log; the gate must not trust a malformed value into ∞.
    expect(canCheck(null, 1)).toBe(false);
    expect(canCheck(null, 0.5)).toBe(true);
    expect(canCheck(null, -1)).toBe(true);
    expect(canCheck({ entitlements: { active: { deck_instant: {} } } }, 3)).toBe(false);
  });
});
