# Toofies — Session State / Handoff

**Updated:** 2026-07-21

Read this first in a new session, alongside `CLAUDE.md` and `.planning/`.

## Where the product stands (ratified)

- **D27 · Stack = Expo / React Native (TypeScript)** under `toofies/`. Cloud-runnable
  via `npx expo start --web`. Native SwiftUI at repo root is reference only
  (macOS/Xcode — cannot build in the Linux cloud).
- **D7–D9 · Points economy = opt-in experiment**, not the foundation. Ship a
  “just track recency, no points” mode. Behavioral safeguards are LOCKED
  (`PRODUCT.md`): no celebrating abstinence, no cost/afford/spend language, no
  score-drop-as-penalty, don’t frame steps as paying for dessert, ED-resource
  signposting. An ED-specialist review is a required gate before any earn/spend
  food mechanic ships (`ED-REVIEW-BRIEF.md`).
- **D4 · 🟢 RATIFIED 2026-07-15 — accounts + social in v1** (collects data for
  sharing, sync, analytics, marketing). This **supersedes** the 2026-07-13
  on-device / “Data Not Collected” posture. Spawns still-OPEN: **D30** backend,
  **D31** auth, **D32** moderation, **D33** minimum social v1 scope. Until those
  are decided, do **not** invent a backend.
- **D28 · Framer/PWA delivery 🔴 OPEN.** Rec (🟡): Framer/Mobbin/Dribbble for
  *design*; keep Expo/RN as the build target. Do not rebuild the app as a Framer
  PWA until the founder decides. A static HTML demo for walkthroughs is fine.
- Design (D11–D15) = still 🔴 OPEN. Draft onboarding at
  `prototype/onboarding/index.html` and moodboard refs = proposals, not decisions.

## Demo available now

- **`prototype/web/demo.html`** — interactive HTML demo for stakeholder
  walkthroughs. Defaults to **recency-only**; points economy behind an opt-in
  toggle; copy follows LOCKED safeguards; `+N days` controls for midnight
  banking; optional activity simulation; light PWA install
  (`manifest.webmanifest` + `sw.js`). Placeholder visuals only.
- Older weekly-budget prototype: `prototype/web/index.html` (pre-points-economy).
- Expo scaffold: `toofies/` (economy ported + tested; UI still unstyled scaffolding;
  still leads with economy copy — tracked reshape).

## Highest-value next steps that need the founder

1. Decide **D28** (keep Expo vs Framer-PWA path) and **D30–D33** (backend/auth/
   moderation/social-v1 scope) if accounts+social v1 stays.
2. Wave 0 interviews (`WAVE-0-INTERVIEW-KIT.md`).
3. ED specialist review (`ED-REVIEW-BRIEF.md`).
4. First real device pass (Expo Go on a phone, or Xcode for the archived SwiftUI).

## Tooling notes

GSD installed in-repo (`.claude/`). Cross-model code review via Codex is a
required gate but runs locally (no Codex in the cloud sandbox). See `AGENTS.md`
when present for Cursor Cloud run notes.
