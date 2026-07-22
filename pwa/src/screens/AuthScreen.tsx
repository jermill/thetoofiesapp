import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ToofieSprite } from '../components/ToofieSprite';
import { useToast } from '../components/Toast';
import { loadUiPrefs, saveUiPrefs } from '../lib/uiPrefs';

export function AuthScreen() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [mode, setMode] = useState<'in' | 'up'>('up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  function goNext() {
    const prefs = loadUiPrefs();
    navigate(prefs.onboardingDone ? '/' : '/onboarding', { replace: true });
  }

  function mockContinue() {
    if (busy) return;
    setBusy(true);
    show(mode === 'up' ? 'Account created (mock)' : 'Signed in (mock)', {
      tone: 'good',
      anim: 'wave',
      ms: 1800,
    });
    window.setTimeout(() => {
      saveUiPrefs({
        authGateDone: true,
        signedInMock: true,
        displayName: name.trim() || 'Friend',
      });
      goNext();
    }, 700);
  }

  return (
    <div className="flow-screen flow-dense">
      <div className="flow-topbar">
        <p className="ui-only-chip">UI only · mock account (nothing is sent)</p>
        <p className="flow-step-pill">Gate</p>
      </div>

      <div className="flow-callouts" aria-hidden>
        <span className="flow-callout">Mock only</span>
        <span className="flow-callout">Skip ok</span>
        <span className="flow-callout">Then onboarding</span>
      </div>

      <div className="flow-hero flow-hero-dense">
        <div className="flow-hero-row">
          <ToofieSprite anim="wave" size={96} className="flow-toofie" />
          <div className="flow-hero-copy">
            <p className="eyebrow">{mode === 'up' ? 'Start here' : 'Welcome back'}</p>
            <h1 className="flow-title">{mode === 'up' ? 'Create account' : 'Sign back in'}</h1>
          </div>
        </div>
        <p className="lede">
          Accounts unlock sync + Moments later. This screen is a visual stub - nothing is sent.
        </p>
      </div>

      <div className="flow-chip-row" aria-label="Quick tags">
        <span className="flow-chip">No backend yet</span>
        <span className="flow-chip">On-device fine</span>
        <span className="flow-chip">Privacy first</span>
        <span className="flow-chip">30-sec hop</span>
      </div>

      <ol className="flow-path-rail flow-path-rail-3" aria-label="First-run path">
        <li className="is-now">
          <span className="flow-path-num">1</span>
          <span className="flow-path-label">Account</span>
        </li>
        <li className="is-next">
          <span className="flow-path-num">2</span>
          <span className="flow-path-label">Onboarding</span>
        </li>
        <li className="is-next">
          <span className="flow-path-num">3</span>
          <span className="flow-path-label">Home</span>
        </li>
      </ol>

      <section className="card stack-form">
        <div className="seg">
          <button
            type="button"
            className={mode === 'up' ? 'on' : ''}
            onClick={() => setMode('up')}
          >
            Sign up
          </button>
          <button
            type="button"
            className={mode === 'in' ? 'on' : ''}
            onClick={() => setMode('in')}
          >
            Sign in
          </button>
        </div>

        {mode === 'up' && (
          <label className="field">
            <span>Display name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Danny"
              autoComplete="nickname"
            />
          </label>
        )}
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" placeholder="••••••••" autoComplete="new-password" />
        </label>

        <button type="button" className="primary-btn" onClick={mockContinue} disabled={busy}>
          {busy ? 'One sec…' : mode === 'up' ? 'Create account (mock)' : 'Sign in (mock)'}
        </button>
        <button
          type="button"
          className="ghost-btn"
          disabled={busy}
          onClick={() => {
            saveUiPrefs({ authGateDone: true });
            show('Continuing locally', { tone: 'soft', anim: 'peace', ms: 1600 });
            goNext();
          }}
        >
          Continue without account
        </button>
      </section>

      <section className="flow-app-peek" aria-hidden>
        <p className="flow-peek-kicker">What happens next</p>
        <div className="flow-peek-row">
          <div className="flow-peek-card">
            <strong>Skim</strong>
            <span>4 quick beats</span>
          </div>
          <div className="flow-peek-card">
            <strong>Meet Toofie</strong>
            <span>Hype, no guilt</span>
          </div>
          <div className="flow-peek-card">
            <strong>Home</strong>
            <span>Log when ready</span>
          </div>
        </div>
      </section>

      <p className="fineprint">
        By continuing you agree this is a prototype. Real privacy policy + deletion arrive with a
        backend. <Link to="/resources">ED resources</Link>
      </p>
    </div>
  );
}
