import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ToofieSprite } from '../components/ToofieSprite';
import { useToast } from '../components/Toast';
import { useStore, useToofies } from '../lib/store';

const MOODS = [
  { id: 'joy', label: 'Joyful', anim: 'heart_eyes' },
  { id: 'good', label: 'Good', anim: 'wave' },
  { id: 'meh', label: 'Meh', anim: 'shrug' },
  { id: 'tired', label: 'Tired', anim: 'sleepy' },
] as const;

export function RecapScreen() {
  const navigate = useNavigate();
  const { show } = useToast();
  const { state } = useStore();
  const t = useToofies(new Date());
  const todayCount = t.week[t.week.length - 1]?.count ?? 0;
  const [mood, setMood] = useState<(typeof MOODS)[number]['id'] | null>(null);
  const [hadDessert, setHadDessert] = useState<boolean | null>(todayCount > 0 ? true : null);
  const [note, setNote] = useState('');

  function finish() {
    show('Day recap saved (local)', {
      tone: 'good',
      anim: mood === 'tired' ? 'sleepy' : 'celebrate',
      ms: 2000,
    });
    navigate('/');
  }

  return (
    <>
      <p className="ui-only-chip">Evening check-in · UI mock</p>
      <div className="brand-lockup">
        <div className="brand-left">
          <h1 className="screen-title">Day recap</h1>
          <p className="lede">A gentle close to the day — never a report card.</p>
        </div>
        <ToofieSprite
          anim={MOODS.find((m) => m.id === mood)?.anim ?? 'think'}
          size={84}
        />
      </div>

      <section className="card">
        <p className="eyebrow">Today</p>
        <p className="title" style={{ fontSize: 18 }}>
          {todayCount === 0
            ? 'No desserts logged yet today'
            : `You logged ${todayCount} dessert${todayCount === 1 ? '' : 's'}`}
        </p>
        <p className="muted">
          {t.onPlanStreak} days on plan · {t.availability.balance} pts banked
          {state.entries.length === 0 ? ' · fresh start' : ''}
        </p>
      </section>

      <section className="card">
        <p className="eyebrow">Did you enjoy a dessert?</p>
        <div className="seg">
          <button
            type="button"
            className={hadDessert === true ? 'on' : ''}
            onClick={() => setHadDessert(true)}
          >
            Yes
          </button>
          <button
            type="button"
            className={hadDessert === false ? 'on' : ''}
            onClick={() => setHadDessert(false)}
          >
            Not today
          </button>
        </div>
        {hadDessert === true && (
          <Link to="/log" className="ghost-btn" style={{ marginTop: 8, display: 'inline-block' }}>
            Log it if you haven’t →
          </Link>
        )}
      </section>

      <section className="card">
        <p className="eyebrow">How are you feeling?</p>
        <div className="mood-grid">
          {MOODS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`mood-chip${mood === m.id ? ' on' : ''}`}
              onClick={() => setMood(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card stack-form">
        <label className="field">
          <span>Optional note</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="One line for future-you…"
          />
        </label>
        <button type="button" className="primary-btn blossom" onClick={finish}>
          Save recap
        </button>
        <button type="button" className="ghost-btn" onClick={() => navigate(-1)}>
          Not now
        </button>
      </section>
    </>
  );
}
