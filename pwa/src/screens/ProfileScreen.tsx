import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { ToofieSprite } from '../components/ToofieSprite';
import { useToast } from '../components/Toast';
import { fileToDataUrl, loadProfile, saveProfile, type UserProfile } from '../lib/profile';
import { saveUiPrefs } from '../lib/uiPrefs';

export function ProfileScreen() {
  const { show } = useToast();
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onAvatar(file: File | null) {
    if (!file) return;
    setBusy(true);
    try {
      const avatarDataUrl = await fileToDataUrl(file, 480);
      const next = saveProfile({ avatarDataUrl });
      setProfile(next);
      show('Photo updated (on this device)', { tone: 'good', anim: 'wave', ms: 1800 });
    } catch {
      show('Couldn’t read that photo', { tone: 'soft', anim: 'shrug', ms: 1800 });
    } finally {
      setBusy(false);
    }
  }

  function save() {
    const next = saveProfile(profile);
    setProfile(next);
    if (next.displayName) saveUiPrefs({ displayName: next.displayName, signedInMock: true });
    show('Profile saved locally', { tone: 'good', anim: 'proud', ms: 1800 });
  }

  const initial = (profile.displayName || 'T').slice(0, 1).toUpperCase();

  return (
    <>
      <p className="ui-only-chip">UI only · stored on-device · not synced yet</p>
      <div className="brand-lockup">
        <div className="brand-left">
          <h1 className="screen-title">Profile</h1>
          <p className="lede">Yes — you can update your photo, name, location, and bio here.</p>
        </div>
        <ToofieSprite anim="proud" size={72} />
      </div>

      <section className="card profile-hero-card">
        <button
          type="button"
          className="pfp-btn"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          aria-label="Change profile photo"
        >
          {profile.avatarDataUrl ? (
            <img src={profile.avatarDataUrl} alt="" className="pfp-img" />
          ) : (
            <span className="pfp-fallback">{initial}</span>
          )}
          <span className="pfp-edit">Edit</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => void onAvatar(e.target.files?.[0] ?? null)}
        />
        <div>
          <p className="title" style={{ fontSize: 18, margin: 0 }}>
            {profile.displayName || 'Your name'}
          </p>
          <p className="muted" style={{ margin: 0 }}>
            {profile.handle ? `@${profile.handle}` : 'Add a handle'}
            {profile.locationLabel ? ` · ${profile.locationLabel}` : ''}
          </p>
        </div>
      </section>

      <section className="card stack-form">
        <label className="field">
          <span>Display name</span>
          <input
            value={profile.displayName}
            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            placeholder="e.g. Danny"
          />
        </label>
        <label className="field">
          <span>Handle</span>
          <input
            value={profile.handle}
            onChange={(e) =>
              setProfile({ ...profile, handle: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })
            }
            placeholder="toofie_friend"
          />
        </label>
        <label className="field">
          <span>Bio</span>
          <input
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Dessert walker. Guilt-free."
          />
        </label>
        <label className="field">
          <span>City / area</span>
          <input
            value={profile.city}
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            placeholder="Orlando"
          />
        </label>
        <label className="field">
          <span>Location label (shown on Moments)</span>
          <input
            value={profile.locationLabel}
            onChange={(e) => setProfile({ ...profile, locationLabel: e.target.value })}
            placeholder="Orlando, FL"
          />
        </label>
        <label className="toggle-row">
          <span>
            <strong>Approximate location only</strong>
            <span className="muted">Never share a precise pin by default.</span>
          </span>
          <input
            type="checkbox"
            checked={profile.locationApprox}
            onChange={(e) => setProfile({ ...profile, locationApprox: e.target.checked })}
          />
        </label>
        <button type="button" className="primary-btn" onClick={save} disabled={busy}>
          Save profile
        </button>
        {profile.avatarDataUrl && (
          <button
            type="button"
            className="ghost-btn"
            onClick={() => {
              const next = saveProfile({ avatarDataUrl: '' });
              setProfile(next);
              show('Photo removed', { tone: 'soft', anim: 'sit', ms: 1500 });
            }}
          >
            Remove photo
          </button>
        )}
      </section>

      <p className="fineprint">
        Location here is a <strong>label you type</strong> — not live GPS. Live location sharing is a
        separate, high-sensitivity decision (D23). <Link to="/privacy">Privacy</Link>
      </p>
    </>
  );
}
