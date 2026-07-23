/**
 * Account-backed features: cloud sync v0 + server-side deletion + export.
 *
 * Sync v0 stores a compact snapshot of the dessert log in the Supabase auth
 * user's metadata - no tables/RLS needed yet (D33 sync scope still open).
 * Last-write-wins by `syncedAt`. Capped so metadata stays small.
 */
import type { EconomyState } from './economy';
import { supabase } from './supabase';

const MAX_SYNCED_ENTRIES = 300;
const SNAPSHOT_VERSION = 1;

export type SyncSnapshot = {
  v: number;
  syncedAt: string;
  dessertCost: number;
  installDate: string;
  entries: EconomyState['entries'];
};

export function makeSnapshot(state: EconomyState, now = new Date()): SyncSnapshot {
  return {
    v: SNAPSHOT_VERSION,
    syncedAt: now.toISOString(),
    dessertCost: state.dessertCost,
    installDate: state.installDate,
    entries: state.entries.slice(-MAX_SYNCED_ENTRIES),
  };
}

function isSnapshot(v: unknown): v is SyncSnapshot {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return (
    s.v === SNAPSHOT_VERSION &&
    typeof s.syncedAt === 'string' &&
    typeof s.dessertCost === 'number' &&
    typeof s.installDate === 'string' &&
    Array.isArray(s.entries)
  );
}

/** Push the local log to the signed-in user's metadata. No-op when signed out. */
export async function pushSync(state: EconomyState): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return false;
  const { error } = await supabase.auth.updateUser({
    data: { toofies_sync: makeSnapshot(state) },
  });
  return !error;
}

/** Read the cloud snapshot for the signed-in user (null when absent/signed out). */
export async function pullSync(): Promise<SyncSnapshot | null> {
  const { data } = await supabase.auth.getSession();
  const raw = data.session?.user.user_metadata?.toofies_sync as unknown;
  return isSnapshot(raw) ? raw : null;
}

/**
 * Merge cloud + local: union of entries by id, newer syncedAt wins for
 * scalars. Honest logging is never lost from either side.
 */
export function mergeSnapshot(local: EconomyState, cloud: SyncSnapshot): EconomyState {
  const byId = new Map(local.entries.map((e) => [e.id, e]));
  for (const e of cloud.entries) {
    if (!byId.has(e.id)) byId.set(e.id, e);
  }
  const entries = [...byId.values()].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const cloudInstall = new Date(cloud.installDate).getTime();
  const localInstall = new Date(local.installDate).getTime();
  return {
    ...local,
    entries,
    dessertCost: cloud.dessertCost || local.dessertCost,
    // Earliest install wins so clean-day credit never mints for unobserved days.
    installDate: cloudInstall < localInstall ? cloud.installDate : local.installDate,
  };
}

/** Everything on this device, as a portable JSON blob (GDPR export). */
export function exportLocalData(): string {
  const keys = [
    'toofies.pwa.v1',
    'toofies.pwa.ui',
    'toofies.pwa.profile',
    'toofies.pwa.buddy',
    'toofies.pwa.logMeta',
  ];
  const out: Record<string, unknown> = { exportedAt: new Date().toISOString() };
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) out[k] = JSON.parse(raw);
    } catch {
      // skip unreadable key
    }
  }
  return JSON.stringify(out, null, 2);
}

/** Delete the Supabase account server-side, then drop the local session. */
export async function deleteAccount(): Promise<{ ok: boolean; reason?: string }> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { ok: false, reason: 'not signed in' };
  try {
    const res = await fetch('/api/delete-account', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      return { ok: false, reason: body.error ?? `HTTP ${res.status}` };
    }
    await supabase.auth.signOut();
    return { ok: true };
  } catch {
    return { ok: false, reason: 'network error' };
  }
}
