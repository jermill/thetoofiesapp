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
        <nav className="bottom-nav bottom-nav-5 icons-only" aria-label="Primary">
          <NavLink
            to="/"
            end
            aria-label="Home"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <IconHome className="nav-ico" />
          </NavLink>
          <NavLink
            to="/move"
            aria-label="Move"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <IconMove className="nav-ico" />
          </NavLink>
          <NavLink
            to="/log"
            aria-label="Log a dessert"
            className={({ isActive }) => `nav-item center${isActive ? ' active' : ''}`}
          >
            <span className="fab" aria-hidden>
              <IconLog size={26} />
            </span>
          </NavLink>
          <NavLink
            to="/buddies"
            aria-label="Buddies"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <IconBuddies className="nav-ico" />
          </NavLink>
          <NavLink
            to="/you"
            aria-label="You"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <IconYou className="nav-ico" />
          </NavLink>
        </nav>
      )}
    </div>
  );
}
