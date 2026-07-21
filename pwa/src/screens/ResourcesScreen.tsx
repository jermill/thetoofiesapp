import { Link } from 'react-router-dom';

import { ToofieSprite } from '../components/ToofieSprite';

export function ResourcesScreen() {
  return (
    <>
      <p className="ui-only-chip">Required safeguard · always available</p>
      <div className="brand-lockup">
        <div className="brand-left">
          <h1 className="screen-title">Care</h1>
          <p className="lede">If dessert tracking ever feels heavy, pause the app and reach out.</p>
        </div>
        <ToofieSprite anim="sit" size={84} />
      </div>

      <section className="card">
        <p className="eyebrow">Eating-disorder resources</p>
        <ul className="link-list">
          <li>
            <a href="https://www.nationaleatingdisorders.org/" target="_blank" rel="noreferrer">
              NEDA — National Eating Disorders Association
            </a>
          </li>
          <li>
            <a href="https://www.nationaleatingdisorders.org/help-support/contact-helpline" target="_blank" rel="noreferrer">
              NEDA Helpline
            </a>
          </li>
          <li>
            <a href="https://www.iasp.info/suicidalthoughts/" target="_blank" rel="noreferrer">
              Local crisis resources (IASP)
            </a>
          </li>
        </ul>
        <p className="muted">
          Toofies is not medical care. An ED-specialist review is required before any earn/spend food
          mechanic ships.
        </p>
      </section>

      <section className="card">
        <p className="eyebrow">In-app posture</p>
        <p className="title" style={{ fontSize: 16 }}>
          Honest logging is never blocked. No debt. No abstinence scoreboard.
        </p>
      </section>

      <Link to="/you" className="ghost-btn">
        ← Back to You
      </Link>
    </>
  );
}
