import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { GuestLock } from '../components/GuestLock';
import { ToofieSprite } from '../components/ToofieSprite';
import { useToast } from '../components/Toast';
import { loadUiPrefs } from '../lib/uiPrefs';
import {
  loadBuddy,
  mockPair,
  mockUnpair,
  saveBuddy,
  type BuddyState,
} from '../lib/buddy';
import { fileToDataUrl } from '../lib/profile';
import { composeWalkMemoryCard } from '../lib/walkMemory';

export function BuddiesScreen() {
  const { show } = useToast();
  const guest = loadUiPrefs().guestMode;
  const [buddy, setBuddy] = useState<BuddyState>(loadBuddy);
  const [codeIn, setCodeIn] = useState('');
  const [tab, setTab] = useState<'home' | 'walk' | 'play'>('home');
  const [captureOpen, setCaptureOpen] = useState(false);
  const [draftPhoto, setDraftPhoto] = useState('');
  const [cardPreview, setCardPreview] = useState('');
  const [busyShot, setBusyShot] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const combined = buddy.walkStepsMe + buddy.walkStepsBuddy;
  const walkPct = Math.min(100, Math.round((combined / buddy.walkGoal) * 100));
  const walkComplete = combined >= buddy.walkGoal;

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
    show('Dessert walk started - enjoy the stroll', {
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
    const done = next.walkStepsMe + next.walkStepsBuddy >= next.walkGoal;
    show(
      done ? 'Goal hit - snap the finish!' : '+steps on the walk (mock)',
      { tone: done ? 'good' : 'soft', anim: done ? 'celebrate' : 'hike', ms: 1600 },
    );
    if (done) setCaptureOpen(true);
  }

  async function onWalkPhoto(file: File | null) {
    if (!file) return;
    try {
      const data = await fileToDataUrl(file, 1200);
      setDraftPhoto(data);
      setBusyShot(true);
      const card = await composeWalkMemoryCard(data, {
        combined,
        goal: buddy.walkGoal,
        buddyName: buddy.buddyName,
        meSteps: buddy.walkStepsMe,
        buddySteps: buddy.walkStepsBuddy,
      });
      setCardPreview(card);
      setBusyShot(false);
      show('Looking good - save the memory?', { tone: 'good', anim: 'proud', ms: 1800 });
    } catch {
      setBusyShot(false);
      show('Couldn’t read that photo', { tone: 'soft', anim: 'shrug', ms: 1600 });
    }
  }

  async function saveWalkMemory() {
    if (!cardPreview) {
      show('Add a photo or screenshot first', { tone: 'soft', anim: 'think', ms: 1600 });
      return;
    }
    const memory = {
      id: `wm-${Date.now()}`,
      createdAt: new Date().toISOString(),
      photoDataUrl: draftPhoto || cardPreview,
      cardDataUrl: cardPreview,
      combinedSteps: combined,
    };
    const next = saveBuddy({
      walkActive: false,
      walkMemories: [memory, ...(buddy.walkMemories ?? [])].slice(0, 12),
      challenges: buddy.challenges.map((c) =>
        c.id === 'walk-treat'
          ? { ...c, progress: Math.min(c.goal, Math.max(c.progress, c.goal)) }
          : c,
      ),
    });
    setBuddy(next);
    setCaptureOpen(false);
    setDraftPhoto('');
    setCardPreview('');
    show('Walk memory saved on-device', { tone: 'good', anim: 'celebrate', ms: 2200 });
  }

  async function screenshotOnly() {
    setBusyShot(true);
    try {
      const card = await composeWalkMemoryCard(draftPhoto || null, {
        combined,
        goal: buddy.walkGoal,
        buddyName: buddy.buddyName,
        meSteps: buddy.walkStepsMe,
        buddySteps: buddy.walkStepsBuddy,
      });
      setCardPreview(card);
      show('Screenshot card ready', { tone: 'soft', anim: 'wave', ms: 1500 });
    } catch {
      show('Couldn’t build screenshot', { tone: 'soft', anim: 'shrug', ms: 1600 });
    } finally {
      setBusyShot(false);
    }
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
    show('Cheer sent - no guilt, just vibes', { tone: 'good', anim: 'wave', ms: 2000 });
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

  if (guest) {
    return (
      <GuestLock
        title="Buddies"
        blurb="Pairing with a partner or friend needs an account on both sides."
      />
    );
  }

  return (
    <div className="buddies-page">
      <p className="ui-only-chip">UI only · buddy system mock · no calories</p>

      <header className="buddy-head">
        <div className="buddy-head-copy">
          <h1 className="screen-title">Buddies</h1>
          <p className="lede">Dessert walks, shared cheers, duo quests - never a diet club.</p>
        </div>
        <ToofieSprite
          anim={buddy.walkActive && tab === 'walk' ? 'walk' : heroAnim}
          size={92}
          motion={buddy.walkActive && tab === 'walk' ? 'task' : 'still'}
          loop={buddy.walkActive && tab === 'walk'}
        />
      </header>

      <nav className="buddy-tabs" aria-label="Buddy sections">
        <button type="button" className={tab === 'home' ? 'on' : ''} onClick={() => setTab('home')}>
          Duo
        </button>
        <button type="button" className={tab === 'walk' ? 'on' : ''} onClick={() => setTab('walk')}>
          Walks
        </button>
        <button type="button" className={tab === 'play' ? 'on' : ''} onClick={() => setTab('play')}>
          Play
        </button>
      </nav>

      {tab === 'home' && (
        <>
          {!buddy.paired ? (
            <section className="card buddy-pair-card">
              <p className="eyebrow">Pair up</p>
              <h2 className="title">Bring a dessert buddy</h2>
              <p className="muted">
                Share your code with a partner or friend - or punch in theirs.
              </p>

              <div className="buddy-code-row">
                <p className="buddy-code">{buddy.myCode}</p>
                <button
                  type="button"
                  className="mini-btn"
                  onClick={() => {
                    void navigator.clipboard?.writeText(buddy.myCode);
                    show('Code copied', { tone: 'soft', anim: 'wave', ms: 1400 });
                  }}
                >
                  Copy
                </button>
              </div>

              <div className="buddy-divider" aria-hidden>
                <span>or enter theirs</span>
              </div>

              <label className="field">
                <span>Buddy code</span>
                <input
                  value={codeIn}
                  onChange={(e) => setCodeIn(e.target.value.toUpperCase())}
                  placeholder="e.g. SWEET2"
                  maxLength={8}
                />
              </label>
              <button type="button" className="primary-btn blossom buddy-cta" onClick={pair}>
                Pair up
              </button>
            </section>
          ) : (
            <>
              <section className="hero buddy-hero">
                <p className="eyebrow">Duo</p>
                <h2 className="headline">You + {buddy.buddyName}</h2>
                <p className="sub">{buddy.duoStreak} days on plan together · playful, not punitive</p>
              </section>

              <section className="card buddy-section">
                <p className="eyebrow">Treat check together</p>
                <p className="title buddy-title-sm">
                  Peace-of-mind check - “feeling good about a dessert?”
                </p>
                <p className="muted">
                  Replaces any calorie talk. You cheer each other’s joy, not restrict it.
                </p>
                <button type="button" className="primary-btn buddy-cta" onClick={sendCheer}>
                  Send a treat-check cheer
                </button>
                {buddy.lastCheer && <p className="muted buddy-cheer-note">{buddy.lastCheer}</p>}
              </section>

              <section className="card buddy-section">
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
                  className="ghost-btn buddy-unpair"
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
            <section className="card buddy-section">
              <p className="title buddy-title-sm">Pair a buddy first to unlock dessert walks.</p>
              <button
                type="button"
                className="primary-btn buddy-cta"
                onClick={() => setTab('home')}
              >
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

              <section className="card buddy-section">
                <p className="eyebrow">Walk loop</p>
                <p className="title buddy-title-sm">
                  Stroll now, savor later - walks never “pay for” dessert.
                </p>
                <div className="buddy-actions">
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
                    className={walkComplete ? 'primary-btn blossom' : 'ghost-btn'}
                    onClick={() => {
                      if (walkComplete) {
                        setCaptureOpen(true);
                        show('Walk complete - grab a photo', {
                          tone: 'good',
                          anim: 'celebrate',
                          ms: 2000,
                        });
                      } else {
                        show('Keep strolling - no rush', { tone: 'soft', anim: 'hike', ms: 1600 });
                      }
                    }}
                  >
                    {walkComplete ? 'Finish · take a photo' : 'Finish / cheer'}
                  </button>
                </div>
              </section>

              {captureOpen && walkComplete && (
                <section className="card walk-capture" id="walk-capture">
                  <p className="eyebrow">Finish line</p>
                  <p className="title" style={{ fontSize: 18 }}>
                    Snap it or drop a screenshot
                  </p>
                  <p className="muted">
                    Camera selfie, gallery shot, or a generated share card - stored on this device
                    only.
                  </p>
                  <input
                    ref={cameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    hidden
                    onChange={(e) => void onWalkPhoto(e.target.files?.[0] ?? null)}
                  />
                  <input
                    ref={galleryRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => void onWalkPhoto(e.target.files?.[0] ?? null)}
                  />
                  <div className="walk-capture-actions">
                    <button
                      type="button"
                      className="primary-btn"
                      disabled={busyShot}
                      onClick={() => cameraRef.current?.click()}
                    >
                      Take photo
                    </button>
                    <button
                      type="button"
                      className="primary-btn blossom"
                      disabled={busyShot}
                      onClick={() => galleryRef.current?.click()}
                    >
                      Upload screenshot
                    </button>
                    <button
                      type="button"
                      className="ghost-btn"
                      disabled={busyShot}
                      onClick={() => void screenshotOnly()}
                    >
                      Build share card
                    </button>
                  </div>
                  {(draftPhoto || cardPreview) && (
                    <div className="walk-capture-preview">
                      <img src={cardPreview || draftPhoto} alt="Walk memory preview" />
                      <button
                        type="button"
                        className="primary-btn"
                        disabled={busyShot || !cardPreview}
                        onClick={() => void saveWalkMemory()}
                      >
                        Save memory
                      </button>
                      {cardPreview && (
                        <a
                          className="ghost-btn"
                          href={cardPreview}
                          download={`toofies-walk-${Date.now()}.jpg`}
                        >
                          Download screenshot
                        </a>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => {
                      setCaptureOpen(false);
                      setDraftPhoto('');
                      setCardPreview('');
                    }}
                  >
                    Not now
                  </button>
                </section>
              )}

              {(buddy.walkMemories?.length ?? 0) > 0 && (
                <section className="card">
                  <p className="eyebrow">Walk memories</p>
                  <div className="walk-memory-grid">
                    {buddy.walkMemories.map((m) => (
                      <figure key={m.id} className="walk-memory-tile">
                        <img src={m.cardDataUrl || m.photoDataUrl} alt="Saved walk" />
                        <figcaption>
                          {m.combinedSteps.toLocaleString()} steps ·{' '}
                          {new Date(m.createdAt).toLocaleDateString()}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}

      {tab === 'play' && (
        <>
          <p className="buddy-quest-banner">
            Gamified, forgiving, dessert-positive. No calorie counters - ever.
          </p>
          {buddy.challenges.map((c) => {
            const pct = Math.min(100, Math.round((c.progress / c.goal) * 100));
            const done = c.progress >= c.goal;
            return (
              <section key={c.id} className="card buddy-quest">
                <div className="buddy-quest-head">
                  <p className="eyebrow">{c.unit}</p>
                  <span className={`buddy-quest-state${done ? ' is-done' : ''}`}>
                    {done ? 'Done!' : `${c.progress}/${c.goal}`}
                  </span>
                </div>
                <p className="title buddy-title-sm">{c.title}</p>
                <p className="muted">{c.blurb}</p>
                <div className="progress buddy-quest-progress">
                  <span style={{ width: `${pct}%` }} />
                </div>
                <div className="buddy-quest-foot">
                  <span className="buddy-quest-reward">🎁 {c.reward}</span>
                  <button
                    type="button"
                    className="mini-btn"
                    disabled={!buddy.paired || done}
                    onClick={() => bumpChallenge(c.id)}
                  >
                    {done ? 'Done' : 'Log progress'}
                  </button>
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
