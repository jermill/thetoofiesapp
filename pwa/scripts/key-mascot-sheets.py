#!/usr/bin/env python3
"""Key solid plate backgrounds out of Toofie sprite sheets.

Reads RGB plates from mascot-plates/raw/,
writes transparent RGBA sheets to public/mascot/ (PWA atlas),
plus pure #00FF00 green-screen modules under mascot-plates/green-screen/.

Usage:
  python3 pwa/scripts/key-mascot-sheets.py
"""

from __future__ import annotations

import collections
import os
from pathlib import Path

from PIL import Image, ImageFilter

PUBLIC = Path(__file__).resolve().parents[1] / "public" / "mascot"
PLATES = Path(__file__).resolve().parents[1] / "mascot-plates"
RAW = PLATES / "raw"
GREEN = PLATES / "green-screen"
ROOT = PUBLIC  # keyed output destination

SHEETS: dict[str, tuple[int, int]] = {
    "toofie-sprite-sheet-actions.png": (4, 3),
    "toofie-sprite-sheet-moods.png": (4, 3),
    "toofie-sprite-sheet-app.png": (4, 3),
    "toofie-sprite-walk-cycle.png": (8, 1),
    "toofie-sprite-celebrate-cycle.png": (6, 1),
    "toofie-sprite-milestone-cycle.png": (8, 1),
    "toofie-sprite-log-cycle.png": (6, 1),
}


def dist(a: tuple[int, int, int], b: tuple[int, int, int]) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2])


def is_mint_like(c: tuple[int, int, int]) -> bool:
    r, g, b = c
    if g >= 195 and g >= r + 6 and g >= b + 3 and r >= 150 and b >= 150 and (g - r) <= 80:
        return True
    # Pure chroma green for future source plates
    if g >= 200 and r <= 80 and b <= 80:
        return True
    return False


def is_cream_like(c: tuple[int, int, int]) -> bool:
    r, g, b = c
    return (
        r >= 245
        and g >= 235
        and b >= 210
        and b <= 248
        and (r - b) >= 6
        and abs(r - g) <= 22
    )


def is_gray_frame(c: tuple[int, int, int]) -> bool:
    r, g, b = c
    mx, mn = max(c), min(c)
    return 185 <= mn and mx <= 248 and (mx - mn) <= 14


def is_protected(c: tuple[int, int, int]) -> bool:
    r, g, b = c
    if r > 170 and b > 100 and g < 160 and r > g + 15:
        return True  # hot-pink fanny / blossom
    if r < 90 and g < 90 and b < 90:
        return True  # ink outlines
    if r > 90 and g < 85 and b < 75 and r > g + 25:
        return True  # chocolate frosting
    mx, mn = max(c), min(c)
    if (mx - mn) >= 90 and mn < 160:
        return True  # vivid sprinkles
    return False


def key_sheet(path: Path, cols: int, rows: int) -> Image.Image:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    px = im.load()
    cw, ch = w // cols, h // rows

    seeds: list[tuple[int, int]] = []
    for r in range(rows):
        for c in range(cols):
            x0, y0 = c * cw, r * ch
            for dx, dy in (
                (4, 4),
                (cw - 5, 4),
                (4, ch - 5),
                (cw - 5, ch - 5),
                (cw // 2, 3),
                (3, ch // 2),
                (cw // 2, ch - 4),
                (cw - 4, ch // 2),
            ):
                x = min(w - 1, max(0, x0 + dx))
                y = min(h - 1, max(0, y0 + dy))
                seeds.append((x, y))
    step_x = max(1, w // 80)
    step_y = max(1, h // 80)
    for x in range(0, w, step_x):
        seeds += [(x, 1), (x, h - 2)]
    for y in range(0, h, step_y):
        seeds += [(1, y), (w - 2, y)]

    mask = [[0] * w for _ in range(h)]
    q: collections.deque[tuple[int, int, tuple[int, int, int], int]] = collections.deque()
    for x, y in seeds:
        c = px[x, y]
        if not (is_mint_like(c) or is_cream_like(c) or is_gray_frame(c)):
            continue
        thr = 26 if is_cream_like(c) else (34 if is_gray_frame(c) else 44)
        if mask[y][x]:
            continue
        mask[y][x] = 255
        q.append((x, y, c, thr))

    while q:
        x, y, seed, thr = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not mask[ny][nx]:
                nc = px[nx, ny]
                if is_protected(nc):
                    continue
                if dist(nc, seed) <= thr or (
                    (is_mint_like(nc) or is_cream_like(nc) or is_gray_frame(nc))
                    and dist(nc, seed) <= thr + 16
                ):
                    mask[ny][nx] = 255
                    q.append((nx, ny, seed, thr))

    # Residual grid lines / islands
    for y in range(h):
        for x in range(w):
            if mask[y][x]:
                continue
            c = px[x, y]
            if is_protected(c):
                continue
            if is_mint_like(c) or is_cream_like(c) or is_gray_frame(c):
                mask[y][x] = 255

    alpha = Image.new("L", (w, h))
    ap = alpha.load()
    for y in range(h):
        for x in range(w):
            ap[x, y] = 0 if mask[y][x] else 255

    alpha_soft = alpha.filter(ImageFilter.GaussianBlur(radius=0.7))
    out = Image.new("RGBA", (w, h))
    op = out.load()
    asp = alpha_soft.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            a = asp[x, y]
            if a < 28:
                op[x, y] = (0, 0, 0, 0)
            else:
                if a < 220 and (is_mint_like((r, g, b)) or is_cream_like((r, g, b))):
                    a = max(0, a - 80)
                op[x, y] = (r, g, b, a)
    return out


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    GREEN.mkdir(parents=True, exist_ok=True)

    for name, grid in SHEETS.items():
        live = ROOT / name
        raw = RAW / name
        if not raw.exists():
            if not live.exists():
                raise SystemExit(f"missing sheet: {name}")
            Image.open(live).save(raw)
            print(f"backed up {name}")

        out = key_sheet(raw, *grid)
        out.save(live)
        plate = Image.new("RGBA", out.size, (0, 255, 0, 255))
        Image.alpha_composite(plate, out).convert("RGB").save(GREEN / name)
        alpha = out.getchannel("A")
        hist = alpha.histogram()
        clear = sum(hist[:28])
        bg_pct = 100 * clear / (out.width * out.height)
        print(f"{name}: RGBA keyed · ~{bg_pct:.1f}% transparent · green-screen module written")


if __name__ == "__main__":
    main()
