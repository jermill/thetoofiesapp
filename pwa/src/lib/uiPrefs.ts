/** Tiny UI-only prefs for prototype screens (no backend). */
import { applyTheme, type ThemeMode } from './theme';

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
  /** Snarky Toofie nudges — playful roast, never guilt. */
  notifySnarky: boolean;
  healthConnectedMock: boolean;
  theme: ThemeMode;
};

const defaults: UiPrefs = {
  authGateDone: false,
  onboardingDone: false,
  signedInMock: false,
  displayName: '',
  economyOptIn: true,
  notifyEvening: false,
  notifyMilestone: true,
  notifySnarky: true,
  healthConnectedMock: false,
  theme: 'light',
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
    if (next.theme !== 'light' && next.theme !== 'dark') next.theme = 'light';
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
  if (patch.theme) applyTheme(next.theme);
  return next;
}

export function hydrateThemeFromPrefs() {
  applyTheme(loadUiPrefs().theme);
}
