import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

import { IconBuddies, IconHome, IconLog, IconMove, IconYou } from './NavIcons';

const HIDE_NAV = new Set(['/onboarding', '/auth']);

export function AppShell({ children, path }: { children: ReactNode; path: string }) {
  const hideNav = HIDE_NAV.has(path);

  return (
    <div className={`app-shell${hideNav ? ' flow-shell' : ''}`}>
      <main className="app-main">{children}</main>
      {!hideNav && (
        <nav className="bottom-nav bottom-nav-5" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <IconHome className="nav-ico" />
            Home
          </NavLink>
          <NavLink to="/move" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <IconMove className="nav-ico" />
            Move
          </NavLink>
          <NavLink
            to="/log"
            className={({ isActive }) => `nav-item center${isActive ? ' active' : ''}`}
          >
            <span className="fab" aria-hidden>
              <IconLog size={26} />
            </span>
            Log
          </NavLink>
          <NavLink
            to="/buddies"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <IconBuddies className="nav-ico" />
            Buddies
          </NavLink>
          <NavLink to="/you" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <IconYou className="nav-ico" />
            You
          </NavLink>
        </nav>
      )}
    </div>
  );
}
