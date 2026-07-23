# Toofies PWA · Shippability Audit — 2026-07-23

Scale: **10 = ready for public market launch** (paying strangers, app stores,
press). Scores are evidence-based from the live repo/deploy, not vibes.
Auditor: cloud agent, at founder request. Security emphasized per founder note.

## Shippability chart

| # | Area | Score /10 | Evidence | To reach 8+ |
|---|------|:---:|----------|-------------|
| 1 | **Security** | **6** | Attack surface is small (static PWA + Supabase-managed auth). Correct key pattern: only the publishable key ships client-side; secret never in repo/bundle. Email confirmation ON, signups rate-limited by Supabase's built-ins. **Hardened during this audit:** CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy; client-side schema validation on auth (email regex, 8–128 char password, length caps, trimmed metadata). | Rotate the Supabase secret + Netlify token (both transited chat). Add captcha on signup (Supabase supports Turnstile/hCaptcha). Define RLS policies before the first table ships. Add Sign in with Apple before App Store. |
| 2 | **Privacy & legal** | **3** | Accounts now collect real emails, but the privacy page is a UI stub; no ToS; no GDPR/CCPA basis documented; "delete my data" only clears local storage — the Supabase account survives. D4 consequences (policy, deletion, privacy label) are ratified-in-scope but unbuilt. | Real privacy policy + ToS; server-side account deletion endpoint; data-collection disclosure matching the new truth (email + display name). |
| 3 | **Core loop (log → recency → streak)** | **7** | Works end-to-end on-device, polished UI, forgiving streaks, guest mode. But point values are placeholders (D7–D9 open) and **zero real users have validated the loop (R5)**. | Ratify economy numbers or ship no-points mode as default; 5–10 real-user tests. |
| 4 | **Feature truthfulness** | **4** | Buddies pairing, Moments feed, nudges, and walk steps are **mocks** behind convincing UI. Map is Google Maps links. Fine for a demo; misleading for market. | Wire buddy pairing + cheers to Supabase (realtime), or clearly de-scope for v1. |
| 5 | **Data durability** | **4** | Everything lives in localStorage. Clearing the browser = total loss; accounts don't sync anything yet (D33 open). | Supabase sync of logs behind the existing account gate; export button. |
| 6 | **Engineering quality** | **5** | TS strict, oxlint, clean builds, componentized. **No automated tests, no CI, no error monitoring**, one 3,300-line CSS file. | Vitest on the economy math (`useToofies`) + auth flows; GitHub Actions; Sentry; split CSS. |
| 7 | **Design/brand** | **6** | Coherent provisional OCHA system, dark mode, reduced-motion support, aria labels. D11–D15 remain unratified; no a11y contrast audit. | Founder ratifies design tokens; run an axe/contrast pass. |
| 8 | **Distribution** | **3** | Free netlify.app subdomain currently **flagged by Google Safe Browsing** (real-auth-form-on-free-host signature). No custom domain. App-store path (D16–D18) unstarted; iOS PWA notifications unreliable. | Custom domain + Search Console review (founder action); decide PWA-vs-store for v1. |
| 9 | **ED-safety framing (locked)** | **8** | No calories/weight anywhere, forgiving streaks, honest logging never blocked, ED resources linked on auth. Snarky nudges still need ratify (R9). | Ratify snark copy under D18; one clinical-lens copy review. |
| | **Overall market readiness** | **4.5** | A strong, honest **beta demo** — not a market product yet. The gap is legal/privacy, data durability, feature truth, and distribution more than UI. | See sequence below. |

## Founder security notes — disposition (used what applies)

1. **Rate limiting on public endpoints** — the app exposes **no custom
   endpoints**; the only public surface is Supabase auth, which ships with
   IP/user rate limits and returns 429s. Becomes relevant the moment we add
   our own API/edge functions. *(N/A today, noted for D33 sync work.)*
2. **Strict input validation & sanitization** — **done (client-side)** this
   audit: schema-ish validation on auth (email format, password 8–128,
   length caps, trim + cap on display name). React escapes rendering (no
   `dangerouslySetInnerHTML` anywhere). Server-side validation is Supabase's.
3. **Secure API key handling** — the publishable key in the client is
   **correct by design** (it's made for browsers; authorization comes from
   RLS + auth). The secret key never ships. **Owed:** rotate the secret key
   and Netlify token since both transited chat; store in Cloud Agents secrets.

## Fixed during this audit (deployed + verified)

- CSP restricting scripts/styles/fonts/images/connections to self + Supabase + Google Fonts
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, Referrer-Policy, Permissions-Policy
- Auth input validation (format, length, caps) — sign-in E2E re-verified green

## Recommended sequence to 8/10 overall

1. **Trust floor (fast):** rotate both keys · captcha on signup · custom domain · Safe Browsing review
2. **Legal floor:** privacy policy + ToS + server-side account deletion
3. **Data floor:** sync logs to Supabase behind the account gate (RLS from day one)
4. **Truth floor:** wire buddies/cheers for real or visibly de-scope
5. **Confidence floor:** Vitest on economy math + CI + Sentry, then 5–10 real-user beta

*Risks register: R5 (zero user validation) remains the biggest non-technical
risk; a 10/10 build of an unvalidated loop is still a gamble.*
