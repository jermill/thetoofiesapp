import { useEffect } from 'react';

import { atlas } from '../mascot/atlas';
import { ToofieSprite } from './ToofieSprite';

type Props = {
  /** Fires once the walk sheet is ready (or fails / times out). */
  onReady?: () => void;
};

const WALK_SRC = atlas.sheets.walk_cycle.src;

/**
 * Full-screen boot splash: one walking Toofie, nothing else.
 */
export function LoadSplash({ onReady }: Props) {
  useEffect(() => {
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
    <div className="load-splash" role="status" aria-busy="true" aria-label="Loading">
      <ToofieSprite
        anim="walk"
        size={230}
        alt="Toofie walking"
        className="load-mascot-solo"
        motion="task"
        loop
        tappable={false}
      />
    </div>
  );
}
