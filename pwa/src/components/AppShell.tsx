import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <main className="app-main">{children}</main>
      <nav className="bottom-nav" aria-label="Primary">
        <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="icon" aria-hidden>
            ⌂
          </span>
          Home
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
        <NavLink to="/you" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="icon" aria-hidden>
            ●
          </span>
          You
        </NavLink>
      </nav>
    </div>
  );
}
