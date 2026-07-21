import { ToofieSprite } from './ToofieSprite';

type Props = {
  label?: string;
};

/**
 * Full-screen boot splash. Uses a square-sheet wave anim (not tall walk-cycle
 * cells) so Toofie is never cropped/squashed. No orbit ring.
 */
export function LoadSplash({ label = 'Loading Toofies…' }: Props) {
  return (
    <div className="load-splash" role="status" aria-busy="true" aria-live="polite">
      <div className="load-splash-inner">
        <ToofieSprite anim="wave" size={148} className="load-mascot" alt="Toofie" />
        <p className="load-brand">Toofies</p>
        <p className="load-label">{label}</p>
        <div className="load-bar" aria-hidden>
          <span />
        </div>
      </div>
    </div>
  );
}
