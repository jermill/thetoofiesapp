import { Link } from 'react-router-dom';

import { ToofieSprite } from '../components/ToofieSprite';
import { useToofies } from '../lib/store';

export function WidgetScreen() {
  const t = useToofies(new Date());
  const ready = t.availability.bankedDesserts > 0;
  const recency =
    t.daysSinceLastDessert === null
      ? 'No dessert yet'
      : t.daysSinceLastDessert === 0
        ? 'Dessert today'
        : `${t.daysSinceLastDessert}d since treat`;

  return (
    <>
      <p className="ui-only-chip">Widget mock · not a real iOS widget yet (D17)</p>
      <div className="brand-lockup">
        <div className="brand-left">
          <h1 className="screen-title">Widget</h1>
          <p className="lede">Home Screen glance - research’s #1 feature. Visual preview only.</p>
        </div>
        <ToofieSprite anim={ready ? 'ready' : 'idle'} size={72} />
      </div>

      <section className="card">
        <p className="eyebrow">Small</p>
        <div className="widget-frame widget-sm">
          <div className="widget-sm-row">
            <ToofieSprite anim={ready ? 'ready' : 'almost'} size={40} />
            <div>
              <strong>Toofies</strong>
              <p>{ready ? 'Treat check: yes' : 'Almost there'}</p>
            </div>
          </div>
          <p className="widget-meta">{recency}</p>
        </div>
      </section>

      <section className="card">
        <p className="eyebrow">Medium</p>
        <div className="widget-frame widget-md">
          <div className="widget-md-top">
            <div>
              <p className="eyebrow" style={{ color: 'inherit', opacity: 0.7 }}>
                Last dessert
              </p>
              <strong>{recency}</strong>
            </div>
            <ToofieSprite anim="proud" size={48} />
          </div>
          <div className="widget-md-stats">
            <div>
              <b>{t.onPlanStreak}</b>
              <span>days on plan</span>
            </div>
            <div>
              <b>
                {t.availability.balance}/{t.availability.cost}
              </b>
              <span>pts</span>
            </div>
          </div>
        </div>
      </section>

      <p className="fineprint">
        Real widgets need a native/Expo module + D17 ratification. This is the layout target.{' '}
        <Link to="/you">Back to You</Link>
      </p>
    </>
  );
}
