import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { IconCamera, IconPin } from '../components/NavIcons';
import { ToofieSprite } from '../components/ToofieSprite';
import { useToast } from '../components/Toast';
import { fileToDataUrl, loadProfile, saveProfile, type UserProfile } from '../lib/profile';
import { saveUiPrefs } from '../lib/uiPrefs';

export function ProfileScreen() {
  const { show } = useToast();
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [busy, setBusy] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onAvatar(file: File | null) {
    if (!file) return;
    setBusy(true);
    try {
      const avatarDataUrl = await fileToDataUrl(file, 480);
      const next = saveProfile({ avatarDataUrl });
      setProfile(next);
      show('Looking good', { tone: 'good', anim: 'wave', ms: 1800 });
    } catch {
      show('Couldn’t read that photo', { tone: 'soft', anim: 'shrug', ms: 1800 });
    } finally {
      setBusy(false);
    }
  }

  function save() {
    const patched = {
      ...profile,
      locationLabel: profile.locationLabel.trim() || profile.city.trim(),
    };
    const next = saveProfile(patched);
    setProfile(next);
    if (next.displayName) saveUiPrefs({ displayName: next.displayName, signedInMock: true });
    show('Passport updated', { tone: 'good', anim: 'proud', ms: 2200 });
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2200);
  }

  const initial = (profile.displayName || 'T').slice(0, 1).toUpperCase();
  const previewName = profile.displayName.trim() || 'Your name';
  const previewHandle = profile.handle ? `@${profile.handle}` : '@your_handle';
  const previewPlace = profile.locationLabel || profile.city;

  return (
    <>
      <section className="profile-stage">
        <div className="profile-stage-bg" aria-hidden />
        <ToofieSprite anim="proud" size={64} className="profile-stage-toofie" />
        <button
          type="button"
          className="profile-avatar-btn"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          aria-label="Change profile photo"
        >
          {profile.avatarDataUrl ? (
            <img src={profile.avatarDataUrl} alt="" />
          ) : (
            <span>{initial}</span>
          )}
          <span className="profile-avatar-cam">
            <IconCamera size={16} />
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => void onAvatar(e.target.files?.[0] ?? null)}
        />
        <h1 className="profile-stage-name">{previewName}</h1>
        <p className="profile-stage-sub">
          {previewHandle}
          {previewPlace ? ` · ${previewPlace}` : ''}
        </p>
        <p className="profile-stage-hint">On this device only — make it cute.</p>
      </section>

      <section className="card profile-form">
        <p className="eyebrow">The fun bits</p>
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
          <textarea
            className="profile-bio"
            rows={2}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Dessert walker. Soft accountability. Zero guilt."
          />
        </label>
      </section>

      <section className="card profile-form">
        <p className="eyebrow">
          <IconPin size={14} /> Where you’re at
        </p>
        <label className="field">
          <span>City / area</span>
          <input
            value={profile.city}
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            placeholder="Orlando"
          />
        </label>
        <label className="field">
          <span>Shown on Moments</span>
          <input
            value={profile.locationLabel}
            onChange={(e) => setProfile({ ...profile, locationLabel: e.target.value })}
            placeholder="Orlando, FL"
          />
        </label>
        <label className="toggle-row">
          <span>
            <strong>Keep it approximate</strong>
            <span className="muted">A vibe, not a pin drop.</span>
          </span>
          <input
            type="checkbox"
            checked={profile.locationApprox}
            onChange={(e) => setProfile({ ...profile, locationApprox: e.target.checked })}
          />
        </label>
      </section>

      <button type="button" className="primary-btn blossom profile-save" onClick={save} disabled={busy}>
        {justSaved ? 'Saved ✓' : 'Save my vibe'}
      </button>
      {profile.avatarDataUrl && (
        <button
          type="button"
          className="ghost-btn"
          style={{ width: '100%', marginTop: 8 }}
          onClick={() => {
            const next = saveProfile({ avatarDataUrl: '' });
            setProfile(next);
            show('Photo removed', { tone: 'soft', anim: 'sit', ms: 1500 });
          }}
        >
          Remove photo
        </button>
      )}

      <p className="fineprint">
        Location is a label you type — not live GPS.{' '}
        <Link to="/privacy">Privacy</Link>
      </p>
    </>
  );
}
