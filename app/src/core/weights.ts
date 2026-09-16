/**
 * The only "learning" in Lauk, fully inspectable.
 *
 * After a meal the user taps one of three faces. For every pillar the chosen
 * add raised, the weight moves by η·(face − 1): still hungry (0) lowers it,
 * fine (1) leaves it, satisfied (2) raises it. Clamped to [0.5, 1.5]. Shown as
 * five bars in Settings, resettable. No model, no server, no hidden state.
 */
import { DEFAULT_WEIGHTS, type Add, type Weights } from './pillars';

export type Face = 0 | 1 | 2;
export const ETA = 0.15;
export const W_MIN = 0.5;
export const W_MAX = 1.5;

export function clampWeight(w: number): number {
  return Math.min(W_MAX, Math.max(W_MIN, w));
}

export function applyFace(weights: Weights, add: Add | null, face: Face): Weights {
  if (!add) return { ...weights };
  const out = { ...weights };
  for (const p of add.raises) out[p] = round(clampWeight(out[p] + ETA * (face - 1)));
  return out;
}

export function resetWeights(): Weights {
  return { ...DEFAULT_WEIGHTS };
}

/** Keep the stored JSON tidy — floats like 1.1500000000000001 are noise. */
function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
