import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useToast } from '../components/Toast';
import { defaultBuddyState, saveBuddy } from '../lib/buddy';
import { clearLogMeta } from '../lib/logMeta';
import { saveProfile } from '../lib/profile';
import { useStore } from '../lib/store';
import { saveUiPrefs } from '../lib/uiPrefs';

export function PrivacyScreen() {
  const { reset } = useStore();
  const { show } = useToast();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState('');

  function deleteAll() {
    if (confirm.trim().toUpperCase() !== 'DELETE') {
      show('Type DELETE to confirm', { tone: 'soft', anim: 'think', ms: 1800 });
      return;
    }
    reset();
    saveUiPrefs({
      onboardingDone: false,
      signedInMock: false,
      displayName: '',
      economyOptIn: true,
      notifyEvening: false,
      notifyMilestone: true,
      healthConnectedMock: false,
    });
    saveProfile({
      displayName: '',
      handle: '',
      bio: '',
      city: '',
      locationLabel: '',
      locationApprox: true,
      avatarDataUrl: '',
      website: '',
    });
    saveBuddy(defaultBuddyState());
    clearLogMeta();
    show('Local account data cleared', { tone: 'soft', anim: 'sit', ms: 2000 });
    navigate('/onboarding', { replace: true });
  }

  return (
    <>
      <p className="ui-only-chip">Required for accounts · UI stub</p>
      <h1 className="screen-title">Privacy</h1>
      <p className="lede">
        This demo is on-device. When a real backend ships, this page becomes the legal + deletion
        surface Apple requires.
      </p>

      <section className="card">
        <p className="eyebrow">What we collect (today)</p>
        <p className="title" style={{ fontSize: 16 }}>
          Nothing leaves this phone in the PWA demo.
        </p>
        <p className="muted">
          Desserts, profile photo, buddy prefs, and settings stay in localStorage. No analytics
          pipeline yet.
        </p>
      </section>

      <section className="card">
        <p className="eyebrow">When accounts ship (D4)</p>
        <ul className="plain-list">
          <li>Account email + auth</li>
          <li>Synced log + profile (incl. optional photo)</li>
          <li>Moments / buddy data you choose to share</li>
          <li>Approximate location labels — not live GPS by default</li>
        </ul>
        <p className="muted">Full privacy policy copy + GDPR/CCPA still to be written.</p>
      </section>

      <section className="card stack-form">
        <p className="eyebrow">Delete account / local data</p>
        <p className="muted">
          Apple requires in-app deletion when accounts exist. This prototype clears <em>local</em>{' '}
          demo data.
        </p>
        <label className="field">
          <span>Type DELETE to confirm</span>
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" />
        </label>
        <button type="button" className="primary-btn danger-btn" onClick={deleteAll}>
          Delete local data
        </button>
        <Link to="/resources" className="ghost-btn">
          Care & ED resources
        </Link>
      </section>
    </>
  );
}
