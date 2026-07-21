import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ToofieSprite } from '../components/ToofieSprite';
import { useToast } from '../components/Toast';
import { loadUiPrefs, saveUiPrefs } from '../lib/uiPrefs';

/** Playful roast - snarky, never guilt / never “you failed.” */
const SNARKY_NUDGES = [
  {
    title: 'Oh look who remembered dessert exists',
    body: 'Log it or don’t. I’m a tooth with opinions, not a parole officer.',
    anim: 'shrug',
  },
  {
    title: 'Your steps called. They’re lonely.',
    body: 'A dessert walk isn’t penance. It’s cardio with better branding.',
    anim: 'hike',
  },
  {
    title: 'Banked points just sitting there. Rude.',
    body: 'Treat window’s open. I’m not saying binge - I’m saying… enjoy something.',
    anim: 'ready',
  },
  {
    title: 'Buddy’s waiting. Fashionably.',
    body: 'Send a cheer before they invent a conspiracy about your silence.',
    anim: 'wave',
  },
  {
    title: 'Clean day energy. Suspiciously calm.',
    body: 'Keep it. Or don’t. Either way, no lecture from the frosting department.',
    anim: 'proud',
  },
] as const;

export function NotificationsScreen() {
  const { show } = useToast();
  const [prefs, setPrefs] = useState(loadUiPrefs);
  const [preview, setPreview] = useState(0);

  function toggle(key: 'notifyEvening' | 'notifyMilestone' | 'notifySnarky') {
    const next = !prefs[key];
    setPrefs(saveUiPrefs({ [key]: next }));
    show(next ? 'Nudge on' : 'Nudge off', {
      tone: next ? 'good' : 'soft',
      anim: next ? 'wave' : 'sleepy',
      ms: 1500,
    });
  }

  const snark = SNARKY_NUDGES[preview % SNARKY_NUDGES.length];

  return (
    <div className="page-stack">
      <p className="ui-only-chip">UI only · no push permission yet</p>

      <header className="page-header">
        <div className="page-header-copy">
          <h1 className="screen-title">Nudges</h1>
          <p className="lede">
            Opt-in Toofie texts. Snarky welcome. Guilt banned. Streak scare banned harder.
          </p>
        </div>
        <ToofieSprite anim={snark.anim} size={84} motion="still" />
      </header>

      <section className="card">
        <label className="toggle-row">
          <span>
            <strong>Evening check-in</strong>
            <span className="muted">Soft “how was dessert?” - no report card.</span>
          </span>
          <input
            type="checkbox"
            checked={prefs.notifyEvening}
            onChange={() => toggle('notifyEvening')}
          />
        </label>
        <label className="toggle-row">
          <span>
            <strong>Milestone cheers</strong>
            <span className="muted">Celebrate days on plan - never threaten them.</span>
          </span>
          <input
            type="checkbox"
            checked={prefs.notifyMilestone}
            onChange={() => toggle('notifyMilestone')}
          />
        </label>
        <label className="toggle-row">
          <span>
            <strong>Snarky Toofie nudges</strong>
            <span className="muted">Sarcastic hype. Zero shame. Fully optional.</span>
          </span>
          <input
            type="checkbox"
            checked={prefs.notifySnarky}
            onChange={() => toggle('notifySnarky')}
          />
        </label>
      </section>

      <section className="card snark-preview">
        <p className="eyebrow">Preview · Toofie voice</p>
        <p className="snark-title">“{snark.title}”</p>
        <p className="muted">{snark.body}</p>
        <div className="flow-actions" style={{ marginTop: 12 }}>
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              setPreview((n) => n + 1);
              show(SNARKY_NUDGES[(preview + 1) % SNARKY_NUDGES.length].title, {
                tone: 'soft',
                anim: SNARKY_NUDGES[(preview + 1) % SNARKY_NUDGES.length].anim,
                ms: 2200,
              });
            }}
          >
            Shuffle snark
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() =>
              show(snark.title, { tone: 'good', anim: snark.anim, ms: 2400 })
            }
          >
            Fire sample toast
          </button>
        </div>
      </section>

      <Link to="/you" className="ghost-btn">
        ← Back to You
      </Link>
    </div>
  );
}
