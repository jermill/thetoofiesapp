import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  IconBell,
  IconBuddies,
  IconCamera,
  IconHeart,
  IconMoon,
  IconShield,
  IconSpark,
  IconWidget,
} from '../components/NavIcons';
import { ToofieSprite } from '../components/ToofieSprite';
import { useToast } from '../components/Toast';
import { getLogMeta } from '../lib/logMeta';
import { loadProfile } from '../lib/profile';
import { useStore, useToofies } from '../lib/store';
import { supabase } from '../lib/supabase';
import { loadUiPrefs, saveUiPrefs } from '../lib/uiPrefs';

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const SHORTCUTS = [
  { to: '/buddies', label: 'Buddies', blurb: 'Walks & cheers', Icon: IconBuddies, tone: 'matcha' },
  { to: '/explore', label: 'Dessert map', blurb: 'Google Maps', Icon: IconSpark, tone: 'blossom' },
  { to: '/recap', label: 'Day recap', blurb: 'Gentle check-in', Icon: IconMoon, tone: 'ink' },
  { to: '/notifications', label: 'Nudges', blurb: 'Snarky Toofie', Icon: IconBell, tone: 'lime' },
] as const;

export function YouScreen() {
  const { state, setDessertCost, reset, removeEntry } = useStore();
  const { show } = useToast();
  const now = new Date();
  const t = useToofies(now);
  const recent = [...state.entries].reverse().slice(0, 8);
  const [prefs, setPrefs] = useState(loadUiPrefs);
  const [showMore, setShowMore] = useState(false);
  const profile = loadProfile();
  const place = profile.locationLabel || profile.city;
  const name = profile.displayName || prefs.displayName || 'Dessert friend';
  const initial = name.slice(0, 1).toUpperCase();
  const handle = profile.handle ? `@${profile.handle}` : 'tap to personalize';
  const ready = t.availability.bankedDesserts > 0;

  return (
    <>
      {prefs.guestMode && (
        <section className="guest-banner">
          <div className="guest-banner-copy">
            <strong>Guest mode</strong>
            <span>Core tracking only - buddies, moments, map + nudges are locked.</span>
          </div>
          <Link to="/auth" className="mini-btn">
            Create account
          </Link>
        </section>
      )}
      <section className="you-hero">
        <div className="you-hero-glow" aria-hidden />
        <div className="you-hero-top">
          <Link to="/profile" className="you-avatar-wrap" aria-label="Edit profile photo">
            <span className="you-avatar">
              {profile.avatarDataUrl ? (
                <img src={profile.avatarDataUrl} alt="" />
              ) : (
                <span>{initial}</span>
              )}
            </span>
            <span className="you-avatar-edit">Edit</span>
          </Link>
          <ToofieSprite anim={ready ? 'ready' : 'wave'} size={88} className="you-hero-toofie" />
        </div>
        <div className="you-hero-copy">
          <p className="you-kicker">Your dessert passport</p>
          <h1 className="you-name">{name}</h1>
          <p className="you-meta">
            <span>{handle}</span>
            {place ? <span className="you-place">{place}</span> : null}
          </p>
          {profile.bio ? <p className="you-bio">{profile.bio}</p> : (
            <p className="you-bio muted">Add a tiny bio - guilt-free vibes only.</p>
          )}
          <Link to="/profile" className="you-edit-btn">
            Make it yours →
          </Link>
        </div>
      </section>

      <section className="you-stats" aria-label="Your rhythm">
        <div className="you-stat">
          <strong>{t.onPlanStreak}</strong>
          <span>days on plan</span>
        </div>
        <div className="you-stat">
          <strong>{t.availability.balance}</strong>
          <span>pts banked</span>
        </div>
        <div className="you-stat">
          <strong>{state.entries.length}</strong>
          <span>treats logged</span>
        </div>
      </section>

      <section className="you-week card" aria-label="This week">
        <div className="you-week-head">
          <p className="eyebrow">This week</p>
          <IconSpark size={18} />
        </div>
        <div className="streak-row">
          {t.week.map((d) => (
            <div
              key={d.key}
              className={`streak-day${d.count > 0 ? ' logged' : ' clean'}${d.label === 'Today' ? ' today' : ''}`}
            >
              <div className="dot">{d.count > 0 ? d.count : '✓'}</div>
              <span className="lbl">{d.label.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Shortcuts">
        <p className="eyebrow you-section-label">Jump in</p>
        <div className="you-tiles">
          {SHORTCUTS.map(({ to, label, blurb, Icon, tone }) => (
            <Link key={to} to={to} className={`you-tile tone-${tone}`}>
              <Icon size={22} />
              <div>
                <strong>{label}</strong>
                <span>{blurb}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="card you-history">
        <div className="you-week-head">
          <p className="eyebrow">Recent treats</p>
          <Link to="/log" className="you-mini-link">
            Log one
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="empty">Nothing yet - your first treat story starts on Log.</p>
        ) : (
          <ul className="history-list">
            {recent.map((e) => {
              const meta = getLogMeta(e.id);
              return (
                <li key={e.id}>
                  <div className="left">
                    {meta?.photoDataUrl ? (
                      <img className="history-thumb" src={meta.photoDataUrl} alt="" />
                    ) : (
                      <span aria-hidden>{e.emoji}</span>
                    )}
                    <div>
                      <div>{e.name}</div>
                      <div className="when">
                        {formatWhen(e.date)}
                        {meta?.place ? ` · ${meta.place}` : ''}
                      </div>
                      {meta?.note ? <div className="history-note">{meta.note}</div> : null}
                    </div>
                  </div>
                  <button type="button" className="ghost-btn" onClick={() => removeEntry(e.id)}>
                    Undo
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="you-more">
        <button
          type="button"
          className="you-more-toggle"
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
        >
          {showMore ? 'Hide extras' : 'Settings & extras'}
        </button>
        {showMore && (
          <div className="you-more-panel">
            <div className="you-extra-links">
              <Link to="/explore">
                <IconSpark size={18} /> Dessert map
              </Link>
              <Link to="/moments">
                <IconCamera size={18} /> Moments
              </Link>
              <Link to="/widget">
                <IconWidget size={18} /> Widget preview
              </Link>
              <Link to="/privacy">
                <IconShield size={18} /> Privacy
              </Link>
              <Link to="/resources">
                <IconHeart size={18} /> Care resources
              </Link>
              <Link to="/auth">{prefs.signedInMock ? 'Account' : 'Sign in'}</Link>
              <Link to="/onboarding">Replay intro</Link>
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <p className="eyebrow">Appearance</p>
              <label className="toggle-row">
                <span>
                  <strong>Dark mode</strong>
                  <span className="muted">Provisional · toggle anytime.</span>
                </span>
                <input
                  type="checkbox"
                  checked={prefs.theme === 'dark'}
                  onChange={() => {
                    const theme = prefs.theme === 'dark' ? 'light' : 'dark';
                    setPrefs(saveUiPrefs({ theme }));
                    show(theme === 'dark' ? 'Dark mode on' : 'Light mode on', {
                      tone: 'soft',
                      anim: theme === 'dark' ? 'sleepy' : 'wave',
                      ms: 1400,
                    });
                  }}
                />
              </label>
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <p className="eyebrow">Points per dessert</p>
              <div className="settings-row">
                <label htmlFor="cost">Threshold (placeholder)</label>
                <strong>{state.dessertCost}</strong>
              </div>
              <input
                id="cost"
                type="range"
                min={10}
                max={100}
                step={5}
                value={state.dessertCost}
                onChange={(e) => setDessertCost(Number(e.target.value))}
                aria-valuetext={`${state.dessertCost} points`}
                style={{ width: '100%' }}
              />
              <label className="toggle-row" style={{ marginTop: 10 }}>
                <span>
                  <strong>Points economy</strong>
                  <span className="muted">Opt-in experiment (D7–D9).</span>
                </span>
                <input
                  type="checkbox"
                  checked={prefs.economyOptIn}
                  onChange={() => setPrefs(saveUiPrefs({ economyOptIn: !prefs.economyOptIn }))}
                />
              </label>
            </div>

            <div className="you-danger-row">
              {prefs.signedInMock && (
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => {
                    void supabase.auth.signOut();
                    setPrefs(saveUiPrefs({ signedInMock: false, displayName: '' }));
                    show('Signed out', { tone: 'soft', anim: 'peace', ms: 1500 });
                  }}
                >
                  Sign out
                </button>
              )}
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  reset();
                  show('Local data cleared', { tone: 'soft', anim: 'sit', ms: 1800 });
                }}
              >
                Reset preview data
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
