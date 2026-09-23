/**
 * AsyncStorage, versioned keys. Three of them, all tiny:
 *
 *   lauk.prefs.v1    { eating_context, currency, onboarded }
 *   lauk.weights.v1  five numbers in [0.5, 1.5]
 *   lauk.log.v1      last 60 rows: plate, ceiling, add, face (one per check)
 *
 * No currency balance, no entitlement, no purchase state is ever stored
 * here — RevenueCat is the only source of truth for what the user owns.
 * Corrupt storage falls back to defaults instead of crash-looping.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_WEIGHTS, type Tier, type Weights } from '../core/pillars';
import { W_MAX, W_MIN, type Face } from '../core/weights';
import type { EatingContext } from '../rc/purchases';

export const KEY_PREFS = 'lauk.prefs.v1';
export const KEY_WEIGHTS = 'lauk.weights.v1';
export const KEY_LOG = 'lauk.log.v1';

export interface Prefs {
  eating_context: EatingContext | null;
  currency: string;
  onboarded: boolean;
}

export interface LogRow {
  day: string; // YYYY-MM-DD, device local
  ts: number;
  plate: string;
  ceiling: Tier;
  add: string | null;
  face: Face | null;
}

export const DEFAULT_PREFS: Prefs = { eating_context: null, currency: 'USD', onboarded: false };

async function readJson<T>(key: string, fallback: T, valid: (v: unknown) => v is T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return valid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* a failed write costs one row, never the session */
  }
}

const isPrefs = (v: unknown): v is Prefs =>
  typeof v === 'object' && v !== null && 'onboarded' in v && 'currency' in v;
const isWeights = (v: unknown): v is Weights =>
  typeof v === 'object' &&
  v !== null &&
  (['filling', 'fresh', 'rich', 'bright', 'crunch'] as const).every((p) => {
    const n = (v as Record<string, unknown>)[p];
    return typeof n === 'number' && n >= W_MIN && n <= W_MAX;
  });
const isLog = (v: unknown): v is LogRow[] => Array.isArray(v);

export const loadPrefs = () => readJson<Prefs>(KEY_PREFS, DEFAULT_PREFS, isPrefs);
export const savePrefs = (p: Prefs) => writeJson(KEY_PREFS, p);
export const loadWeights = () => readJson<Weights>(KEY_WEIGHTS, DEFAULT_WEIGHTS, isWeights);
export const saveWeights = (w: Weights) => writeJson(KEY_WEIGHTS, w);
export const loadLog = () => readJson<LogRow[]>(KEY_LOG, [], isLog);

/** Keep the last 60 rows — a week strip needs 7 days, the cap needs today. */
export const saveLog = (rows: LogRow[]) => writeJson(KEY_LOG, rows.slice(-60));

export { checksToday, today, weekStrip } from './dates';
