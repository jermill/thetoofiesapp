import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ToofieSprite } from '../components/ToofieSprite';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { loadUiPrefs, saveUiPrefs } from '../lib/uiPrefs';

export function AuthScreen() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [mode, setMode] = useState<'in' | 'up'>('up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  function goNext() {
    const prefs = loadUiPrefs();
    navigate(prefs.onboardingDone ? '/' : '/onboarding', { replace: true });
  }

  function finishSignedIn(displayName: string) {
    saveUiPrefs({
      authGateDone: true,
      signedInMock: true,
      displayName,
    });
    goNext();
  }

  async function submit() {
    if (busy) return;
    const mail = email.trim();
    if (!mail || !password) {
      show('Email + password needed', { tone: 'soft', anim: 'think', ms: 1600 });
      return;
    }
    setBusy(true);
    try {
      if (mode === 'up') {
        const { data, error } = await supabase.auth.signUp({
          email: mail,
          password,
          options: {
            data: { display_name: name.trim() || 'Friend' },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (data.session) {
          show('Account created - welcome in', { tone: 'good', anim: 'cheer', ms: 2000 });
          finishSignedIn(name.trim() || 'Friend');
        } else {
          // Email confirmation required before the session exists.
          setConfirmSent(true);
          show('Check your email to confirm', { tone: 'soft', anim: 'wave', ms: 2400 });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: mail,
          password,
        });
        if (error) throw error;
        const dn =
          (data.user?.user_metadata?.display_name as string | undefined) ||
          name.trim() ||
          'Friend';
        show('Signed in - welcome back', { tone: 'good', anim: 'wave', ms: 1800 });
        finishSignedIn(dn);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      show(msg, { tone: 'soft', anim: 'shrug', ms: 2600 });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flow-screen flow-dense">
      <div className="flow-topbar">
        <p className="ui-only-chip">Accounts live · dessert data stays on this device</p>
        <p className="flow-step-pill">Gate</p>
      </div>

      <div className="flow-callouts" aria-hidden>
        <span className="flow-callout">Real accounts</span>
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
          Accounts unlock sync + Moments later. Your dessert logs stay on this device.
        </p>
      </div>

      <div className="flow-chip-row" aria-label="Quick tags">
        <span className="flow-chip">Logs stay local</span>
        <span className="flow-chip">Privacy first</span>
        <span className="flow-chip">No spam</span>
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
        {confirmSent ? (
          <div className="auth-confirm">
            <p className="eyebrow">One more step</p>
            <p className="title buddy-title-sm">Confirm your email</p>
            <p className="muted">
              We sent a link to <strong>{email.trim()}</strong>. Tap it, then sign in here.
            </p>
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                setConfirmSent(false);
                setMode('in');
              }}
            >
              I confirmed - sign in
            </button>
            <button type="button" className="ghost-btn" onClick={() => setConfirmSent(false)}>
              Back
            </button>
          </div>
        ) : (
          <>
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'up' ? 'new-password' : 'current-password'}
              />
            </label>

            <button
              type="button"
              className="primary-btn"
              onClick={() => void submit()}
              disabled={busy}
            >
              {busy ? 'One sec…' : mode === 'up' ? 'Create account' : 'Sign in'}
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
          </>
        )}
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
        Auth runs on Supabase; only your email + display name are stored. Dessert logs never
        leave this device. <Link to="/resources">ED resources</Link>
      </p>
    </div>
  );
}
