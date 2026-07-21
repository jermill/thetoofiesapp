import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TREAT_KINDS, TREATS, type TreatKind } from '../lib/treats';
import { useStore } from '../lib/store';

export function LogScreen() {
  const { logDessert, ready } = useStore();
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  function onLog(kind: TreatKind) {
    if (!ready) return;
    logDessert(kind);
    const name = TREATS[kind].name;
    setToast(`${name} logged — enjoy it.`);
    window.setTimeout(() => {
      setToast(null);
      navigate('/');
    }, 1100);
  }

  return (
    <>
      <h1 className="screen-title">Log it</h1>
      <p className="lede">Pick what you enjoyed. Honest logging is always welcome.</p>

      <section className="card" style={{ marginTop: 8 }}>
        <p className="eyebrow">What did you have?</p>
        <div className="treat-grid" role="list">
          {TREAT_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              className="treat-btn"
              onClick={() => onLog(kind)}
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
