import { Link } from 'react-router-dom';

import { ToofieSprite } from './ToofieSprite';

/**
 * Shown in place of account-backed screens while in guest mode.
 * Core tracking stays fully usable; this only gates social/sync surfaces.
 */
export function GuestLock({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="guest-lock">
      <ToofieSprite anim="think" size={116} tappable={false} />
      <p className="eyebrow">Guest mode</p>
      <h1 className="guest-lock-title">{title} needs an account</h1>
      <p className="lede guest-lock-lede">{blurb}</p>
      <ul className="guest-lock-list">
        <li>Logging, readiness + streaks work without an account</li>
        <li>Accounts unlock buddies, moments, the map + nudges</li>
        <li>Free, 30 seconds - dessert logs still stay on-device</li>
      </ul>
      <Link to="/auth" className="primary-btn guest-lock-cta">
        Create a free account
      </Link>
      <Link to="/" className="ghost-btn">
        Keep tracking as guest
      </Link>
    </div>
  );
}
