import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ToofieSprite } from '../components/ToofieSprite';
import { useStore } from '../lib/store';
import { TREAT_KINDS, TREATS, type TreatKind } from '../lib/treats';

export function LogScreen() {
  const { logDessert, ready } = useStore();
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const [phase, setPhase] = useState<'pick' | 'log_dessert' | 'logged'>('pick');

  function onLog(kind: TreatKind) {
    if (!ready || phase !== 'pick') return;
    logDessert(kind);
    const name = TREATS[kind].name;
    setToast(`${name} logged — enjoy it.`);
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
                setToast(null);
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
              className="treat-btn"
              onClick={() => onLog(kind)}
              disabled={phase !== 'pick'}
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

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
