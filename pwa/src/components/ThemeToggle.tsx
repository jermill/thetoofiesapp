import { useState } from 'react';

import { loadUiPrefs, saveUiPrefs } from '../lib/uiPrefs';
import type { ThemeMode } from '../lib/theme';
import { IconMoon, IconSun } from './NavIcons';

/** One-tap light/dark switch. saveUiPrefs applies the theme to <html>. */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeMode>(() => loadUiPrefs().theme);

  function flip() {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    saveUiPrefs({ theme: next });
  }

  return (
    <button
      type="button"
      className={`theme-toggle${className ? ` ${className}` : ''}`}
      onClick={flip}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
    </button>
  );
}
