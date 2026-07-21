import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ToofieSprite } from '../components/ToofieSprite';
import { useToast } from '../components/Toast';
import {
  loadBuddy,
  mockPair,
  mockUnpair,
  saveBuddy,
  type BuddyState,
} from '../lib/buddy';

export function BuddiesScreen() {
  const { show } = useToast();
  const [buddy, setBuddy] = useState<BuddyState>(loadBuddy);
  const [codeIn, setCodeIn] = useState('');
  const [tab, setTab] = useState<'home' | 'walk' | 'play'>('home');

  const combined = buddy.walkStepsMe + buddy.walkStepsBuddy;
  const walkPct = Math.min(100, Math.round((combined / buddy.walkGoal) * 100));

  const heroAnim = useMemo(() => {
    if (!buddy.paired) return 'welcome';
    if (tab === 'walk') return 'hike';
    if (tab === 'play') return 'cheer';
    return 'heart_eyes';
  }, [buddy.paired, tab]);

  function pair() {
    if (codeIn.trim().length < 4) {
      show('Enter a buddy code', { tone: 'soft', anim: 'think', ms: 1600 });
      return;
    }
    const next = mockPair(codeIn.trim());
    setBuddy(next);
    show(`Paired with ${next.buddyName}!`, { tone: 'good', anim: 'cheer', ms: 2200 });
    setTab('home');
  }

  function startWalk() {
    const next = saveBuddy({
      walkActive: true,
      walkStepsMe: Math.max(buddy.walkStepsMe, 400),
      walkStepsBuddy: Math.max(buddy.walkStepsBuddy, 350),
    });
    setBuddy(next);
    show('Dessert walk started — enjoy the stroll', {
      tone: 'good',
      anim: 'hike',
      ms: 2000,
    });
    setTab('walk');
  }

  function nudgeSteps() {
    const next = saveBuddy({
      walkStepsMe: buddy.walkStepsMe + 500,
      walkStepsBuddy: buddy.walkStepsBuddy + 420,
    });
    setBuddy(next);
    show('+steps on the walk (mock)', { tone: 'soft', anim: 'hike', ms: 1500 });
  }

  function sendCheer() {
    const next = saveBuddy({
      lastCheer: 'You sent a treat-check cheer 🦷',
      challenges: buddy.challenges.map((c) =>
        c.id === 'check-in'
          ? { ...c, progress: Math.min(c.goal, c.progress + 1) }
          : c,
      ),
    });
    setBuddy(next);
    show('Cheer sent — no guilt, just vibes', { tone: 'good', anim: 'wave', ms: 2000 });
  }

  function bumpChallenge(id: string) {
    const next = saveBuddy({
      challenges: buddy.challenges.map((c) =>
        c.id === id ? { ...c, progress: Math.min(c.goal, c.progress + 1) } : c,
      ),
    });
    setBuddy(next);
    show('Challenge progress!', { tone: 'good', anim: 'celebrate', ms: 1800 });
  }

  return (
    <>
      <p className="ui-only-chip">UI only · buddy system mock · no calories</p>
      <div className="brand-lockup">
        <div className="brand-left">
          <h1 className="screen-title">Buddies</h1>
          <p className="lede">
            Couples & friends — dessert walks, shared cheers, gamified treats. Never a diet club.
          </p>
        </div>
        <ToofieSprite anim={heroAnim} size={84} />
      </div>

      <div className="seg buddy-tabs">
        <button type="button" className={tab === 'home' ? 'on' : ''} onClick={() => setTab('home')}>
          Pair
        </button>
        <button type="button" className={tab === 'walk' ? 'on' : ''} onClick={() => setTab('walk')}>
          Walks
        </button>
        <button type="button" className={tab === 'play' ? 'on' : ''} onClick={() => setTab('play')}>
          Play
        </button>
      </div>

      {tab === 'home' && (
        <>
          {!buddy.paired ? (
            <>
              <section className="card">
                <p className="eyebrow">Your invite code</p>
                <p className="buddy-code">{buddy.myCode}</p>
                <p className="muted">Share with a partner or friend so they can pair with you.</p>
                <button
                  type="button"
                  className="mini-btn"
                  onClick={() => {
                    void navigator.clipboard?.writeText(buddy.myCode);
                    show('Code copied', { tone: 'soft', anim: 'wave', ms: 1400 });
                  }}
                >
                  Copy code
                </button>
              </section>

              <section className="card stack-form">
                <p className="eyebrow">Enter their code</p>
                <label className="field">
                  <span>Buddy code</span>
                  <input
                    value={codeIn}
                    onChange={(e) => setCodeIn(e.target.value.toUpperCase())}
                    placeholder="e.g. SWEET2"
                    maxLength={8}
                  />
                </label>
                <button type="button" className="primary-btn blossom" onClick={pair}>
                  Pair up
                </button>
              </section>
            </>
          ) : (
            <>
              <section className="hero buddy-hero">
                <p className="eyebrow">Duo</p>
                <h2 className="headline">You + {buddy.buddyName}</h2>
                <p className="sub">{buddy.duoStreak} days on plan together · playful, not punitive</p>
              </section>

              <section className="card">
                <p className="eyebrow">Treat check together</p>
                <p className="title" style={{ fontSize: 17 }}>
                  Peace-of-mind check — “feeling good about a dessert?”
                </p>
                <p className="muted">
                  Replaces any calorie talk. You cheer each other’s joy, not restrict it.
                </p>
                <button type="button" className="primary-btn" onClick={sendCheer}>
                  Send a treat-check cheer
                </button>
                {buddy.lastCheer && <p className="muted" style={{ marginTop: 10 }}>{buddy.lastCheer}</p>}
              </section>

              <section className="card">
                <p className="eyebrow">Quick actions</p>
                <div className="link-rows">
                  <button type="button" className="text-link" onClick={startWalk}>
                    Start a dessert walk
                  </button>
                  <button type="button" className="text-link" onClick={() => setTab('play')}>
                    Open duo challenges
                  </button>
                  <Link to="/moments">Browse Moments feed</Link>
                </div>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => {
                    setBuddy(mockUnpair());
                    show('Unpaired (mock)', { tone: 'soft', anim: 'sit', ms: 1600 });
                  }}
                >
                  Unpair
                </button>
              </section>
            </>
          )}
        </>
      )}

      {tab === 'walk' && (
        <>
          {!buddy.paired ? (
            <section className="card">
              <p className="title" style={{ fontSize: 17 }}>
                Pair a buddy first to unlock dessert walks.
              </p>
              <button type="button" className="primary-btn" onClick={() => setTab('home')}>
                Go pair
              </button>
            </section>
          ) : (
            <>
              <section className="hero move-hero">
                <p className="eyebrow">Dessert walk</p>
                <h2 className="headline">{combined.toLocaleString()}</h2>
                <p className="sub">
                  combined steps · goal {buddy.walkGoal.toLocaleString()} · movement as joy
                </p>
                <div className="progress" style={{ marginTop: 14 }}>
                  <span style={{ width: `${walkPct}%` }} />
                </div>
              </section>

              <section className="stat-grid">
                <div className="card stat">
                  <p className="eyebrow">You</p>
                  <p className="stat-num">{buddy.walkStepsMe.toLocaleString()}</p>
                  <p className="muted">steps</p>
                </div>
                <div className="card stat">
                  <p className="eyebrow">{buddy.buddyName}</p>
                  <p className="stat-num">{buddy.walkStepsBuddy.toLocaleString()}</p>
                  <p className="muted">steps</p>
                </div>
              </section>

              <section className="card">
                <p className="eyebrow">Walk loop</p>
                <p className="title" style={{ fontSize: 16 }}>
                  Stroll now, savor later — walks never “pay for” dessert.
                </p>
                <div className="flow-actions" style={{ marginTop: 12 }}>
                  {!buddy.walkActive ? (
                    <button type="button" className="primary-btn blossom" onClick={startWalk}>
                      Start walk
                    </button>
                  ) : (
                    <button type="button" className="primary-btn" onClick={nudgeSteps}>
                      Simulate +steps
                    </button>
                  )}
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => {
                      if (combined >= buddy.walkGoal) {
                        show('Walk complete — treat-check unlocked', {
                          tone: 'good',
                          anim: 'celebrate',
                          ms: 2200,
                        });
                      } else {
                        show('Keep strolling — no rush', { tone: 'soft', anim: 'hike', ms: 1600 });
                      }
                    }}
                  >
                    Finish / cheer
                  </button>
                </div>
              </section>
            </>
          )}
        </>
      )}

      {tab === 'play' && (
        <>
          <section className="card">
            <p className="eyebrow">Duo quests</p>
            <p className="muted" style={{ margin: 0 }}>
              Gamified, forgiving, dessert-positive. No calorie counters — ever.
            </p>
          </section>
          {buddy.challenges.map((c) => {
            const pct = Math.min(100, Math.round((c.progress / c.goal) * 100));
            return (
              <section key={c.id} className="card">
                <p className="eyebrow">{c.unit}</p>
                <p className="title" style={{ fontSize: 17 }}>
                  {c.title}
                </p>
                <p className="muted">{c.blurb}</p>
                <div className="progress" style={{ marginTop: 12 }}>
                  <span style={{ width: `${pct}%` }} />
                </div>
                <p className="muted">
                  {c.progress} / {c.goal} · reward: {c.reward}
                </p>
                <button
                  type="button"
                  className="mini-btn"
                  style={{ marginTop: 8 }}
                  disabled={!buddy.paired || c.progress >= c.goal}
                  onClick={() => bumpChallenge(c.id)}
                >
                  {c.progress >= c.goal ? 'Done' : 'Log progress (mock)'}
                </button>
              </section>
            );
          })}
        </>
      )}
    </>
  );
}
