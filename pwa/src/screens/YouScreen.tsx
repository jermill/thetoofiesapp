import { useStore, useToofies } from '../lib/store';

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function YouScreen() {
  const { state, setDessertCost, reset, removeEntry } = useStore();
  const now = new Date();
  const t = useToofies(now);
  const recent = [...state.entries].reverse().slice(0, 12);

  return (
    <>
      <h1 className="screen-title">You</h1>
      <p className="lede">On-device only for now — nothing leaves this phone.</p>

      <section className="card">
        <p className="eyebrow">Snapshot</p>
        <p className="title" style={{ fontSize: 18 }}>
          {t.onPlanStreak} days on plan · {t.availability.balance} pts banked
        </p>
        <p className="muted">
          {t.daysSinceLastDessert === null
            ? 'No desserts logged yet.'
            : t.daysSinceLastDessert === 0
              ? 'Last dessert: today'
              : `Last dessert: ${t.daysSinceLastDessert} day${t.daysSinceLastDessert === 1 ? '' : 's'} ago`}
        </p>
      </section>

      <section className="card">
        <p className="eyebrow">Points per dessert</p>
        <div className="settings-row">
          <label htmlFor="cost">Threshold (placeholder)</label>
          <strong>{state.dessertCost}</strong>
        </div>
        <input
          id="cost"
          type="range"
          min={10}
          max={100}
          step={5}
          value={state.dessertCost}
          onChange={(e) => setDessertCost(Number(e.target.value))}
          aria-valuetext={`${state.dessertCost} points`}
          style={{ width: '100%' }}
        />
        <p className="muted">Placeholder economy values — not ratified (D7).</p>
      </section>

      <section className="card">
        <p className="eyebrow">Recent desserts</p>
        {recent.length === 0 ? (
          <p className="empty">Nothing logged yet. When you enjoy one, it’ll show up here.</p>
        ) : (
          <ul className="history-list">
            {recent.map((e) => (
              <li key={e.id}>
                <div className="left">
                  <span aria-hidden>{e.emoji}</span>
                  <div>
                    <div>{e.name}</div>
                    <div className="when">{formatWhen(e.date)}</div>
                  </div>
                </div>
                <button type="button" className="ghost-btn" onClick={() => removeEntry(e.id)}>
                  Undo
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <p className="eyebrow">Data</p>
        <button type="button" className="ghost-btn" onClick={reset}>
          Reset local preview data
        </button>
        <p className="muted" style={{ marginTop: 8 }}>
          Frontend-only PWA. Accounts, sync, and social arrive later — not in this build.
        </p>
      </section>
    </>
  );
}
