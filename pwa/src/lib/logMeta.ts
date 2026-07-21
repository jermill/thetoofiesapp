/** Optional per-log photo/note metadata (UI-only, on-device). */

const KEY = 'toofies.pwa.logMeta';

export type LogMeta = {
  note?: string;
  photoDataUrl?: string;
  place?: string;
};

export function loadLogMeta(): Record<string, LogMeta> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, LogMeta>;
  } catch {
    return {};
  }
}

export function getLogMeta(id: string): LogMeta | undefined {
  return loadLogMeta()[id];
}

export function saveLogMeta(id: string, meta: LogMeta) {
  const all = loadLogMeta();
  all[id] = { ...all[id], ...meta };
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // if photo too big, save note/place only
    all[id] = { note: meta.note, place: meta.place };
    try {
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch {
      // ignore
    }
  }
}

export function clearLogMeta() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
