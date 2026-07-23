import { Link } from 'react-router-dom';

import { GuestLock } from '../components/GuestLock';
import { ToofieSprite } from '../components/ToofieSprite';
import { loadUiPrefs } from '../lib/uiPrefs';

const NEARBY = [
  {
    name: 'The Soft Serve Social',
    vibe: 'Custard · late-night',
    query: 'ice cream dessert near me',
  },
  {
    name: 'Crumb & Co.',
    vibe: 'Cookies · coffee',
    query: 'cookie bakery dessert near me',
  },
  {
    name: 'Matcha After Dark',
    vibe: 'Soft serve · matcha',
    query: 'matcha dessert cafe near me',
  },
  {
    name: 'Pie Orbit',
    vibe: 'Slice · shareable',
    query: 'pie dessert restaurant near me',
  },
] as const;

function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function mapsEmbedUrl(query: string) {
  // No API key required for this basic search embed pattern.
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=13&output=embed`;
}

/** Explore dessert spots via Google Maps (place search - not live location). */
export function DessertMapScreen() {
  const defaultQuery = 'dessert restaurants near me';

  if (loadUiPrefs().guestMode) {
    return (
      <GuestLock
        title="The dessert map"
        blurb="Saving and sharing spots is an account thing - guests keep the core tracker."
      />
    );
  }

  return (
    <div className="page-stack">
      <p className="ui-only-chip">UI mock · opens Google Maps · place search only</p>

      <header className="page-header">
        <div className="page-header-copy">
          <h1 className="screen-title">Dessert map</h1>
          <p className="lede">
            Find somewhere sweet nearby. Places, not your live pin - check in when you want.
          </p>
        </div>
        <ToofieSprite anim="munch" size={84} tapAnim="wave" />
      </header>

      <section className="map-frame card">
        <iframe
          title="Dessert restaurants on Google Maps"
          src={mapsEmbedUrl(defaultQuery)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <a
          className="primary-btn blossom map-open-btn"
          href={mapsSearchUrl(defaultQuery)}
          target="_blank"
          rel="noreferrer"
        >
          Open in Google Maps
        </a>
      </section>

      <section className="card">
        <p className="eyebrow">Toofie’s shortlist</p>
        <p className="muted" style={{ marginTop: 0 }}>
          Tap a vibe - Maps handles the rest. No tracking trail in-app.
        </p>
        <ul className="map-place-list">
          {NEARBY.map((p) => (
            <li key={p.name}>
              <a href={mapsSearchUrl(p.query)} target="_blank" rel="noreferrer">
                <strong>{p.name}</strong>
                <span>{p.vibe}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <Link to="/you" className="ghost-btn">
        ← Back to You
      </Link>
    </div>
  );
}
