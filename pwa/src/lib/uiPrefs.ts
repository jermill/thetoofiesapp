/** Tiny UI-only prefs for prototype screens (no backend). */
const KEY = 'toofies.pwa.ui';

export type UiPrefs = {
  onboardingDone: boolean;
  signedInMock: boolean;
  displayName: string;
  economyOptIn: boolean;
  notifyEvening: boolean;
  notifyMilestone: boolean;
  healthConnectedMock: boolean;
};

const defaults: UiPrefs = {
  onboardingDone: false,
  signedInMock: false,
  displayName: '',
  economyOptIn: true,
  notifyEvening: false,
  notifyMilestone: true,
  healthConnectedMock: false,
};

export function loadUiPrefs(): UiPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw) as Partial<UiPrefs>;
    return { ...defaults, ...parsed };
  } catch {
    return { ...defaults };
  }
}

export function saveUiPrefs(patch: Partial<UiPrefs>): UiPrefs {
  const next = { ...loadUiPrefs(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}
