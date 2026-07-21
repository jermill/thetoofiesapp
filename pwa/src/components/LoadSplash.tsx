import { useEffect } from 'react';

import { atlas } from '../mascot/atlas';
import { ToofieSprite } from './ToofieSprite';

type Props = {
  label?: string;
  /** Fires once the walk sheet is ready (or fails / times out). */
  onReady?: () => void;
};

const WALK_SRC = atlas.sheets.walk_cycle.src;

/**
 * Full-screen boot splash. Toofie walks while the app warms up.
 * No orbit ring. Splash is a loading moment - walk is intentional motion.
 */
export function LoadSplash({ label = 'Loading Toofies…', onReady }: Props) {
  useEffect(() => {
    // Remove the pre-React HTML splash once React owns the screen.
    document.getElementById('boot-splash')?.remove();

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onReady?.();
    };

    const img = new Image();
    img.onload = finish;
    img.onerror = finish;
    img.src = WALK_SRC;
    if (img.complete) finish();

    const fallback = window.setTimeout(finish, 1200);
    return () => window.clearTimeout(fallback);
  }, [onReady]);

  return (
    <div className="load-splash" role="status" aria-busy="true" aria-live="polite">
      <div className="load-splash-inner">
        <div className="load-mascot-walk">
          <ToofieSprite
            anim="walk"
            size={168}
            alt="Toofie walking"
            motion="task"
            loop
            tappable={false}
          />
        </div>
        <p className="load-brand">Toofies</p>
        <p className="load-label">{label}</p>
        <div className="load-bar" aria-hidden>
          <span />
        </div>
      </div>
    </div>
  );
}
