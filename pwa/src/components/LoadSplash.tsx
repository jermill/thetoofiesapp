import { ToofieSprite } from './ToofieSprite';

type Props = {
  label?: string;
};

/** Full-screen load splash while the store / gate hydrates. */
export function LoadSplash({ label = 'Loading Toofies…' }: Props) {
  return (
    <div className="load-splash" role="status" aria-busy="true" aria-live="polite">
      <div className="load-splash-inner">
        <ToofieSprite anim="walk" size={132} className="load-mascot" alt="" />
        <p className="load-brand">Toofies</p>
        <p className="load-label">{label}</p>
        <div className="load-bar" aria-hidden>
          <span />
        </div>
      </div>
    </div>
  );
}
