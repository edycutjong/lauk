import { describe, expect, it } from 'vitest';
import { ADDS } from '../app/src/core/content';
import { DEFAULT_WEIGHTS, PILLARS } from '../app/src/core/pillars';
import { ETA, W_MAX, W_MIN, applyFace, clampWeight, resetWeights } from '../app/src/core/weights';

const friedEgg = ADDS.find((a) => a.id === 'fried_egg')!; // rich, filling
const lime = ADDS.find((a) => a.id === 'lime_wedge')!; // bright

describe('applyFace — I6', () => {
  it('"satisfied" after a rich add raises rich (and filling) by η', () => {
    const w = applyFace(DEFAULT_WEIGHTS, friedEgg, 2);
    expect(w.rich).toBeCloseTo(1 + ETA);
    expect(w.filling).toBeCloseTo(1 + ETA);
    expect(w.fresh).toBe(1);
  });

  it('"still hungry" lowers the pillars the add raised', () => {
    const w = applyFace(DEFAULT_WEIGHTS, friedEgg, 0);
    expect(w.rich).toBeCloseTo(1 - ETA);
    expect(w.bright).toBe(1);
  });

  it('"fine" changes nothing', () => {
    expect(applyFace(DEFAULT_WEIGHTS, friedEgg, 1)).toEqual(DEFAULT_WEIGHTS);
  });

  it('"ate it as it was" (no add) changes nothing', () => {
    expect(applyFace(DEFAULT_WEIGHTS, null, 2)).toEqual(DEFAULT_WEIGHTS);
  });

  it('never leaves [0.5, 1.5] after 100 satisfied taps or 100 hungry taps', () => {
    let up = { ...DEFAULT_WEIGHTS };
    let down = { ...DEFAULT_WEIGHTS };
    for (let i = 0; i < 100; i++) {
      up = applyFace(up, lime, 2);
      down = applyFace(down, lime, 0);
    }
    expect(up.bright).toBe(W_MAX);
    expect(down.bright).toBe(W_MIN);
    for (const p of PILLARS) {
      expect(up[p]).toBeLessThanOrEqual(W_MAX);
      expect(down[p]).toBeGreaterThanOrEqual(W_MIN);
    }
  });

  it('does not mutate its input', () => {
    const w = { ...DEFAULT_WEIGHTS };
    applyFace(w, friedEgg, 2);
    expect(w).toEqual(DEFAULT_WEIGHTS);
  });

  it('stores tidy numbers (three decimals) so the JSON stays readable', () => {
    let w = { ...DEFAULT_WEIGHTS };
    for (let i = 0; i < 3; i++) w = applyFace(w, lime, 2);
    expect(w.bright).toBe(1.45);
  });

  it('clampWeight and resetWeights', () => {
    expect(clampWeight(9)).toBe(W_MAX);
    expect(clampWeight(-1)).toBe(W_MIN);
    expect(resetWeights()).toEqual(DEFAULT_WEIGHTS);
    expect(resetWeights()).not.toBe(DEFAULT_WEIGHTS);
  });
});
