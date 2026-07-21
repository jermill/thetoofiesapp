# Toofies 🦷

A health/food iOS app for dessert lovers: don't give up desserts — **earn**
them. Every dessert-free day banks points; desserts cost points; the app
always knows how recently you last indulged.

## The points economy

- **Earn (clean days):** every completed dessert-free day banks **+10 pts**,
  credited at midnight.
- **Earn (activity):** connect Apple Health (read-only, opt-in) and every
  **1,500 steps earns +1 pt, up to +15/day** — credited even on dessert days.
  A walk always counts; a 21k-step theme-park day banks +14 on its own.
- **Earn (daily quest):** walk your quest goal — it adapts to your own recent
  week — and bank a **+5 pt bonus** at midnight.
- **Spend:** a dessert costs points (default **30 ≈ 3 clean days**, adjustable
  10–100 in settings). Points roll over — save up for special occasions.
- **Forgiving by design:** logging is never blocked and there's no debt. A
  dessert you can't afford spends the balance to zero, and earning resumes the
  next clean day. Honest logging always beats punishment.
- **Streak = days on plan:** clean days and fully-earned dessert days both
  count; only an over-budget dessert pauses it. 🦷 milestone celebrations at
  3, 7, 10, 14, 21, 30, 50… days.

## What's on screen

- **Treat check (hero)** — "Treat yourself! 🎉" when your balance covers a
  dessert, otherwise points-to-go with ≈ clean days and a live countdown to
  tonight's +10 credit.
- **Points meter** — progress toward the next dessert.
- **One-tap logging** — cookie, cake, ice cream, chocolate, donut, candy, pie,
  cupcake — with haptics.
- **Activity** — today's steps and the bonus banking at midnight (once Apple
  Health is connected).
- **Today's quest** — the adaptive step goal, progress bar, and +5 bonus
  state.
- **Stats** — points balance, last dessert (recency), days on plan.
- **Last-7-days chart** — desserts per day (Swift Charts); tap a bar to see
  what you ate.
- **Recent desserts** — the last 10, each with the points it cost.

All data stays on-device (`UserDefaults`). Light and dark mode supported.
No calories, no weight, no diet language — see `.planning/PRODUCT.md`.

## Requirements

- Xcode 16 or newer
- iOS 17.0+ deployment target

## Running it

1. Open `Toofies.xcodeproj` in Xcode.
2. Select the **Toofies** scheme and a simulator (or your device — set your
   development team under *Signing & Capabilities* first).
3. Run (⌘R).

The bundle identifier is `us.of-course.toofies`; change it if it collides with
your provisioning setup.

## Project layout

| Path | What's in it |
|---|---|
| `Toofies/ToofiesApp.swift` | App entry point |
| `Toofies/Models/` | `TreatStore` (points economy, recency, streaks, persistence) and data types |
| `Toofies/Views/` | One SwiftUI view per card: hero, points meter, quick-log, tiles, chart, history, settings |
| `Toofies/Theme.swift` | Palette (validated for light/dark), duration formatting, card container |
| `.planning/PRODUCT.md` | Product vision & framing rules |
| `.planning/research/` | Verified market/design research reports |
| `prototype/web/index.html` | The original weekly-budget web prototype (pre-points-economy; kept for reference) |
| `prototype/web/demo.html` | Interactive **points-economy** HTML demo (placeholder visuals; day-advance controls for walkthroughs) |

## How the balance works

`TreatStore.balance(now:)` derives the balance from full history: +10 for
every completed dessert-free day since install, plus step credits for every
completed day when Health is connected, minus each dessert's recorded price,
folded in time order with a floor of zero. Deleting an entry self-corrects —
the freed day earns its credit back automatically. Step totals are cached in
the snapshot and refreshed from HealthKit on launch/foreground, so the
balance is stable offline.

## Tooling

GSD Core is installed in-repo (`.claude/`) — plan/execute/verify via
`/gsd-*` commands. `.claude/settings.json` pins the ui-ux-pro-max,
the-council, and Anthropic skills plugin marketplaces; `.mcp.json` registers
the Playwright MCP server.
