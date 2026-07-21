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
  if (opts.empty) return 'Fresh plate. Whenever you’re ready — I’m hyped.';
  if (opts.ready) return 'Treat window is open. Enjoy it when it sounds good.';
  if (opts.loggedToday) return 'That looked delicious. Soft accountability only.';
  if (opts.daysSince != null && opts.daysSince >= 3) {
    return `${opts.daysSince} days since the last treat. You’re in a nice groove.`;
  }
  if (opts.streak >= 7) return `${opts.streak}-day rhythm. Keep it playful.`;
  return 'Small check-ins. Big peace of mind. Zero guilt.';
}

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
  const progressPct = Math.round(t.availability.progress * 100);
  const loggedToday = t.daysSinceLastDessert === 0;
  const empty = state.entries.length === 0;

  const recencyHeadline =
    t.daysSinceLastDessert === null
      ? 'Your dessert story starts whenever you want'
      : loggedToday
        ? 'You treated yourself today'
        : t.daysSinceLastDessert === 1
          ? 'One day since your last treat'
          : `${t.daysSinceLastDessert} days since your last treat`;

  const readyTitle = ready
    ? `Dessert unlocked ×${t.availability.bankedDesserts}`
    : `${t.availability.pointsNeeded} pts to the next treat`;

  const readySub = ready
    ? 'Banked and ready — enjoy it guilt-free when you want.'
    : t.pendingPointsToday > 0
      ? `${t.availability.balance} / ${t.availability.cost} pts · +${t.pendingPointsToday} banks tonight`
      : `${t.availability.balance} / ${t.availability.cost} pts · about ${t.availability.cleanDaysNeeded} clean day${t.availability.cleanDaysNeeded === 1 ? '' : 's'}`;

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

  const tickerBits = [
    showMilestone && t.streakMilestoneToday != null
      ? `${t.streakMilestoneToday} days on plan · keep enjoying`
      : null,
    ready ? 'Treat window open · no guilt' : 'Banking sweetness · soft pace',
    `${t.onPlanStreak} day streak · playful not punishing`,
    'Log when you enjoy · never when you “should”',
  ].filter(Boolean) as string[];

  return (
    <div className="home-fun">
      <header className="home-stage">
        <div className="home-stage-bg" aria-hidden />
        <div className="home-stage-top">
          <div className="home-brand">
            <p className="home-kicker">Toofies</p>
            <h1 className="home-title">Let’s play nice with dessert</h1>
          </div>
          <div className="home-toofie-wrap">
            <ToofieSprite
              className="home-toofie"
              anim={anim}
              size={112}
              alt="Toofie"
              motion={anim === 'milestone' ? 'task' : 'still'}
              loop={false}
              onComplete={() => {
                if (anim === 'milestone') setMilestoneDone(true);
              }}
            />
          </div>
        </div>
        <p className="home-bubble" role="status">
          <span className="home-bubble-label">Toofie</span>
          {bubble}
        </p>
      </header>

      <div className="home-marquee" aria-hidden>
        <div className="home-marquee-track">
          {[...tickerBits, ...tickerBits].map((bit, i) => (
            <span key={`${bit}-${i}`}>{bit}</span>
          ))}
        </div>
      </div>

      <section className={`home-pulse${ready ? ' is-ready' : ''}`} aria-label="Dessert readiness">
        <div className="home-pulse-copy">
          <p className="eyebrow">{ready ? 'You’re clear' : 'Almost there'}</p>
          <h2 className="home-pulse-title">{readyTitle}</h2>
          <p className="home-pulse-sub">{readySub}</p>
        </div>
        <div
          className="home-meter"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPct}
          aria-label="Progress toward next dessert"
        >
          <span className="home-meter-fill" style={{ width: `${progressPct}%` }} />
          <span className="home-meter-shine" aria-hidden />
        </div>
        <div className="home-pulse-stats">
          <div>
            <strong>{t.availability.balance}</strong>
            <span>pts banked</span>
          </div>
          <div>
            <strong>{t.availability.cost}</strong>
            <span>per treat</span>
          </div>
          <div>
            <strong>{t.availability.bankedDesserts}</strong>
            <span>unlocked</span>
          </div>
        </div>
      </section>

      <section className="home-streak" aria-label="Days on plan">
        <div className="home-streak-head">
          <div>
            <p className="eyebrow">On-plan streak</p>
            <p className="home-streak-num">
              {t.onPlanStreak}
              <span>days</span>
            </p>
          </div>
          <p className="home-streak-note">
            Clean days and earned desserts both count. Miss a day? No shame — just keep going.
          </p>
        </div>
        <div className="streak-row home-streak-row">
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

      <section className="home-recency" aria-label="Last dessert">
        <p className="eyebrow">Last dessert</p>
        <h2 className="home-recency-title">{recencyHeadline}</h2>
        <p className="home-recency-sub">
          {t.cleanSoFarToday
            ? 'Clean so far today — savor that calm.'
            : 'Logged one today — still on plan if it was banked.'}
        </p>
      </section>

      <Link to="/log" className="home-cta">
        <span className="home-cta-glow" aria-hidden />
        <IconSpark size={22} />
        <span>Log a dessert</span>
      </Link>

      <div className="home-quick">
        <Link to="/buddies" className="home-quick-tile tone-matcha">
          <IconBuddies size={22} />
          <strong>Buddy walk</strong>
          <span>Stroll for fun</span>
        </Link>
        <Link to="/recap" className="home-quick-tile tone-blossom">
          <IconMoon size={22} />
          <strong>Day recap</strong>
          <span>Gentle close</span>
        </Link>
      </div>
    </div>
  );
}
