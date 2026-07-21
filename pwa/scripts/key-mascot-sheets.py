#!/usr/bin/env python3
"""Key solid plate backgrounds out of Toofie sprite sheets.

Reads RGB plates from mascot-plates/raw/,
writes hard-cut transparent RGBA sheets to public/mascot/,
plus #00FF00 green-screen modules under mascot-plates/green-screen/.

Usage:
  python3 pwa/scripts/key-mascot-sheets.py
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

PUBLIC = Path(__file__).resolve().parents[1] / "public" / "mascot"
PLATES = Path(__file__).resolve().parents[1] / "mascot-plates"
RAW = PLATES / "raw"
GREEN = PLATES / "green-screen"
ROOT = PUBLIC

SHEETS: dict[str, tuple[int, int]] = {
    "toofie-sprite-sheet-actions.png": (4, 3),
    "toofie-sprite-sheet-moods.png": (4, 3),
    "toofie-sprite-sheet-app.png": (4, 3),
    "toofie-sprite-walk-cycle.png": (8, 1),
    "toofie-sprite-celebrate-cycle.png": (6, 1),
    "toofie-sprite-milestone-cycle.png": (8, 1),
    "toofie-sprite-log-cycle.png": (6, 1),
}


def flood_from_border(allowed: np.ndarray) -> np.ndarray:
    h, w = allowed.shape
    out = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, 1, h - 2, h - 1):
            if allowed[y, x] and not out[y, x]:
                out[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, 1, w - 2, w - 1):
            if allowed[y, x] and not out[y, x]:
                out[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and allowed[ny, nx] and not out[ny, nx]:
                out[ny, nx] = True
                q.append((ny, nx))
    return out


def flood_from_seeds(allowed: np.ndarray, seeds: np.ndarray) -> np.ndarray:
    h, w = allowed.shape
    out = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()
    ys, xs = np.where(seeds & allowed)
    for y, x in zip(ys.tolist(), xs.tolist()):
        out[y, x] = True
        q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and allowed[ny, nx] and not out[ny, nx]:
                out[ny, nx] = True
                q.append((ny, nx))
    return out


def morph_dilate(mask: np.ndarray, rad: int = 1) -> np.ndarray:
    im = Image.fromarray(mask.astype(np.uint8) * 255, mode="L")
    for _ in range(rad):
        im = im.filter(ImageFilter.MaxFilter(3))
    return np.array(im) > 127


def key_sheet(path: Path, cols: int, rows: int) -> Image.Image:
    im = Image.open(path).convert("RGB")
    arr = np.asarray(im, dtype=np.uint8)
    r = arr[:, :, 0].astype(np.int16)
    g = arr[:, :, 1].astype(np.int16)
    b = arr[:, :, 2].astype(np.int16)
    h, w = r.shape
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)

    # --- Character pigments (never key) ---
    pink = (r > 165) & (b > 95) & (g < 165) & (r > g + 12)
    ink = (r < 100) & (g < 100) & (b < 100)
    chocolate = (r > 85) & (g < 95) & (b < 85) & (r > g + 18)
    vivid = ((mx - mn) >= 80) & (mn < 175)
    # Core pigments — always keep. Tooth fill is NOT protected during edge eat
    # so chalky white halos can be removed.
    core = pink | ink | chocolate | vivid
    # True tooth fill is near-white (>=245). Gray mats (~238) must NOT match.
    tooth = (
        (mn >= 245)
        & ((mx - mn) <= 14)
        & ((r - b) <= 10)
        & (np.abs(r - g) <= 8)
        & (g <= r + 3)
    )
    protected = core | tooth  # used for plate classification only

    # --- Plate colors ---
    mint = (
        (g >= 170)
        & (g >= r + 2)
        & (g >= b - 1)
        & (r >= 120)
        & (b >= 120)
        & ((g - r) <= 95)
    )
    chroma = (g >= 190) & (r <= 90) & (b <= 90)
    # Warm cream only — requires clearly lower blue than white tooth
    cream = (
        (r >= 245)
        & (g >= 235)
        & (b >= 205)
        & (b <= 242)
        & ((r - b) >= 12)
        & ((g - b) >= 8)
        & (np.abs(r - g) <= 20)
    )
    gray = (mn >= 175) & (mx <= 244) & ((mx - mn) <= 18)
    wash = (mn >= 210) & ((mx - mn) <= 30) & (g >= r + 2) & (g >= b) & ((r - b) <= 10)

    mint_bg = (mint | chroma | gray | wash) & ~core
    cream_bg = cream & ~core & ~tooth

    # Cell-corner seeds (grid gutters)
    cw, ch = max(1, w // cols), max(1, h // rows)
    seeds = np.zeros((h, w), dtype=bool)
    for row in range(rows):
        for col in range(cols):
            x0, y0 = col * cw, row * ch
            for dx, dy in (
                (2, 2),
                (cw - 3, 2),
                (2, ch - 3),
                (cw - 3, ch - 3),
                (cw // 2, 1),
                (1, ch // 2),
            ):
                x = min(w - 1, max(0, x0 + dx))
                y = min(h - 1, max(0, y0 + dy))
                seeds[y, x] = True

    # Mint/gray: flood + keep all mint-like (safe; tooth isn't mint)
    mint_flood = flood_from_border(mint_bg) | flood_from_seeds(mint_bg, seeds) | mint_bg

    # Cream: global key is safe because cream requires warm low-B; white tooth does not match.
    # Also flood so near-cream edge crumbs connected to plate get pulled in.
    cream_flood = flood_from_border(cream_bg) | flood_from_seeds(cream_bg, seeds)
    bg = mint_flood | cream_flood | cream_bg

    # Slight dilate to catch plate crumbs; never eat core pigments or tooth fill
    bg = morph_dilate(bg, 1)
    bg &= ~(core | tooth)
    pale_mint = mint_bg & ((mx - mn) <= 28)
    bg |= pale_mint
    bg &= ~(core | tooth)

    # Eat only gray/mat fringe next to transparency — not near-white tooth (>=245)
    mat_fringe = (mn >= 175) & (mn <= 244) & ((mx - mn) <= 22) & ~(core | tooth)
    for _ in range(2):
        near_bg = morph_dilate(bg, 1) & ~bg
        bg |= near_bg & mat_fringe
    bg &= ~(core | tooth)

    # Hard cut — no soft plate residue in animations
    out_a = np.where(bg, 0, 255).astype(np.uint8)
    out_rgb = arr.copy()

    rgba = np.dstack([out_rgb, out_a])
    return Image.fromarray(rgba, mode="RGBA")


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    GREEN.mkdir(parents=True, exist_ok=True)

    for name, grid in SHEETS.items():
        live = ROOT / name
        raw = RAW / name
        if not raw.exists():
            if not live.exists():
                raise SystemExit(f"missing sheet: {name}")
            Image.open(live).convert("RGB").save(raw)
            print(f"backed up {name}")

        out = key_sheet(raw, *grid)
        out.save(live, optimize=True)
        plate = Image.new("RGBA", out.size, (0, 255, 0, 255))
        Image.alpha_composite(plate, out).convert("RGB").save(GREEN / name, optimize=True)

        a = np.asarray(out.getchannel("A"))
        clear = float((a < 20).mean() * 100)
        soft = float(((a >= 20) & (a < 250)).mean() * 100)
        print(f"{name}: ~{clear:.1f}% clear · {soft:.1f}% soft edge")


if __name__ == "__main__":
    main()
