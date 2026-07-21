# Toofies — Design Spec

**Status: NOTHING RATIFIED (D11–D15 still 🔴).** No colors, typography, layout,
or visual direction have been *signed off*. This file records open questions,
the process, and — as of 2026-07-21 — a **provisional** application in the
frontend-only `pwa/` so there is something to react to. The Expo/SwiftUI
scaffolds remain unstyled. Provisional ≠ decided.

## Ground rules

- Design decisions are the founder's to make. No visual choices get applied to
  the app without explicit sign-off.
- The locked *product* rules from `PRODUCT.md` still hold (playful never
  punitive, no calories/weight/diet language, forgiving) — those are framing,
  not aesthetics.

## 🟡 Founder's leading reference (2026-07-15) — an option, not a decision

The founder shared **https://ocha.framer.website/** ("OCHA — Brutalist Matcha
Bar") as *"the perfect illustration of how I think the brand should look."* Full
analysis: `design-library/ocha/teardown.md`. In short: **warm cream ground + black
ink + a bold condensed uppercase display face (Anton-style) + soft rounded cards +
a blossom-pink pop**, "soft brutalism," and a **witty, guilt-free, lifestyle
voice** (the strongest fit). **Honest caveat for the gate:** matcha *green* as the
primary reads tea/wellness — for a *dessert* app a warm dessert-led accent may need
to lead, with green as a secondary (open).

### Provisional apply (2026-07-21) — `pwa/` only

Founder directed a designed, mobile-first web PWA (frontend only). The `pwa/`
app now uses this candidate so the loop is reviewable:

| Token | Value |
|---|---|
| Paper | `#fefae7` |
| Ink | `#121212` |
| Matcha | `#03563e` |
| Blossom | `#ffbad8` |
| Lime accent | `#c6ff3a` (celebration only) |
| Display | Anton (uppercase) |
| Body | Outfit |
| Shell | Home / Log / You · phone-width · installable PWA |

**Still needs founder ratify** into D11–D15 before any claim that “the design is
set.” Reject / tweak freely — the PWA is the sketchpad.

## Open questions (to decide together)

1. **Overall vibe** — playful/candy? clean/minimal? something else?
2. **Color** — keep the current blue, or a warmer/dessert palette, or your own
   brand colors?
3. **Typography** — system default, system rounded, or a specific typeface?
4. **Mascot** — how literal is 🦷 "your sweet Toofies"? A character, or just a
   voice in the copy?
   **Options gallery (2026-07-21):** `.planning/design-library/mascot-options.html`
   (also live at https://toofies-demo.netlify.app/mascot-options.html) —
   A Classic · B Frosted · C Editorial · D Sweet Blob · E Pair · F Mark only.
   Still 🔴 until founder picks.
5. **Layout** — keep the scrolling card dashboard, or a different structure?

## Reference process (agreed: "both in parallel")

- **You:** pull reference flows from Mobbin on your Mac and share screenshots.
  Suggested apps to look at (onboarding, main screen, streak/celebration,
  widget): Finch, Duolingo, Streaks, Gentler Streak, Opal, Cal AI.
- **Me:** once you've shared references and picked a direction, I turn it into
  a concrete spec here and implement it — grounded in Apple's Human Interface
  Guidelines for the iOS specifics.

## Notes available on request (NOT applied)

I ran a design exploration earlier this session and can share what it produced
— a candidate warm/candy palette and type direction — **as options for you to
react to, not as anything chosen.** Say the word and I'll lay them out; until
then the app stays as-is.
