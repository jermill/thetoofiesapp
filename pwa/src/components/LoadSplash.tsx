import { useEffect, useState } from 'react';

type Props = {
  label?: string;
  /** Fires once the mascot image is ready (or fails). */
  onReady?: () => void;
};

const TOOTH =
  '/mascot/toofie-choc-jimmies-icon.png?v=7';

/**
 * Full-screen boot splash. Uses a preloaded static Toofie PNG so the character
 * is visible even before sprite sheets hydrate. No orbit ring.
 */
export function LoadSplash({ label = 'Loading Toofies…', onReady }: Props) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setLoaded(true);
      onReady?.();
    };

    const img = new Image();
    img.onload = finish;
    img.onerror = finish;
    img.src = TOOTH;
    // If already cached, complete on next tick
    if (img.complete) finish();

    const fallback = window.setTimeout(finish, 1200);
    return () => window.clearTimeout(fallback);
  }, [onReady]);

  return (
    <div className="load-splash" role="status" aria-busy="true" aria-live="polite">
      <div className="load-splash-inner">
        <img
          src={TOOTH}
          alt="Toofie"
          className={`load-mascot-img${loaded ? ' is-in' : ''}`}
          width={168}
          height={168}
          decoding="async"
          fetchPriority="high"
        />
        <p className="load-brand">Toofies</p>
        <p className="load-label">{label}</p>
        <div className="load-bar" aria-hidden>
          <span />
        </div>
      </div>
    </div>
  );
}
