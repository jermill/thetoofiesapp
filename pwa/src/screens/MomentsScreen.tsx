import { GuestLock } from '../components/GuestLock';
import { ToofieSprite } from '../components/ToofieSprite';
import { loadUiPrefs } from '../lib/uiPrefs';

const FEED = [
  {
    id: '1',
    who: 'Maya',
    where: 'Sunday Soft Serve',
    when: '2h ago',
    treat: '🍦',
    caption: 'Earned this one. Worth every step.',
  },
  {
    id: '2',
    who: 'Jules',
    where: 'Corner Patisserie',
    when: 'Yesterday',
    treat: '🥐',
    caption: 'Sharing the good stuff - no guilt, just joy.',
  },
  {
    id: '3',
    who: 'Sam',
    where: 'Home kitchen',
    when: 'Fri',
    treat: '🍪',
    caption: 'Cookie o’clock with the sweet Toofies.',
  },
];

export function MomentsScreen() {
  if (loadUiPrefs().guestMode) {
    return (
      <GuestLock
        title="Moments"
        blurb="The shared dessert feed is tied to real people - it needs an account."
      />
    );
  }
  return (
    <>
      <p className="ui-only-chip">UI only · mock feed · no network</p>
      <div className="brand-lockup">
        <div className="brand-left">
          <h1 className="screen-title">Moments</h1>
          <p className="lede">Dessert with friends - share the joy, not the judgment.</p>
        </div>
        <ToofieSprite anim="heart_eyes" size={84} />
      </div>

      <section className="card composer">
        <p className="eyebrow">Share a moment</p>
        <button type="button" className="primary-btn blossom" disabled>
          Post a dessert (coming soon)
        </button>
        <p className="muted">Photo + place + caption. Backend + moderation not built yet.</p>
      </section>

      <div className="feed">
        {FEED.map((item) => (
          <article key={item.id} className="card feed-card">
            <header className="feed-head">
              <div className="avatar" aria-hidden>
                {item.who.slice(0, 1)}
              </div>
              <div>
                <strong>{item.who}</strong>
                <p className="muted" style={{ margin: 0 }}>
                  {item.where} · {item.when}
                </p>
              </div>
              <span className="feed-treat" aria-hidden>
                {item.treat}
              </span>
            </header>
            <div className="feed-media" aria-hidden>
              <span>{item.treat}</span>
            </div>
            <p className="feed-caption">{item.caption}</p>
            <div className="feed-actions">
              <button type="button" className="ghost-btn" disabled>
                Cheer
              </button>
              <button type="button" className="ghost-btn" disabled>
                Comment
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
