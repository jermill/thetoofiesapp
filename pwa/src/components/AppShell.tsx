import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

import { IconBuddies, IconHome, IconLog, IconMove, IconYou } from './NavIcons';
import { ThemeToggle } from './ThemeToggle';

const HIDE_NAV = new Set(['/onboarding', '/auth']);

const LINKS = [
  { to: '/', label: 'Home', end: true, Icon: IconHome },
  { to: '/move', label: 'Move', end: false, Icon: IconMove },
  { to: '/buddies', label: 'Buddies', end: false, Icon: IconBuddies },
  { to: '/you', label: 'You', end: false, Icon: IconYou },
] as const;

export function AppShell({ children, path }: { children: ReactNode; path: string }) {
  const hideNav = HIDE_NAV.has(path);

  return (
    <div className={`app-shell${hideNav ? ' flow-shell' : ''}`}>
      {!hideNav && (
        <aside className="side-nav" aria-label="Primary">
          <NavLink to="/" className="side-brand">
            Toofies
          </NavLink>
          <div className="side-links">
            {LINKS.slice(0, 2).map(({ to, label, end, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
            <NavLink
              to="/log"
              className={({ isActive }) => `side-log${isActive ? ' active' : ''}`}
            >
              <IconLog size={20} />
              <span>Log a dessert</span>
            </NavLink>
            {LINKS.slice(2).map(({ to, label, end, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
          <div className="side-theme-row">
            <span>Appearance</span>
            <ThemeToggle />
          </div>
          <p className="side-foot">Playful, never punitive · no calories, ever</p>
        </aside>
      )}
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
