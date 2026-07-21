import { useEffect } from 'react';

type Props = {
  label?: string;
  /** Fires once the mascot image is ready (or fails / times out). */
  onReady?: () => void;
};

/** Small cutout — paints fast; never hide behind opacity:0. */
export const SPLASH_TOOTH = '/mascot/toofie-splash.png?v=10';

/**
 * Full-screen boot splash. Static Toofie PNG only — no sprite sheets, no orbit.
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
    img.src = SPLASH_TOOTH;
    if (img.complete) finish();

    const fallback = window.setTimeout(finish, 800);
    return () => window.clearTimeout(fallback);
  }, [onReady]);

  return (
    <div className="load-splash" role="status" aria-busy="true" aria-live="polite">
      <div className="load-splash-inner">
        <img
          src={SPLASH_TOOTH}
          alt="Toofie"
          className="load-mascot-img is-in"
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
