import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { IconBuddies, IconMoon, IconSpark } from '../components/NavIcons';
import { pickHomeAnim, ToofieSprite } from '../components/ToofieSprite';
import { useStore, useToofies } from '../lib/store';

function toofieLine(opts: {
  empty: boolean;
  ready: boolean;
  daysSince: number | null;
  streak: number;
  loggedToday: boolean;
}): string {
  if (opts.empty) return 'Fresh plate. Whenever you’re ready - I’m hyped.';
  if (opts.ready) return 'Treat window is open. Enjoy it when it sounds good.';
  if (opts.loggedToday) return 'That looked delicious. Soft accountability only.';
  if (opts.daysSince != null && opts.daysSince >= 3) {
    return `${opts.daysSince} days since the last treat. You’re in a nice groove.`;
  }
  if (opts.streak >= 7) return `${opts.streak}-day rhythm. Keep it playful.`;
  return 'Small check-ins. Big peace of mind. Zero guilt.';
}

const RING_R = 88;
const RING_C = 2 * Math.PI * RING_R;

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

  const ready = t.availability.bankedDesserts > 0;
  const loggedToday = t.daysSinceLastDessert === 0;
  const empty = state.entries.length === 0;
  const progress = ready ? 1 : t.availability.progress;

  const heroEyebrow = empty
    ? 'Welcome in'
    : ready
      ? 'You’re clear'
      : 'Banking sweetness';

  const heroHeadline = empty
    ? 'Start your dessert story'
    : ready
      ? `Dessert unlocked ×${t.availability.bankedDesserts}`
      : `${t.availability.pointsNeeded} pts to your next treat`;

  const heroSub = empty
    ? 'Log your first treat whenever it sounds good - Toofie handles the vibes.'
    : ready
      ? 'Banked and ready. Enjoy it guilt-free whenever you want.'
      : t.pendingPointsToday > 0
        ? `${t.availability.balance} / ${t.availability.cost} pts · +${t.pendingPointsToday} banks tonight`
        : `${t.availability.balance} / ${t.availability.cost} pts · about ${t.availability.cleanDaysNeeded} clean day${t.availability.cleanDaysNeeded === 1 ? '' : 's'}`;

  const daysSinceChip =
    t.daysSinceLastDessert === null
      ? 'No treats yet'
      : loggedToday
        ? 'Treated today'
        : `${t.daysSinceLastDessert}d since treat`;

  const anim = pickHomeAnim({
    empty,
    ready,
    milestone: showMilestone && !milestoneDone && t.streakMilestoneToday != null,
    streak: t.onPlanStreak,
  });

  const bubble = toofieLine({
    empty,
    ready,
    daysSince: t.daysSinceLastDessert,
    streak: t.onPlanStreak,
    loggedToday,
  });

  const dayLabel = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const tickerBits = [
    showMilestone && t.streakMilestoneToday != null
      ? `${t.streakMilestoneToday} days on plan · keep enjoying`
      : null,
    ready ? 'Treat window open · no guilt' : 'Banking sweetness · soft pace',
    `${t.onPlanStreak} day streak · playful not punishing`,
    'Log when you enjoy · never when you “should”',
  ].filter(Boolean) as string[];

  return (
    <div className="home-hero-screen">
      <section className={`home-hero${ready ? ' is-ready' : ''}`} aria-label="Today with Toofie">
        <div className="hh-sky" aria-hidden />
        <header className="hh-top">
          <p className="hh-kicker">Toofies</p>
          <p className="hh-day">{dayLabel}</p>
        </header>

        <div className="hh-center">
          <div className="hh-ring-wrap">
            <svg
              className="hh-ring"
              viewBox="0 0 200 200"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              aria-label="Progress toward next dessert"
            >
              <circle className="hh-ring-track" cx="100" cy="100" r={RING_R} />
              <circle
                className="hh-ring-fill"
                cx="100"
                cy="100"
                r={RING_R}
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - progress)}
              />
            </svg>
            <div className="hh-toofie">
              <ToofieSprite
                anim={anim}
                size={150}
                alt="Toofie"
                motion={anim === 'milestone' ? 'task' : 'still'}
                loop={false}
                onComplete={() => {
                  if (anim === 'milestone') setMilestoneDone(true);
                }}
              />
            </div>
            {ready && <span className="hh-ready-badge">Ready!</span>}
          </div>

          <p className="hh-eyebrow">{heroEyebrow}</p>
          <h1 className="hh-headline">{heroHeadline}</h1>
          <p className="hh-sub">{heroSub}</p>

          <p className="hh-bubble" role="status">
            <span className="hh-bubble-label">Toofie</span>
            {bubble}
          </p>
        </div>

        <div className="hh-chips" aria-label="Your rhythm">
          <span className="hh-chip">
            <strong>{t.onPlanStreak}d</strong> streak
          </span>
          <span className="hh-chip">
            <strong>{t.availability.balance}</strong> pts
          </span>
          <span className="hh-chip">{daysSinceChip}</span>
        </div>

        <Link to="/log" className="hh-cta">
          <span className="hh-cta-glow" aria-hidden />
          <IconSpark size={22} />
          <span>Log a dessert</span>
        </Link>

        <div className="hh-links">
          <Link to="/buddies" className="hh-link">
            <IconBuddies size={18} />
            Buddy walk
          </Link>
          <Link to="/recap" className="hh-link">
            <IconMoon size={18} />
            Day recap
          </Link>
        </div>
      </section>

      <div className="home-marquee" aria-hidden>
        <div className="home-marquee-track">
          {[...tickerBits, ...tickerBits].map((bit, i) => (
            <span key={`${bit}-${i}`}>{bit}</span>
          ))}
        </div>
      </div>

      <section className="hh-week" aria-label="Days on plan this week">
        <p className="eyebrow">This week</p>
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
        <p className="hh-week-note">Miss a day? No shame - just keep going.</p>
      </section>
    </div>
  );
}
