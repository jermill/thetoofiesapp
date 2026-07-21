import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ToofieSprite } from '../components/ToofieSprite';
import { saveUiPrefs } from '../lib/uiPrefs';

const STEPS = [
  {
    eyebrow: 'Welcome',
    title: 'Dessert, with peace of mind',
    body: 'Know when you last treated yourself — and feel good about enjoying the next one.',
    anim: 'welcome',
  },
  {
    eyebrow: 'Recency first',
    title: 'The safe core is simply “when?”',
    body: 'No calories. No weight. No scolding. Just a calm answer to “am I ready for a dessert?”',
    anim: 'think',
  },
  {
    eyebrow: 'Optional points',
    title: 'Bank sweetness your way',
    body: 'Clean days and movement can bank points toward a treat — as an opt-in experiment, never a punishment.',
    anim: 'ready',
  },
  {
    eyebrow: 'Meet Toofie',
    title: 'Your little hype tooth',
    body: 'Toofie cheers milestones and dessert logs. Playful. Never guilt.',
    anim: 'cheer',
  },
] as const;

export function OnboardingScreen() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const [economy, setEconomy] = useState(true);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  const progress = useMemo(() => ((i + 1) / STEPS.length) * 100, [i]);

  function finish() {
    saveUiPrefs({ onboardingDone: true, economyOptIn: economy });
    navigate('/auth', { replace: true });
  }

  return (
    <div className="flow-screen">
      <p className="ui-only-chip">UI only · no backend</p>
      <div className="flow-progress" aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="flow-hero">
        <ToofieSprite anim={step.anim} size={120} />
        <p className="eyebrow">{step.eyebrow}</p>
        <h1 className="flow-title">{step.title}</h1>
        <p className="lede">{step.body}</p>
      </div>

      {last && (
        <section className="card">
          <p className="eyebrow">Points experiment</p>
          <label className="toggle-row">
            <span>
              <strong>Try the points economy</strong>
              <span className="muted">You can change this later in You.</span>
            </span>
            <input
              type="checkbox"
              checked={economy}
              onChange={(e) => setEconomy(e.target.checked)}
            />
          </label>
        </section>
      )}

      <div className="flow-actions">
        {!last ? (
          <button type="button" className="primary-btn" onClick={() => setI((n) => n + 1)}>
            Continue
          </button>
        ) : (
          <button type="button" className="primary-btn blossom" onClick={finish}>
            Let’s go
          </button>
        )}
        <button
          type="button"
          className="ghost-btn"
          onClick={() => {
            saveUiPrefs({ onboardingDone: true, economyOptIn: economy });
            navigate('/', { replace: true });
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
