import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

const HIDE_NAV = new Set(['/onboarding', '/auth']);

export function AppShell({ children, path }: { children: ReactNode; path: string }) {
  const hideNav = HIDE_NAV.has(path);

  return (
    <div className={`app-shell${hideNav ? ' flow-shell' : ''}`}>
      <main className="app-main">{children}</main>
      {!hideNav && (
        <nav className="bottom-nav bottom-nav-5" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="icon" aria-hidden>
              ⌂
            </span>
            Home
          </NavLink>
          <NavLink to="/move" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="icon" aria-hidden>
              ✦
            </span>
            Move
          </NavLink>
          <NavLink
            to="/log"
            className={({ isActive }) => `nav-item center${isActive ? ' active' : ''}`}
          >
            <span className="fab" aria-hidden>
              +
            </span>
            Log
          </NavLink>
          <NavLink
            to="/moments"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="icon" aria-hidden>
              ◇
            </span>
            Moments
          </NavLink>
          <NavLink to="/you" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="icon" aria-hidden>
              ●
            </span>
            You
          </NavLink>
        </nav>
      )}
    </div>
  );
}
