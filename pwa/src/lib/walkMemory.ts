/** Compose a shareable walk-complete “memory” image (canvas screenshot). */

export type WalkMemoryStats = {
  combined: number;
  goal: number;
  buddyName: string;
  meSteps: number;
  buddySteps: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Builds a 1080×1350 cream card with optional photo + walk stats. */
export async function composeWalkMemoryCard(
  photoDataUrl: string | null,
  stats: WalkMemoryStats,
): Promise<string> {
  const w = 1080;
  const h = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  // Background
  ctx.fillStyle = '#fefae7';
  ctx.fillRect(0, 0, w, h);
  const grad = ctx.createRadialGradient(w * 0.8, 0, 40, w * 0.8, 0, w * 0.7);
  grad.addColorStop(0, 'rgba(255, 186, 216, 0.55)');
  grad.addColorStop(1, 'rgba(254, 250, 231, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Photo frame
  const frameX = 72;
  const frameY = 120;
  const frameW = w - 144;
  const frameH = 720;
  ctx.fillStyle = '#03563e';
  roundRect(ctx, frameX - 8, frameY - 8, frameW + 16, frameH + 16, 36);
  ctx.fill();

  if (photoDataUrl) {
    try {
      const img = await loadImage(photoDataUrl);
      ctx.save();
      roundRect(ctx, frameX, frameY, frameW, frameH, 28);
      ctx.clip();
      const scale = Math.max(frameW / img.width, frameH / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, frameX + (frameW - dw) / 2, frameY + (frameH - dh) / 2, dw, dh);
      ctx.restore();
    } catch {
      drawPhotoPlaceholder(ctx, frameX, frameY, frameW, frameH);
    }
  } else {
    drawPhotoPlaceholder(ctx, frameX, frameY, frameW, frameH);
  }

  // Copy
  ctx.fillStyle = '#121212';
  ctx.font = '700 28px Outfit, system-ui, sans-serif';
  ctx.fillText('TOOFIES · DESSERT WALK', 80, 920);

  ctx.font = '900 72px Anton, Impact, sans-serif';
  ctx.fillText('WALK COMPLETE', 80, 1000);

  ctx.font = '600 36px Outfit, system-ui, sans-serif';
  ctx.fillStyle = '#4a4a44';
  ctx.fillText(
    `${stats.combined.toLocaleString()} steps with ${stats.buddyName || 'buddy'}`,
    80,
    1060,
  );
  ctx.fillText(
    `You ${stats.meSteps.toLocaleString()} · ${stats.buddyName || 'Buddy'} ${stats.buddySteps.toLocaleString()}`,
    80,
    1110,
  );
  ctx.fillText('Movement as joy - never penance.', 80, 1170);

  ctx.fillStyle = '#03563e';
  ctx.font = '800 32px Outfit, system-ui, sans-serif';
  ctx.fillText('Goal cleared · snag a treat-check ✨', 80, 1240);

  return canvas.toDataURL('image/jpeg', 0.92);
}

function drawPhotoPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.fillStyle = '#047052';
  roundRect(ctx, x, y, w, h, 28);
  ctx.fill();
  ctx.fillStyle = '#fefae7';
  ctx.font = '700 48px Outfit, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Snap the finish line', x + w / 2, y + h / 2);
  ctx.textAlign = 'left';
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
