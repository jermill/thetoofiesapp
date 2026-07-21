import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useToast } from '../components/Toast';
import { getLogMeta } from '../lib/logMeta';
import { loadProfile } from '../lib/profile';
import { useStore, useToofies } from '../lib/store';
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

export function YouScreen() {
  const { state, setDessertCost, reset, removeEntry } = useStore();
  const { show } = useToast();
  const now = new Date();
  const t = useToofies(now);
  const recent = [...state.entries].reverse().slice(0, 12);
  const [prefs, setPrefs] = useState(loadUiPrefs);
  const profile = loadProfile();
  const name = profile.displayName || prefs.displayName || 'Friend';
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <>
      <div className="brand-lockup">
        <div className="brand-left">
          <h1 className="screen-title">You</h1>
          <p className="lede">
            {prefs.signedInMock || profile.displayName
              ? `${name}${profile.locationLabel ? ` · ${profile.locationLabel}` : ''}`
              : 'Local preview · edit your profile anytime'}
          </p>
        </div>
        <Link to="/profile" className="you-pfp" aria-label="Edit profile">
          {profile.avatarDataUrl ? (
            <img src={profile.avatarDataUrl} alt="" />
          ) : (
            <span>{initial}</span>
          )}
        </Link>
      </div>

      <section className="card">
        <p className="eyebrow">Snapshot</p>
        <p className="title" style={{ fontSize: 18 }}>
          {t.onPlanStreak} days on plan · {t.availability.balance} pts banked
        </p>
        <p className="muted">
          {t.daysSinceLastDessert === null
            ? 'No desserts logged yet.'
            : t.daysSinceLastDessert === 0
              ? 'Last dessert: today'
              : `Last dessert: ${t.daysSinceLastDessert} day${t.daysSinceLastDessert === 1 ? '' : 's'} ago`}
        </p>
      </section>

      <section className="card">
        <p className="eyebrow">Account & sync</p>
        <div className="link-rows">
          <Link to="/profile">Edit profile (photo, location, bio)</Link>
          <Link to="/auth">{prefs.signedInMock ? 'Account (mock)' : 'Sign in / create account'}</Link>
          <Link to="/recap">Day recap / evening check-in</Link>
          <Link to="/buddies">Buddies & dessert walks</Link>
          <Link to="/moments">Moments feed</Link>
          <Link to="/notifications">Reminders</Link>
          <Link to="/widget">Home Screen widget preview</Link>
          <Link to="/privacy">Privacy & delete data</Link>
          <Link to="/resources">Care & ED resources</Link>
          <Link to="/onboarding">Replay onboarding</Link>
        </div>
        {prefs.signedInMock && (
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setPrefs(saveUiPrefs({ signedInMock: false, displayName: '' }))}
          >
            Sign out (mock)
          </button>
        )}
      </section>

      <section className="card">
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
      </section>

      <section className="card">
        <p className="eyebrow">Recent desserts</p>
        {recent.length === 0 ? (
          <p className="empty">Nothing logged yet. When you enjoy one, it’ll show up here.</p>
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

      <section className="card">
        <p className="eyebrow">Data</p>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => {
            reset();
            show('Local data cleared', { tone: 'soft', anim: 'sit', ms: 1800 });
          }}
        >
          Reset local preview data
        </button>
        <p className="muted" style={{ marginTop: 8 }}>
          Screens beyond Home/Log/You are UI shells — no sync or push yet.
        </p>
      </section>
    </>
  );
}
