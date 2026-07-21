# AGENTS.md

## Cursor Cloud specific instructions

This repo contains **two implementations of the same product (Toofies)**:

- **Native iOS app** at the repo root (`Toofies.xcodeproj`, `Toofies/`, Swift/SwiftUI/HealthKit). This is **macOS + Xcode only** and **cannot be built or run in the Linux cloud environment**. Do not attempt to build it here.
- **Expo / React Native app** under `toofies/` (TypeScript, Expo Router). This is the only runnable target in the cloud — run it via the **web** target.

The app is **fully on-device: no backend, no database, no accounts, no network, no secrets/env vars**. There is nothing server-side to stand up. Web persistence uses `AsyncStorage` (localStorage, key `toofies.v2`).

### Working with the Expo app (`toofies/`)

All commands run from `toofies/` (npm; `package-lock.json` is the lockfile):

- Run (dev): `npx expo start --web` (Metro bundler serves on `http://localhost:8081`). First browser request triggers the initial bundle (~10s). `npm run ios` / `npm run android` need simulators/emulators not available in the cloud.
- Lint: `npm run lint` (→ `expo lint`). Note: currently exits non-zero with **2 pre-existing lint errors** in `src/lib/store.tsx` and `src/hooks/use-color-scheme.web.ts` — these are not caused by setup.
- Tests: `node scripts/economy.test.mjs` (economy parity suite; it self-compiles `src/lib/{economy,treats}.ts` via `tsc`). It is **not** wired to `npm test` — invoke it directly.
- Typecheck: `npx tsc --noEmit` reports **pre-existing** errors for `*.module.css` / `global.css` side-effect imports (no CSS type declarations). The economy test avoids these via `--skipLibCheck` and by compiling only the two lib files.

The home screen (`src/app/index.tsx`) is intentionally unstyled scaffolding that proves the points economy; log a dessert via the chips to see state update.
