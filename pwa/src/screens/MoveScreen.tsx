import { useState } from 'react';

import { ToofieSprite } from '../components/ToofieSprite';
import { useToast } from '../components/Toast';
import { loadUiPrefs, saveUiPrefs } from '../lib/uiPrefs';

export function MoveScreen() {
  const { show } = useToast();
  const [prefs, setPrefs] = useState(loadUiPrefs);
  const [connecting, setConnecting] = useState(false);
  const connected = prefs.healthConnectedMock;
  const steps = connected ? 7420 : 0;
  const goal = 6000;
  const pct = Math.min(100, Math.round((steps / goal) * 100));

  function toggleHealth() {
    if (connecting) return;
    if (connected) {
      setPrefs(saveUiPrefs({ healthConnectedMock: false }));
      show('Activity disconnected (mock)', { tone: 'soft', anim: 'shrug', ms: 1800 });
      return;
    }
    setConnecting(true);
    show('Connecting…', { tone: 'soft', anim: 'hike', ms: 1200 });
    window.setTimeout(() => {
      setPrefs(saveUiPrefs({ healthConnectedMock: true }));
      setConnecting(false);
      show('Steps synced (mock)', { tone: 'good', anim: 'cheer', ms: 2000 });
    }, 1100);
  }

  return (
    <div className="page-stack">
      <p className="ui-only-chip">UI only · HealthKit not connected</p>

      <header className="page-header">
        <div className="page-header-copy">
          <h1 className="screen-title">Move</h1>
          <p className="lede">
            Steps add sweetness to your day - never as penance.
          </p>
        </div>
        <ToofieSprite
          anim={connected ? 'hike' : 'think'}
          size={88}
          tapAnim={connected ? 'hike' : 'wave'}
        />
      </header>

      <section className="hero move-hero">
        <p className="eyebrow">Today</p>
        <h2 className="headline">{connected ? steps.toLocaleString() : '-'}</h2>
        <p className="sub">
          {connected ? `of ${goal.toLocaleString()} quest steps` : 'Connect activity to see steps'}
        </p>
        <div className="progress" aria-hidden>
          <span style={{ width: `${connected ? pct : 0}%` }} />
        </div>
      </section>

      <section className="card">
        <p className="eyebrow">Daily quest</p>
        <p className="title" style={{ fontSize: 18 }}>
          {connected
            ? steps >= goal
              ? 'Quest complete - nice work'
              : 'Keep strolling'
            : 'Quest waits for activity'}
        </p>
        <p className="muted">
          Adaptive goal from your recent week (placeholder). Bonus banks at midnight when
          connected.
        </p>
      </section>

      <section className="card">
        <p className="eyebrow">Activity source</p>
        <div className="settings-row">
          <div>
            <strong>Apple Health / Health Connect</strong>
            <p className="muted" style={{ margin: 0 }}>
              Read-only steps. UI mock only.
            </p>
          </div>
          <button type="button" className="mini-btn" onClick={toggleHealth} disabled={connecting}>
            {connecting ? 'Connecting…' : connected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </section>

      <section className="stat-grid">
        <div className="card stat">
          <p className="eyebrow">This week</p>
          <p className="stat-num">{connected ? '41.2k' : '-'}</p>
          <p className="muted">steps</p>
        </div>
        <div className="card stat">
          <p className="eyebrow">Bonus pending</p>
          <p className="stat-num">{connected ? '+5' : '0'}</p>
          <p className="muted">quest pts tonight</p>
        </div>
      </section>
    </div>
  );
}
