import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useToast } from '../components/Toast';
import { loadUiPrefs, saveUiPrefs } from '../lib/uiPrefs';

export function NotificationsScreen() {
  const { show } = useToast();
  const [prefs, setPrefs] = useState(loadUiPrefs);

  function toggle(key: 'notifyEvening' | 'notifyMilestone') {
    const next = !prefs[key];
    setPrefs(saveUiPrefs({ [key]: next }));
    show(next ? 'Reminder on' : 'Reminder off', {
      tone: next ? 'good' : 'soft',
      anim: next ? 'wave' : 'sleepy',
      ms: 1500,
    });
  }

  return (
    <>
      <p className="ui-only-chip">UI only · no push permission yet</p>
      <h1 className="screen-title">Reminders</h1>
      <p className="lede">Gentle, opt-in, never guilt. Mascot-cheering copy only.</p>

      <section className="card">
        <label className="toggle-row">
          <span>
            <strong>Evening check-in</strong>
            <span className="muted">A soft “how was dessert today?” nudge.</span>
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
            <span className="muted">Celebrate days on plan — no streak scare.</span>
          </span>
          <input
            type="checkbox"
            checked={prefs.notifyMilestone}
            onChange={() => toggle('notifyMilestone')}
          />
        </label>
      </section>

      <section className="card">
        <p className="eyebrow">Preview copy</p>
        <p className="title" style={{ fontSize: 16 }}>
          “Hey — Toofie’s curious. Want to log today’s treat, or bank a clean day?”
        </p>
        <p className="muted">Templates rotate. Never “don’t break your streak.”</p>
      </section>

      <Link to="/you" className="ghost-btn">
        ← Back to You
      </Link>
    </>
  );
}
