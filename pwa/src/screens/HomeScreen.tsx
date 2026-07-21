import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { pickHomeAnim, ToofieSprite } from '../components/ToofieSprite';
import { useStore, useToofies } from '../lib/store';

export function HomeScreen() {
  const now = useMemo(() => new Date(), []);
  const t = useToofies(now);
  const { state } = useStore();
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneDone, setMilestoneDone] = useState(false);

  useEffect(() => {
    if (t.streakMilestoneToday != null) {
      setShowMilestone(true);
      setMilestoneDone(false);
    }
  }, [t.streakMilestoneToday]);

  const recencyHeadline =
    t.daysSinceLastDessert === null
      ? 'Fresh start — no desserts logged yet'
      : t.daysSinceLastDessert === 0
        ? 'You enjoyed a dessert today'
        : `It's been ${t.daysSinceLastDessert} day${t.daysSinceLastDessert === 1 ? '' : 's'} since your last treat`;

  const ready = t.availability.bankedDesserts > 0;
  const readyCopy = ready
    ? `Yes — you've banked ${t.availability.bankedDesserts} dessert${t.availability.bankedDesserts === 1 ? '' : 's'}`
    : `Almost — ${t.availability.pointsNeeded} pts to go · about ${t.availability.cleanDaysNeeded} clean day${t.availability.cleanDaysNeeded === 1 ? '' : 's'}`;

  const anim = pickHomeAnim({
    empty: state.entries.length === 0,
    ready,
    milestone: showMilestone && !milestoneDone && t.streakMilestoneToday != null,
    streak: t.onPlanStreak,
  });

  return (
    <>
      <p className="provisional-banner">OCHA shell provisional · Toofie mascot 🟢 D14</p>

      <header className="brand-lockup">
        <div className="brand-left">
          <h1>Toofies</h1>
          <p className="tag">Dessert, with peace of mind.</p>
        </div>
        <ToofieSprite
          className="toofie-mark"
          anim={anim}
          size={88}
          alt="Toofie"
          onComplete={() => {
            if (anim === 'milestone') setMilestoneDone(true);
          }}
        />
      </header>

      {showMilestone && t.streakMilestoneToday != null && (
        <div className="marquee" role="status">
          <div className="marquee-track">
            <span>{t.streakMilestoneToday} days on plan · keep enjoying ·</span>
            <span>{t.streakMilestoneToday} days on plan · keep enjoying ·</span>
            <span>{t.streakMilestoneToday} days on plan · keep enjoying ·</span>
            <span>{t.streakMilestoneToday} days on plan · keep enjoying ·</span>
          </div>
        </div>
      )}

      <section className="hero" aria-label="Last dessert">
        <p className="eyebrow">Last dessert</p>
        <h2 className="headline">{recencyHeadline}</h2>
        <p className="sub">
          {t.cleanSoFarToday ? 'Clean so far today.' : 'Logged one today — still on plan if it was banked.'}
        </p>
      </section>

      <section className="card" aria-label="Days on plan">
        <p className="eyebrow">Days on plan</p>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 12 }}>
          <p className="streak-num">{t.onPlanStreak}</p>
          <p className="muted" style={{ textAlign: 'right', maxWidth: '12rem' }}>
            Clean days and earned desserts both count.
          </p>
        </div>
        <div className="streak-row">
          {t.week.map((d) => (
            <div
              key={d.key}
              className={`streak-day${d.count > 0 ? ' logged' : ' clean'}${d.label === 'Today' ? ' today' : ''}`}
            >
              <div className="dot">{d.count > 0 ? d.count : '·'}</div>
              <span className="lbl">{d.label.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card" aria-label="Dessert readiness">
        <p className="eyebrow">Am I ready for a dessert?</p>
        <h3 className={`title ${ready ? 'ready' : 'wait'}`}>{readyCopy}</h3>
        <p className="muted">
          {t.availability.balance} / {t.availability.cost} pts toward your next treat
          {t.pendingPointsToday > 0 ? ` · +${t.pendingPointsToday} banks tonight` : ''}
        </p>
        <div className="progress" aria-hidden>
          <span style={{ width: `${Math.round(t.availability.progress * 100)}%` }} />
        </div>
      </section>

      <section className="card">
        <p className="eyebrow">Treat yourself, mindfully</p>
        <p className="title" style={{ fontSize: 17, marginBottom: 12 }}>
          Log a dessert when you enjoy one.
        </p>
        <Link
          to="/log"
          className="primary-btn blossom"
          style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
        >
          Log a dessert
        </Link>
        <Link
          to="/buddies"
          className="ghost-btn"
          style={{ display: 'block', textAlign: 'center', marginTop: 8 }}
        >
          Walk with a buddy →
        </Link>
        {state.entries.length === 0 && (
          <p className="muted" style={{ marginTop: 10 }}>
            Tip: this preview starts with a few clean days so the balance is live.
          </p>
        )}
      </section>
    </>
  );
}
