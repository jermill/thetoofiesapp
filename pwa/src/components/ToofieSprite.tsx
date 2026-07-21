import { useEffect, useMemo, useState } from 'react';

import { atlas, type ToofieAnimName } from '../mascot/atlas';

export type ToofieAnim = ToofieAnimName;

type Props = {
  anim: ToofieAnim | string;
  size?: number;
  className?: string;
  alt?: string;
  onComplete?: () => void;
};

/** Plays a named Toofie animation from the sprite atlas. */
export function ToofieSprite({
  anim,
  size = 96,
  className,
  alt = 'Toofie',
  onComplete,
}: Props) {
  const def =
    (atlas.animations as Record<string, (typeof atlas.animations)[ToofieAnimName]>)[anim] ??
    atlas.animations.idle;
  const sheet = atlas.sheets[def.sheet as keyof typeof atlas.sheets];
  const [frameIdx, setFrameIdx] = useState(0);

  const frameName = def.frames[Math.min(frameIdx, def.frames.length - 1)] as string;
  const cellIndex = Math.max(0, (sheet.frames as readonly string[]).indexOf(frameName));

  const bg = useMemo(() => {
    const cols = sheet.cols;
    const rows = sheet.rows;
    const col = cellIndex % cols;
    const row = Math.floor(cellIndex / cols);
    const x = cols <= 1 ? 0 : (col / (cols - 1)) * 100;
    const y = rows <= 1 ? 0 : (row / (rows - 1)) * 100;
    return {
      backgroundImage: `url(${sheet.src})`,
      backgroundSize: `${cols * 100}% ${rows * 100}%`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundRepeat: 'no-repeat' as const,
    };
  }, [cellIndex, sheet]);

  useEffect(() => {
    setFrameIdx(0);
  }, [anim]);

  useEffect(() => {
    if (def.frames.length <= 1) return;
    const ms = Math.max(40, Math.round(1000 / Math.max(1, def.fps)));
    let finished = false;
    const id = window.setInterval(() => {
      setFrameIdx((i) => {
        const next = i + 1;
        if (next >= def.frames.length) {
          if (def.loop) return 0;
          if (!finished) {
            finished = true;
            window.clearInterval(id);
            onComplete?.();
          }
          return i;
        }
        return next;
      });
    }, ms);
    return () => window.clearInterval(id);
  }, [anim, def.fps, def.frames.length, def.loop, onComplete]);

  return (
    <div
      className={className}
      role="img"
      aria-label={alt}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
        border: '2px solid #121212',
        backgroundColor: '#e8efe3',
        boxShadow: '0 10px 28px -18px rgba(18,18,18,.35)',
        flex: '0 0 auto',
        ...bg,
      }}
    />
  );
}

export function pickHomeAnim(opts: {
  empty: boolean;
  ready: boolean;
  milestone: boolean;
  streak: number;
}): ToofieAnim {
  if (opts.milestone) return 'milestone';
  if (opts.empty) return 'empty';
  if (opts.ready) return 'ready';
  if (opts.streak >= 7) return 'proud';
  return 'idle';
}
