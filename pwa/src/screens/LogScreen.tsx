import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ToofieSprite } from '../components/ToofieSprite';
import { useToast } from '../components/Toast';
import { saveLogMeta } from '../lib/logMeta';
import { fileToDataUrl } from '../lib/profile';
import { useStore } from '../lib/store';
import { TREAT_KINDS, TREATS, type TreatKind } from '../lib/treats';

export function LogScreen() {
  const { logDessert, ready } = useStore();
  const { show } = useToast();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<'pick' | 'log_dessert' | 'logged'>('pick');
  const [logging, setLogging] = useState(false);
  const [photo, setPhoto] = useState('');
  const [note, setNote] = useState('');
  const [place, setPlace] = useState('');

  async function onPhoto(file: File | null) {
    if (!file) return;
    try {
      const data = await fileToDataUrl(file, 900);
      setPhoto(data);
      show('Photo attached', { tone: 'soft', anim: 'munch', ms: 1400 });
    } catch {
      show('Couldn’t attach photo', { tone: 'soft', anim: 'shrug', ms: 1600 });
    }
  }

  function onLog(kind: TreatKind) {
    if (!ready || phase !== 'pick' || logging) return;
    setLogging(true);
    const id = logDessert(kind);
    if (id && (photo || note || place)) {
      saveLogMeta(id, {
        photoDataUrl: photo || undefined,
        note: note || undefined,
        place: place || undefined,
      });
    }
    const name = TREATS[kind].name;
    show(`${name} logged — enjoy it.`, { tone: 'good', anim: 'logged', ms: 2400 });
    setPhase('log_dessert');
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 className="screen-title">Log it</h1>
          <p className="lede">Pick what you enjoyed. Add a photo if you want.</p>
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

      <section className="card stack-form">
        <p className="eyebrow">Optional extras</p>
        {photo ? (
          <div className="log-photo-wrap">
            <img src={photo} alt="Attached dessert" className="log-photo" />
            <button type="button" className="ghost-btn" onClick={() => setPhoto('')}>
              Remove photo
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="mini-btn"
            onClick={() => fileRef.current?.click()}
            disabled={phase !== 'pick'}
          >
            Add photo
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => void onPhoto(e.target.files?.[0] ?? null)}
        />
        <label className="field">
          <span>Place (optional)</span>
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="e.g. Sunday Soft Serve"
            disabled={phase !== 'pick'}
          />
        </label>
        <label className="field">
          <span>Note (optional)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Worth it."
            disabled={phase !== 'pick'}
          />
        </label>
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
