import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useToast } from '../components/Toast';
import { deleteAccount, exportLocalData } from '../lib/account';
import { defaultBuddyState, saveBuddy } from '../lib/buddy';
import { clearLogMeta } from '../lib/logMeta';
import { saveProfile } from '../lib/profile';
import { useStore } from '../lib/store';
import { loadUiPrefs, saveUiPrefs } from '../lib/uiPrefs';

export function PrivacyScreen() {
  const { reset } = useStore();
  const { show } = useToast();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState('');
  const [busyDelete, setBusyDelete] = useState(false);
  const signedIn = loadUiPrefs().signedInMock;

  function wipeLocal() {
    reset();
    saveUiPrefs({
      authGateDone: false,
      onboardingDone: false,
      guestMode: false,
      signedInMock: false,
      displayName: '',
      economyOptIn: true,
      notifyEvening: false,
      notifyMilestone: true,
      notifySnarky: true,
      healthConnectedMock: false,
      theme: 'light',
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
  }

  function deleteLocal() {
    if (confirm.trim().toUpperCase() !== 'DELETE') {
      show('Type DELETE to confirm', { tone: 'soft', anim: 'think', ms: 1800 });
      return;
    }
    wipeLocal();
    show('Local data cleared', { tone: 'soft', anim: 'sit', ms: 2000 });
    navigate('/auth', { replace: true });
  }

  async function deleteEverything() {
    if (confirm.trim().toUpperCase() !== 'DELETE') {
      show('Type DELETE to confirm', { tone: 'soft', anim: 'think', ms: 1800 });
      return;
    }
    setBusyDelete(true);
    const res = await deleteAccount();
    setBusyDelete(false);
    if (!res.ok) {
      show(`Couldn’t delete the account: ${res.reason}`, { tone: 'soft', anim: 'shrug', ms: 2600 });
      return;
    }
    wipeLocal();
    show('Account + local data deleted', { tone: 'soft', anim: 'sit', ms: 2200 });
    navigate('/auth', { replace: true });
  }

  function downloadExport() {
    const blob = new Blob([exportLocalData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toofies-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    show('Export downloaded', { tone: 'good', anim: 'wave', ms: 1600 });
  }

  return (
    <>
      <h1 className="screen-title">Privacy</h1>
      <p className="lede">
        Short version: your dessert log lives on this device. Accounts store only what sync needs.
      </p>

      <section className="card">
        <p className="eyebrow">What we store &amp; where</p>
        <ul className="plain-list">
          <li>
            <strong>On this device:</strong> dessert log, streaks, profile, buddy prefs, settings
            (browser localStorage).
          </li>
          <li>
            <strong>With an account (Supabase):</strong> your email, display name, and - so your
            log can follow you across devices - a synced copy of your dessert entries.
          </li>
          <li>
            <strong>Never:</strong> calories, weight, payment or banking details, live GPS,
            third-party ad trackers, analytics pipelines.
          </li>
        </ul>
      </section>

      <section className="card">
        <p className="eyebrow">Your rights</p>
        <ul className="plain-list">
          <li>Export everything as JSON, any time (below).</li>
          <li>Delete local data, or your whole account, in-app - no email required.</li>
          <li>Guest mode uses no account and sends nothing.</li>
        </ul>
        <p className="muted">
          Prototype notice: this is a pre-release demo. Full GDPR/CCPA policy text lands with the
          public release.
        </p>
      </section>

      <section className="card stack-form">
        <p className="eyebrow">Export your data</p>
        <p className="muted">One JSON file with everything Toofies knows on this device.</p>
        <button type="button" className="primary-btn" onClick={downloadExport}>
          Download my data
        </button>
      </section>

      <section className="card stack-form">
        <p className="eyebrow">Delete</p>
        <p className="muted">
          {signedIn
            ? 'Deletes your Supabase account server-side and wipes this device.'
            : 'Wipes all Toofies data from this device.'}
        </p>
        <label className="field">
          <span>Type DELETE to confirm</span>
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" />
        </label>
        {signedIn ? (
          <>
            <button
              type="button"
              className="primary-btn danger-btn"
              disabled={busyDelete}
              onClick={() => void deleteEverything()}
            >
              {busyDelete ? 'Deleting…' : 'Delete account + local data'}
            </button>
            <button type="button" className="ghost-btn" onClick={deleteLocal}>
              Only clear this device
            </button>
          </>
        ) : (
          <button type="button" className="primary-btn danger-btn" onClick={deleteLocal}>
            Delete local data
          </button>
        )}
        <Link to="/resources" className="ghost-btn">
          Care &amp; ED resources
        </Link>
      </section>
    </>
  );
}
