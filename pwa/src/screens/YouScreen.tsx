import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ToofieSprite } from '../components/ToofieSprite';
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
  const now = new Date();
  const t = useToofies(now);
  const recent = [...state.entries].reverse().slice(0, 12);
  const [prefs, setPrefs] = useState(loadUiPrefs);

  return (
    <>
      <div className="brand-lockup">
        <div className="brand-left">
          <h1 className="screen-title">You</h1>
          <p className="lede">
            {prefs.signedInMock
              ? `Signed in (mock) as ${prefs.displayName || 'Friend'}`
              : 'Local preview · account optional'}
          </p>
        </div>
        <ToofieSprite anim="proud" size={80} />
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
          <Link to="/auth">{prefs.signedInMock ? 'Account (mock)' : 'Sign in / create account'}</Link>
          <Link to="/notifications">Reminders</Link>
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
            {recent.map((e) => (
              <li key={e.id}>
                <div className="left">
                  <span aria-hidden>{e.emoji}</span>
                  <div>
                    <div>{e.name}</div>
                    <div className="when">{formatWhen(e.date)}</div>
                  </div>
                </div>
                <button type="button" className="ghost-btn" onClick={() => removeEntry(e.id)}>
                  Undo
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <p className="eyebrow">Data</p>
        <button type="button" className="ghost-btn" onClick={reset}>
          Reset local preview data
        </button>
        <p className="muted" style={{ marginTop: 8 }}>
          Screens beyond Home/Log/You are UI shells — no sync or push yet.
        </p>
      </section>
    </>
  );
}
