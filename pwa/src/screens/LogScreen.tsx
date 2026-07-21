import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ToofieSprite } from '../components/ToofieSprite';
import { useToast } from '../components/Toast';
import { useStore } from '../lib/store';
import { TREAT_KINDS, TREATS, type TreatKind } from '../lib/treats';

export function LogScreen() {
  const { logDessert, ready } = useStore();
  const { show } = useToast();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'pick' | 'log_dessert' | 'logged'>('pick');
  const [logging, setLogging] = useState(false);

  function onLog(kind: TreatKind) {
    if (!ready || phase !== 'pick' || logging) return;
    setLogging(true);
    logDessert(kind);
    const name = TREATS[kind].name;
    show(`${name} logged — enjoy it.`, { tone: 'good', anim: 'logged', ms: 2400 });
    setPhase('log_dessert');
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 className="screen-title">Log it</h1>
          <p className="lede">Pick what you enjoyed. Honest logging is always welcome.</p>
        </div>
        <ToofieSprite
          anim={phase === 'pick' ? 'munch' : phase === 'log_dessert' ? 'log_dessert' : 'logged'}
          size={92}
          alt="Toofie reacting to your log"
          onComplete={() => {
            if (phase === 'log_dessert') {
              setPhase('logged');
              window.setTimeout(() => {
                setLogging(false);
                navigate('/');
              }, 700);
            }
          }}
        />
      </div>

      <section className="card" style={{ marginTop: 8 }}>
        <p className="eyebrow">What did you have?</p>
        <div className="treat-grid" role="list">
          {TREAT_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              className={`treat-btn${logging ? ' is-busy' : ''}`}
              onClick={() => onLog(kind)}
              disabled={phase !== 'pick' || logging}
              aria-label={`Log ${TREATS[kind].name}`}
            >
              <span className="glyph" aria-hidden>
                {TREATS[kind].emoji}
              </span>
              <span className="name">{TREATS[kind].name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <p className="eyebrow">Remember</p>
        <p className="title" style={{ fontSize: 16 }}>
          Enjoying a dessert you banked keeps you on plan. No scolding. No debt.
        </p>
      </section>
    </>
  );
}
