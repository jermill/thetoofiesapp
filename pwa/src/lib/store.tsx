// On-device store for the Toofies PWA — localStorage only, no backend.
// Provisional UI direction: OCHA soft-brutalist (D11–D15 still open).

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  availability,
  balance,
  daysSinceLastDessert,
  initialState,
  isCleanSoFarToday,
  lastDessertDate,
  lastSevenDays,
  onPlanStreak,
  pendingPointsToday,
  streakMilestoneToday,
  type EconomyState,
} from './economy';
import { makeEntry, type TreatEntry, type TreatKind } from './treats';

const STORAGE_KEY = 'toofies.pwa.v1';

function isValidSaved(v: unknown): v is Partial<EconomyState> {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  if ('entries' in s && !Array.isArray(s.entries)) return false;
  if ('dessertCost' in s && typeof s.dessertCost !== 'number') return false;
  if ('healthConnected' in s && typeof s.healthConnected !== 'boolean') return false;
  if ('installDate' in s && typeof s.installDate !== 'string') return false;
  if (
    'stepsByDay' in s &&
    (typeof s.stepsByDay !== 'object' || s.stepsByDay === null || Array.isArray(s.stepsByDay))
  ) {
    return false;
  }
  return true;
}

/** Seed a week of clean days so the mechanic is visible on first open. */
function demoState(now = new Date()): EconomyState {
  const install = new Date(now);
  install.setDate(install.getDate() - 5);
  install.setHours(9, 0, 0, 0);
  return {
    ...initialState(install),
    installDate: install.toISOString(),
  };
}

type Store = {
  ready: boolean;
  state: EconomyState;
  logDessert: (kind: TreatKind, at?: Date) => void;
  removeEntry: (id: string) => void;
  setDessertCost: (cost: number) => void;
  reset: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EconomyState>(() => demoState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as unknown;
        if (isValidSaved(saved)) {
          setState((prev) => ({ ...prev, ...saved }));
        }
      }
    } catch {
      // Corrupt store — keep demo seed.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Quota / private mode — continue in-memory.
    }
  }, [state, ready]);

  const store = useMemo<Store>(
    () => ({
      ready,
      state,
      logDessert: (kind, at = new Date()) => {
        if (!ready) return;
        setState((s) => ({
          ...s,
          entries: [...s.entries, makeEntry(kind, s.dessertCost, at)],
        }));
      },
      removeEntry: (id) => {
        if (!ready) return;
        setState((s) => ({ ...s, entries: s.entries.filter((e: TreatEntry) => e.id !== id) }));
      },
      setDessertCost: (cost) => {
        if (!ready) return;
        setState((s) => ({ ...s, dessertCost: Math.max(10, Math.min(100, Math.round(cost))) }));
      },
      reset: () => {
        if (!ready) return;
        setState(demoState());
      },
    }),
    [ready, state],
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}

export function useToofies(now: Date = new Date()) {
  const { state } = useStore();
  return useMemo(
    () => ({
      daysSinceLastDessert: daysSinceLastDessert(state, now),
      lastDessertDate: lastDessertDate(state),
      cleanSoFarToday: isCleanSoFarToday(state, now),
      balance: balance(state, now),
      availability: availability(state, now),
      pendingPointsToday: pendingPointsToday(state, now),
      onPlanStreak: onPlanStreak(state, now),
      streakMilestoneToday: streakMilestoneToday(state, now),
      week: lastSevenDays(state, now),
    }),
    // now is a render snapshot
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, now.getTime()],
  );
}
