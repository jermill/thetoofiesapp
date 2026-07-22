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
        <nav className="dock-nav" aria-label="Primary">
          <NavLink
            to="/"
            end
            aria-label="Home"
            className={({ isActive }) => `dock-item${isActive ? ' active' : ''}`}
          >
            <IconHome className="dock-ico" size={22} />
          </NavLink>
          <NavLink
            to="/move"
            aria-label="Move"
            className={({ isActive }) => `dock-item${isActive ? ' active' : ''}`}
          >
            <IconMove className="dock-ico" size={22} />
          </NavLink>
          <NavLink
            to="/log"
            aria-label="Log a dessert"
            className={({ isActive }) => `dock-item dock-log${isActive ? ' active' : ''}`}
          >
            <span className="dock-log-orb" aria-hidden>
              <IconLog size={22} />
            </span>
          </NavLink>
          <NavLink
            to="/buddies"
            aria-label="Buddies"
            className={({ isActive }) => `dock-item${isActive ? ' active' : ''}`}
          >
            <IconBuddies className="dock-ico" size={22} />
          </NavLink>
          <NavLink
            to="/you"
            aria-label="You"
            className={({ isActive }) => `dock-item${isActive ? ' active' : ''}`}
          >
            <IconYou className="dock-ico" size={22} />
          </NavLink>
        </nav>
      )}
    </div>
  );
}
