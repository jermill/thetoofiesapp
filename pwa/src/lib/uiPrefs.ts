/** Tiny UI-only prefs for prototype screens (no backend). */
const KEY = 'toofies.pwa.ui';

export type UiPrefs = {
  /** Create-account / sign-in / continue-without completed. */
  authGateDone: boolean;
  onboardingDone: boolean;
  signedInMock: boolean;
  displayName: string;
  economyOptIn: boolean;
  notifyEvening: boolean;
  notifyMilestone: boolean;
  healthConnectedMock: boolean;
};

const defaults: UiPrefs = {
  authGateDone: false,
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
    const next = { ...defaults, ...parsed };
    // Older builds finished onboarding before auth-first existed.
    if (next.onboardingDone && parsed.authGateDone === undefined) {
      next.authGateDone = true;
    }
    return next;
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
