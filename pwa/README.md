# Toofies PWA (frontend-only)

Mobile-first installable web app. **No backend** — all state stays in
`localStorage` on this device.

## Status

- **Stack:** Vite + React + TypeScript + vite-plugin-pwa
- **Economy:** ported from `toofies/src/lib` (same points/recency/streak engine)
- **Design:** provisional **OCHA soft-brutalist** direction (cream / matcha /
  blossom / Anton + Outfit). **D11–D15 are still OPEN** — this is a working
  prototype from the founder’s leading reference, not a ratified design system.
- **Out of scope here:** accounts, sync, social, HealthKit, push, paywall

## Run

```bash
cd pwa
npm install
npm run dev
```

Open the local URL on your phone (same network) or Chrome DevTools device mode.
Use “Add to Home Screen” / Install for the PWA shell.

```bash
npm run build
npm run preview
```

## Deploy (Netlify)

**Live demo:** https://toofies-demo.netlify.app  
Admin: https://app.netlify.com/projects/toofies-demo

Config is in the repo root `netlify.toml` (build base = `pwa`).

**Redeploy from CLI** (needs a Netlify personal access token — do not commit it):

```bash
cd pwa
npm ci && npm run build
NETLIFY_AUTH_TOKEN=… npx netlify-cli deploy --prod --dir=dist --message "Toofies PWA demo"
```

Or connect the GitHub repo in the Netlify UI (base directory `pwa` / use root `netlify.toml`).

## Screens

| Route | Purpose |
|---|---|
| `/onboarding` | Welcome flow (UI only) |
| `/auth` | Sign in / up mock (no backend) |
| `/` | Home — recency, streak, readiness, CTA |
| `/log` | Log a dessert + Toofie anim |
| `/move` | Steps / quest UI mock |
| `/buddies` | Buddy pair, dessert walks, duo quests |
| `/moments` | Social dessert feed UI mock |
| `/you` | Snapshot, settings links, history |
| `/profile` | Edit PFP, name, handle, bio, city (local) |
| `/recap` | Evening day check-in mock |
| `/widget` | Home Screen widget layout preview |
| `/privacy` | Privacy stub + delete local data |
| `/notifications` | Reminder prefs UI |
| `/resources` | ED / care resources |

## Notes

- Point values are **placeholders** (D7).
- Copy avoids cost/afford/spend food language where possible (behavioral safeguards).
- Desktop gets a phone-framed shell; mobile is full-bleed.
