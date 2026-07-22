import { useEffect, useMemo, useState } from 'react';

import { atlas, type ToofieAnimName } from '../mascot/atlas';

export type ToofieAnim = ToofieAnimName;

/**
 * still - ambient UI: one pose, no motion while the screen is idle.
 * task - reaction to something the user just did (log, toast, milestone,
 *        active walk). Plays frames; loops only when the atlas (or override)
 *        says the task is ongoing.
 */
export type ToofieMotion = 'still' | 'task';

type Props = {
  anim: ToofieAnim | string;
  size?: number;
  className?: string;
  alt?: string;
  /** Default `still` so Toofie never fidgets on a static screen. */
  motion?: ToofieMotion;
  /** Override atlas loop when `motion="task"`. */
  loop?: boolean;
  /** Tap for a gentle wiggle + short reaction. Default true. */
  tappable?: boolean;
  /** Sprite played once on tap. Default `wave`. */
  tapAnim?: ToofieAnim | string;
  onComplete?: () => void;
};

type Sheet = (typeof atlas.sheets)[keyof typeof atlas.sheets];
type AnimDef = (typeof atlas.animations)[ToofieAnimName];

type FrameBox = {
  width: number;
  height: number;
  overflow: 'hidden';
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
  backgroundRepeat: 'no-repeat';
};

/**
 * Map one atlas cell into a clip box that can never show neighbors.
 * Tall cycle sheets: size×size, width-locked to one column, crop to band.
 * Grid sheets: exact scaled cell (contained in size); parent centers it.
 */
function frameStyle(sheet: Sheet, cellIndex: number, size: number): FrameBox {
  const cols = sheet.cols;
  const rows = sheet.rows;
  const sheetW = Number(sheet.width);
  const sheetH = Number(sheet.height);
  const cw = sheetW / cols;
  const ch = sheetH / rows;
  const col = cellIndex % cols;
  const row = Math.floor(cellIndex / cols);
  const tall = ch / cw > 1.5;

  if (tall) {
    const scale = size / cw;
    const band = ch * 0.42;
    return {
      width: size,
      height: size,
      overflow: 'hidden',
      backgroundImage: `url(${sheet.src})`,
      backgroundSize: `${sheetW * scale}px ${sheetH * scale}px`,
      backgroundPosition: `${-(col * cw * scale)}px ${
        -(row * ch * scale) - (band * scale - size) / 2
      }px`,
      backgroundRepeat: 'no-repeat',
    };
  }

  const scale = Math.min(size / cw, size / ch);
  const cellW = cw * scale;
  const cellH = ch * scale;
  return {
    width: cellW,
    height: cellH,
    overflow: 'hidden',
    backgroundImage: `url(${sheet.src})`,
    backgroundSize: `${sheetW * scale}px ${sheetH * scale}px`,
    backgroundPosition: `${-(col * cw * scale)}px ${-(row * ch * scale)}px`,
    backgroundRepeat: 'no-repeat',
  };
}

function resolveAnim(name: string): AnimDef {
  return (
    (atlas.animations as Record<string, AnimDef>)[name] ?? atlas.animations.idle
  );
}

/** Plays a named Toofie animation from the sprite atlas. */
export function ToofieSprite({
  anim,
  size = 96,
  className,
  alt = 'Toofie',
  motion = 'still',
  loop: loopOverride,
  tappable = true,
  tapAnim = 'wave',
  onComplete,
}: Props) {
  const [frameIdx, setFrameIdx] = useState(0);
  const [wiggling, setWiggling] = useState(false);
  const [tapPlaying, setTapPlaying] = useState(false);
  const [tapKey, setTapKey] = useState(0);

  const activeName = tapPlaying ? tapAnim : anim;
  const def = resolveAnim(activeName);
  const sheet = atlas.sheets[def.sheet as keyof typeof atlas.sheets];

  const frameName = def.frames[Math.min(frameIdx, def.frames.length - 1)] as string;
  const cellIndex = Math.max(0, (sheet.frames as readonly string[]).indexOf(frameName));

  const style = useMemo(
    () => frameStyle(sheet, cellIndex, size),
    [cellIndex, sheet, size],
  );

  const shouldPlay =
    (motion === 'task' || tapPlaying) && def.frames.length > 1;
  const shouldLoop = tapPlaying ? false : (loopOverride ?? def.loop);

  useEffect(() => {
    setFrameIdx(0);
  }, [activeName, motion, tapPlaying, tapKey]);

  useEffect(() => {
    if (!shouldPlay) {
      // Single-frame tap (or reduced sheets): still end the tap cycle.
      if (tapPlaying && def.frames.length <= 1) {
        const t = window.setTimeout(() => setTapPlaying(false), 550);
        return () => window.clearTimeout(t);
      }
      return;
    }
    const ms = Math.max(40, Math.round(1000 / Math.max(1, def.fps)));
    let finished = false;
    const id = window.setInterval(() => {
      setFrameIdx((i) => {
        const next = i + 1;
        if (next >= def.frames.length) {
          if (shouldLoop) return 0;
          if (!finished) {
            finished = true;
            window.clearInterval(id);
            if (tapPlaying) setTapPlaying(false);
            else onComplete?.();
          }
          return i;
        }
        return next;
      });
    }, ms);
    return () => window.clearInterval(id);
  }, [
    activeName,
    shouldPlay,
    shouldLoop,
    def.fps,
    def.frames.length,
    onComplete,
    tapPlaying,
    tapKey,
  ]);

  function playTap() {
    if (!tappable) return;
    setTapKey((k) => k + 1);
    setWiggling(true);
    setTapPlaying(true);
    window.setTimeout(() => setWiggling(false), 900);
  }

  const spriteClass = [
    'toofie-sprite',
    wiggling ? 'is-wiggle' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const sprite = (
    <div
      className="toofie-sprite-slot"
      style={{
        width: size,
        height: size,
        flex: '0 0 auto',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div
        className={spriteClass}
        role={tappable ? undefined : 'img'}
        aria-hidden={tappable ? true : undefined}
        aria-label={tappable ? undefined : alt}
        style={style}
      />
    </div>
  );

  if (!tappable) return sprite;

  return (
    <button
      type="button"
      className={`toofie-tap${wiggling ? ' is-active' : ''}`}
      aria-label={`${alt} - tap to wiggle`}
      onPointerUp={(e) => {
        // Pointer covers mouse + touch; ignore right-click / pen barrels.
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        playTap();
      }}
      style={{ width: size + 20, height: size + 20 }}
    >
      {sprite}
    </button>
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
