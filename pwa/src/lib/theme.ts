/** Apply / sync light-dark theme on <html>. */

export type ThemeMode = 'light' | 'dark';

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = mode;
  root.style.colorScheme = mode;
}

export function initTheme(mode: ThemeMode) {
  applyTheme(mode);
}
