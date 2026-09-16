import { describe, expect, it } from 'vitest';
import { checksToday, today, weekStrip } from '../app/src/store/dates';

describe('day helpers', () => {
  it('today() is local YYYY-MM-DD', () => {
    expect(today(new Date(2026, 8, 5, 23, 59))).toBe('2026-09-05');
    expect(today(new Date(2026, 0, 1, 0, 0))).toBe('2026-01-01');
  });

  it('checksToday counts only rows from the given day', () => {
    const rows = [
      { day: '2026-09-20', face: null },
      { day: '2026-09-20', face: 2 as const },
      { day: '2026-09-19', face: 1 as const },
    ];
    expect(checksToday(rows, '2026-09-20')).toBe(2);
    expect(checksToday(rows, '2026-09-18')).toBe(0);
  });

  it('weekStrip: seven days oldest first, last face wins, empty days stay null (never a number)', () => {
    const now = new Date(2026, 8, 22, 12);
    const rows = [
      { day: '2026-09-20', face: 0 as const },
      { day: '2026-09-20', face: 2 as const },
      { day: '2026-09-21', face: null },
      { day: '2026-09-16', face: 1 as const },
    ];
    const strip = weekStrip(rows, now);
    expect(strip.map((d) => d.day)).toEqual([
      '2026-09-16',
      '2026-09-17',
      '2026-09-18',
      '2026-09-19',
      '2026-09-20',
      '2026-09-21',
      '2026-09-22',
    ]);
    expect(strip.map((d) => d.face)).toEqual([1, null, null, null, 2, null, null]);
  });

  it('weekStrip crosses a month boundary', () => {
    const strip = weekStrip([], new Date(2026, 9, 2, 9));
    expect(strip[0].day).toBe('2026-09-26');
    expect(strip[6].day).toBe('2026-10-02');
  });
});
