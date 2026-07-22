import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ToofieSprite } from '../components/ToofieSprite';
import { useToast } from '../components/Toast';
import { saveUiPrefs } from '../lib/uiPrefs';

type Step = {
  eyebrow: string;
  title: string;
  body: string;
  anim: string;
  chips: string[];
  bullets: { label: string; detail: string }[];
  ticker: string[];
  callouts: string[];
};

const STEPS: Step[] = [
  {
    eyebrow: 'Welcome',
    title: 'Dessert, with peace of mind',
    body: 'Know when you last treated yourself - and feel good about enjoying the next one.',
    anim: 'welcome',
    chips: ['No calories', 'No weight talk', 'No guilt', 'On-device only'],
    bullets: [
      { label: 'Log a treat', detail: 'One tap when you enjoy dessert' },
      { label: 'See readiness', detail: 'Calm “am I ready?” signal' },
      { label: 'Keep a streak', detail: 'Forgiving - never a debt' },
      { label: 'Meet Toofie', detail: 'Hype only, zero scolding' },
    ],
    ticker: ['Playful not punishing', 'Honest logging always ok', 'Skip anytime', 'Your pace'],
    callouts: ['~30 sec', '4 quick beats', 'Skim-friendly'],
  },
  {
    eyebrow: 'Recency first',
    title: 'The safe core is simply “when?”',
    body: 'No calories. No weight. No scolding. Just a calm answer to “am I ready for a dessert?”',
    anim: 'think',
    chips: ['Recency > rules', 'Never blocked', 'Soft signals', 'Your call'],
    bullets: [
      { label: 'Ask “when?”', detail: 'Last treat timing is the whole game' },
      { label: 'Stay honest', detail: 'Logging is never blocked or shamed' },
      { label: 'Feel clear', detail: 'Green light vibes, not a diet coach' },
      { label: 'Ignore noise', detail: 'No macros, scales, or “shoulds”' },
    ],
    ticker: ['When did I last treat?', 'Ready or wait - soft', 'No punishment loop', 'Dessert is allowed'],
    callouts: ['Core loop', 'Guilt-free', '30-sec idea'],
  },
  {
    eyebrow: 'Optional points',
    title: 'Bank sweetness your way',
    body: 'Clean days and movement can bank points toward a treat - as an opt-in experiment, never a punishment.',
    anim: 'ready',
    chips: ['Opt-in', 'No debt', 'Movement helps', 'Turn off anytime'],
    bullets: [
      { label: 'Bank points', detail: 'Clean days + walks add up' },
      { label: 'Spend on treats', detail: 'Unlock dessert windows lightly' },
      { label: 'No hard resets', detail: 'Miss a day? Keep going' },
      { label: 'Stay in control', detail: 'Flip it off in You later' },
    ],
    ticker: ['Experiment mode', 'Not a calorie bank', 'Playful economy', 'Your rules'],
    callouts: ['Optional', 'Forgiving', 'Toggle later'],
  },
  {
    eyebrow: 'Meet Toofie',
    title: 'Your little hype tooth',
    body: 'Toofie cheers milestones and dessert logs. Playful. Never guilt.',
    anim: 'cheer',
    chips: ['Cheers logs', 'Wiggles on tap', 'Milestone hype', 'Zero shame'],
    bullets: [
      { label: 'Reacts to you', detail: 'Logs, walks, streaks get a vibe' },
      { label: 'Stays kind', detail: 'Roasts are playful, never mean' },
      { label: 'Lives on-device', detail: 'No account required to enjoy' },
      { label: 'Goes with you', detail: 'Home, Move, Buddies, You' },
    ],
    ticker: ['Tap Toofie anytime', 'Hype > guilt', 'Frosting forever', 'Let’s go'],
    callouts: ['Mascot on', 'Last step', 'You’re ready'],
  },
];

export function OnboardingScreen() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [i, setI] = useState(0);
  const [economy, setEconomy] = useState(true);
  const [playing, setPlaying] = useState(true);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  const progress = useMemo(() => ((i + 1) / STEPS.length) * 100, [i]);

  function finish() {
    saveUiPrefs({ onboardingDone: true, economyOptIn: economy });
    show("You're in - let's go", { tone: 'good', anim: 'cheer', ms: 1800 });
    navigate('/', { replace: true });
  }

  function skip() {
    saveUiPrefs({ onboardingDone: true, economyOptIn: economy });
    show('Skipped - you can replay from You', { tone: 'soft', anim: 'peace', ms: 1800 });
    navigate('/', { replace: true });
  }

  return (
    <div className="flow-screen flow-dense">
      <div className="flow-topbar">
        <p className="ui-only-chip">UI only · no backend</p>
        <p className="flow-step-pill" aria-live="polite">
          {i + 1}/{STEPS.length}
        </p>
      </div>

      <div className="flow-progress" aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="flow-callouts" aria-hidden>
        {step.callouts.map((c) => (
          <span key={c} className="flow-callout">
            {c}
          </span>
        ))}
      </div>

      <div className="flow-hero flow-hero-dense">
        <div className="flow-hero-row">
          <ToofieSprite
            anim={step.anim}
            size={112}
            className="flow-toofie"
            motion={playing ? 'task' : 'still'}
            loop={false}
            onComplete={() => setPlaying(false)}
          />
          <div className="flow-hero-copy">
            <p className="eyebrow">{step.eyebrow}</p>
            <h1 className="flow-title">{step.title}</h1>
          </div>
        </div>
        <p className="lede">{step.body}</p>
      </div>

      <div className="flow-chip-row" aria-label="Quick tags">
        {step.chips.map((chip) => (
          <span key={chip} className="flow-chip">
            {chip}
          </span>
        ))}
      </div>

      <ul className="flow-bullet-grid">
        {step.bullets.map((b) => (
          <li key={b.label} className="flow-bullet">
            <strong>{b.label}</strong>
            <span>{b.detail}</span>
          </li>
        ))}
      </ul>

      <div className="flow-marquee" aria-hidden>
        <div className="flow-marquee-track">
          {[...step.ticker, ...step.ticker].map((t, idx) => (
            <span key={`${t}-${idx}`}>{t}</span>
          ))}
        </div>
      </div>

      {last && (
        <section className="card flow-opt-card">
          <p className="eyebrow">Points experiment</p>
          <label className="toggle-row">
            <span>
              <strong>Try the points economy</strong>
              <span className="muted">Optional. Change anytime in You.</span>
            </span>
            <input
              type="checkbox"
              checked={economy}
              onChange={(e) => setEconomy(e.target.checked)}
            />
          </label>
          <div className="flow-chip-row flow-chip-row-tight">
            <span className="flow-chip">No debt</span>
            <span className="flow-chip">Forgiving streaks</span>
            <span className="flow-chip">Off = still fun</span>
          </div>
        </section>
      )}

      {!last && (
        <section className="flow-preview-strip" aria-hidden>
          <div className="flow-preview-tile">
            <span className="flow-preview-kicker">Next</span>
            <strong>{STEPS[i + 1].eyebrow}</strong>
            <span>{STEPS[i + 1].title}</span>
          </div>
          <div className="flow-preview-tile muted-tile">
            <span className="flow-preview-kicker">Then</span>
            <strong>{STEPS[Math.min(i + 2, STEPS.length - 1)].eyebrow}</strong>
            <span>Keep tapping - you’re almost in</span>
          </div>
        </section>
      )}

      <div className="flow-actions">
        {!last ? (
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              setPlaying(true);
              setI((n) => n + 1);
            }}
          >
            Continue · {i + 2}/{STEPS.length}
          </button>
        ) : (
          <button type="button" className="primary-btn blossom" onClick={finish}>
            Let’s go
          </button>
        )}
        <button type="button" className="ghost-btn" onClick={skip}>
          Skip for now
        </button>
      </div>
    </div>
  );
}
