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
    <div className="flow-screen">
      <p className="ui-only-chip">UI only · mock account (nothing is sent)</p>
      <div className="flow-hero">
        <ToofieSprite anim="wave" size={100} />
        <h1 className="flow-title">{mode === 'up' ? 'Create account' : 'Welcome back'}</h1>
        <p className="lede">
          Accounts unlock sync + Moments later. This screen is a visual stub - no auth backend yet.
        </p>
      </div>

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

      <p className="fineprint">
        By continuing you agree this is a prototype. Real privacy policy + deletion arrive with a
        backend. <Link to="/resources">ED resources</Link>
      </p>
    </div>
  );
}
