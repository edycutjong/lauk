/**
 * Entitlement math — a pure function over the shape of CustomerInfo.
 *
 * The SDK is not mocked anywhere in the test suite; this file is what the
 * tests cover (tests/access.test.ts walks every combination of the four
 * entitlements). The screens call it with the real CustomerInfo the SDK hands
 * back, so the same rule decides a locked tile on-device and in the suite.
 *
 *   Free                 Counter deck · 1 check / day
 *   Any deck (one-time)  that deck  · 3 checks / day
 *   Unlimited (monthly)  every deck · no cap
 */
import type { DeckId } from '../core/pillars';

export const ENT_UNLIMITED = 'unlimited';
export const DECK_ENTITLEMENT: Record<Exclude<DeckId, 'counter'>, string> = {
  instant: 'deck_instant',
  delivery: 'deck_delivery',
  cafeteria: 'deck_cafeteria',
};

/** The only part of CustomerInfo the gate reads. */
export interface ActiveLike {
  entitlements: { active: Record<string, unknown> };
}

export function activeIds(info: ActiveLike | null | undefined): Set<string> {
  return new Set(Object.keys(info?.entitlements?.active ?? {}));
}

export function hasUnlimited(info: ActiveLike | null | undefined): boolean {
  return activeIds(info).has(ENT_UNLIMITED);
}

export function canUseDeck(deck: DeckId, info: ActiveLike | null | undefined): boolean {
  if (deck === 'counter') return true;
  const ids = activeIds(info);
  return ids.has(ENT_UNLIMITED) || ids.has(DECK_ENTITLEMENT[deck]);
}

/** Checks per day; Infinity for Unlimited. */
export function dailyCap(info: ActiveLike | null | undefined): number {
  const ids = activeIds(info);
  if (ids.has(ENT_UNLIMITED)) return Infinity;
  for (const e of Object.values(DECK_ENTITLEMENT)) if (ids.has(e)) return 3;
  return 1;
}

export function canCheck(info: ActiveLike | null | undefined, checksToday: number): boolean {
  return checksToday < dailyCap(info);
}

/** The chip text on the Plates screen: "1 of 1" · "2 of 3" · "Unlimited". */
export function checksChip(
  info: ActiveLike | null | undefined,
  checksToday: number,
  unlimitedLabel: string,
): string {
  const cap = dailyCap(info);
  if (cap === Infinity) return unlimitedLabel;
  return `${Math.min(checksToday, cap)} of ${cap}`;
}
