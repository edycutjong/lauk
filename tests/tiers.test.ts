import { describe, expect, it } from 'vitest';
import {
  CURRENCIES,
  ceilingLabel,
  costLabel,
  currencyForRegion,
  formatIdr,
  shortIdr,
} from '../app/src/core/tiers';

describe('tier labels — I8', () => {
  it('every supported currency has a label for every tier', () => {
    for (const c of CURRENCIES)
      for (const t of [0, 1, 2, 3] as const) expect(ceilingLabel(t, c)).toBeTruthy();
  });

  it('an unknown currency falls back to USD', () => {
    expect(ceilingLabel(2, 'XYZ')).toBe(ceilingLabel(2, 'USD'));
    expect(ceilingLabel(2, 'USD')).toBe('≤ $2');
  });

  it('IDR reference ceilings are Rp 0 / ≤2k / ≤5k / ≤10k', () => {
    expect([0, 1, 2, 3].map((t) => ceilingLabel(t as 0 | 1 | 2 | 3, 'IDR'))).toEqual([
      'Rp 0',
      '≤ Rp 2k',
      '≤ Rp 5k',
      '≤ Rp 10k',
    ]);
  });

  it('cost labels: exact rupiah in Indonesia, the tier ceiling elsewhere, Free at tier 0', () => {
    expect(costLabel(0, 0, 'IDR')).toBe('Free');
    expect(costLabel(1, 2000, 'IDR')).toBe('Rp 2.000');
    expect(costLabel(2, 5000, 'USD')).toBe('≤ $2');
    expect(costLabel(3, 10000, 'GBP')).toBe('≤ £3');
  });

  it('formats rupiah with dot separators and short badges', () => {
    expect(formatIdr(19000)).toBe('19.000');
    expect(shortIdr(19000)).toBe('Rp 19k');
    expect(shortIdr(500)).toBe('Rp 500');
  });

  it('maps device regions to currencies, USD fallback', () => {
    expect(currencyForRegion('ID')).toBe('IDR');
    expect(currencyForRegion('id')).toBe('IDR');
    expect(currencyForRegion('DE')).toBe('EUR');
    expect(currencyForRegion('ZZ')).toBe('USD');
    expect(currencyForRegion(null)).toBe('USD');
  });
});
