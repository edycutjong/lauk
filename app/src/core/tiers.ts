/**
 * Spend-ceiling labels per currency. IDR is the reference (prices in
 * addons.json are authored in rupiah); every other currency shows a tier
 * ceiling only, rounded to something a person would actually say.
 */
import type { Tier } from './pillars';

export const CURRENCIES = [
  'IDR',
  'USD',
  'EUR',
  'GBP',
  'MYR',
  'SGD',
  'PHP',
  'INR',
  'AUD',
  'CAD',
] as const;
export type Currency = (typeof CURRENCIES)[number];

export const TIER_NAMES: Record<Tier, string> = { 0: 'Free', 1: 'Small', 2: 'Medium', 3: 'Treat' };

/** Ceiling per tier, per currency. Index = tier. */
const CEILINGS: Record<Currency, readonly [string, string, string, string]> = {
  IDR: ['Rp 0', '≤ Rp 2k', '≤ Rp 5k', '≤ Rp 10k'],
  USD: ['$0', '≤ $1', '≤ $2', '≤ $4'],
  EUR: ['€0', '≤ €1', '≤ €2', '≤ €4'],
  GBP: ['£0', '≤ £1', '≤ £2', '≤ £3'],
  MYR: ['RM 0', '≤ RM 3', '≤ RM 6', '≤ RM 12'],
  SGD: ['S$0', '≤ S$1', '≤ S$2', '≤ S$4'],
  PHP: ['₱0', '≤ ₱30', '≤ ₱60', '≤ ₱120'],
  INR: ['₹0', '≤ ₹30', '≤ ₹60', '≤ ₹120'],
  AUD: ['A$0', '≤ A$1', '≤ A$3', '≤ A$5'],
  CAD: ['C$0', '≤ C$1', '≤ C$3', '≤ C$5'],
};

export function isCurrency(c: string): c is Currency {
  return (CURRENCIES as readonly string[]).includes(c);
}

export function ceilingLabel(tier: Tier, currency: string): string {
  const c: Currency = isCurrency(currency) ? currency : 'USD';
  return CEILINGS[c][tier];
}

/** The cost label on a card: exact rupiah in Indonesia, the tier ceiling elsewhere. */
export function costLabel(tier: Tier, idr: number, currency: string): string {
  if (tier === 0) return 'Free';
  if (currency === 'IDR') return `Rp ${formatIdr(idr)}`;
  return ceilingLabel(tier, currency);
}

export function formatIdr(n: number): string {
  return n.toLocaleString('en-US').replace(/,/g, '.');
}

/** A tiny abbreviated form for tiles/badges: 19000 → "Rp 19k". */
export function shortIdr(n: number): string {
  return n >= 1000 ? `Rp ${Math.round(n / 1000)}k` : `Rp ${n}`;
}

/** Map a device region code to a currency; fall back to USD. */
export function currencyForRegion(region: string | null | undefined): Currency {
  const map: Record<string, Currency> = {
    ID: 'IDR',
    US: 'USD',
    GB: 'GBP',
    MY: 'MYR',
    SG: 'SGD',
    PH: 'PHP',
    IN: 'INR',
    AU: 'AUD',
    CA: 'CAD',
    DE: 'EUR',
    FR: 'EUR',
    ES: 'EUR',
    IT: 'EUR',
    NL: 'EUR',
    IE: 'EUR',
    AT: 'EUR',
    BE: 'EUR',
    PT: 'EUR',
    FI: 'EUR',
  };
  return (region && map[region.toUpperCase()]) || 'USD';
}
