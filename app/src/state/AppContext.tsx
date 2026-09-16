/**
 * App state: prefs, weights, the log, and the live CustomerInfo.
 *
 * CustomerInfo is held here (not cached to disk) and refreshed by the SDK's
 * listener, so a purchase or a converting trial re-renders every locked
 * tile without a restart. The one flow reads everything it needs from here.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import { getLocales } from 'expo-localization';
import { DEFAULT_WEIGHTS, type Add, type Tier, type Weights } from '../core/pillars';
import { applyFace, resetWeights, type Face } from '../core/weights';
import { currencyForRegion } from '../core/tiers';
import {
  configurePurchases,
  getCustomerInfo,
  getOfferings,
  onCustomerInfo,
  setEatingContext,
  type EatingContext,
} from '../rc/purchases';
import {
  DEFAULT_PREFS,
  loadLog,
  loadPrefs,
  loadWeights,
  saveLog,
  savePrefs,
  saveWeights,
  today,
  type LogRow,
  type Prefs,
} from '../store/storage';

interface AppState {
  ready: boolean;
  /** false when no RevenueCat key is configured — the shelf explains instead of crashing. */
  rcConfigured: boolean;
  prefs: Prefs;
  weights: Weights;
  log: LogRow[];
  info: CustomerInfo | null;
  offering: PurchasesOffering | null;
  setContext(ctx: EatingContext): Promise<void>;
  refreshInfo(): Promise<void>;
  refreshOfferings(): Promise<void>;
  logCheck(plate: string, ceiling: Tier): Promise<number>;
  logAdd(rowTs: number, add: Add | null): Promise<void>;
  logFace(rowTs: number, add: Add | null, face: Face): Promise<void>;
  resetLearned(): Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [rcConfigured, setRcConfigured] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [log, setLog] = useState<LogRow[]>([]);
  const [info, setInfo] = useState<CustomerInfo | null>(null);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const logRef = useRef(log);
  logRef.current = log;

  const refreshInfo = useCallback(async () => {
    try {
      setInfo(await getCustomerInfo());
    } catch {
      /* offline: keep the last known info; the gate treats null as free */
    }
  }, []);

  const refreshOfferings = useCallback(async () => {
    try {
      const o = await getOfferings();
      setOffering(o.current ?? null);
    } catch {
      /* offline: badges show "Locked" without a price */
    }
  }, []);

  useEffect(() => {
    let off = () => {};
    (async () => {
      const [p, w, l] = await Promise.all([loadPrefs(), loadWeights(), loadLog()]);
      const region = getLocales()[0]?.regionCode ?? null;
      const withCurrency = p.onboarded ? p : { ...p, currency: currencyForRegion(region) };
      setPrefs(withCurrency);
      setWeights(w);
      setLog(l);
      const configured = configurePurchases();
      setRcConfigured(configured);
      if (configured) {
        off = onCustomerInfo(setInfo);
        await Promise.all([refreshInfo(), refreshOfferings()]);
      }
      setReady(true);
    })();
    return () => off();
  }, [refreshInfo, refreshOfferings]);

  const setContext = useCallback(
    async (ctx: EatingContext) => {
      const next = { ...prefs, eating_context: ctx, onboarded: true };
      setPrefs(next);
      await savePrefs(next);
      if (!rcConfigured) return;
      try {
        const o = await setEatingContext(ctx);
        setOffering(o.current ?? null);
      } catch {
        /* the attribute is retried on the next launch by the SDK's own queue */
      }
    },
    [prefs, rcConfigured],
  );

  const logCheck = useCallback(async (plate: string, ceiling: Tier) => {
    const row: LogRow = { day: today(), ts: Date.now(), plate, ceiling, add: null, face: null };
    const next = [...logRef.current, row];
    setLog(next);
    await saveLog(next);
    return row.ts;
  }, []);

  const logAdd = useCallback(async (rowTs: number, add: Add | null) => {
    const next = logRef.current.map((r) => (r.ts === rowTs ? { ...r, add: add?.id ?? null } : r));
    setLog(next);
    await saveLog(next);
  }, []);

  const logFace = useCallback(
    async (rowTs: number, add: Add | null, face: Face) => {
      const next = logRef.current.map((r) => (r.ts === rowTs ? { ...r, face } : r));
      setLog(next);
      const w = applyFace(weights, add, face);
      setWeights(w);
      await Promise.all([saveLog(next), saveWeights(w)]);
    },
    [weights],
  );

  const resetLearned = useCallback(async () => {
    const w = resetWeights();
    setWeights(w);
    await saveWeights(w);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      ready,
      rcConfigured,
      prefs,
      weights,
      log,
      info,
      offering,
      setContext,
      refreshInfo,
      refreshOfferings,
      logCheck,
      logAdd,
      logFace,
      resetLearned,
    }),
    [
      ready,
      rcConfigured,
      prefs,
      weights,
      log,
      info,
      offering,
      setContext,
      refreshInfo,
      refreshOfferings,
      logCheck,
      logAdd,
      logFace,
      resetLearned,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside AppProvider');
  return v;
}
