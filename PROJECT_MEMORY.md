## Project memory — Ellis / tybuilds.tech

### Now

- **Phase:** B.2 → B.3 — **Phase B.3–B.12 implement** (legibility-first); docs framework locked
- **Just done (2026-06-12):** Ellis Testing & Legibility framework + Build Logs drawer spec + ecosystem roadmap (Ellis + TL + North Star)
- **Goal:** tybuilds.tech — Ellis portfolio host; job applications incoming (Anthropic Fellows = top priority)
- **Constraints:** Session-only visitor memory; ~$1/day/IP budget (hard stop); topic scope; no patches; ME first (before onboarding); **legibility-first build** (proof > narrative); **coherence over scatter** (Ellis + TL as parallel proof of behavioral architecture)
- **Routes:** `/` generic · `/anthropic` + Build Logs drawer (Ellis logs + TL logs + ecosystem roadmap) · excited halls per [EXCITED_HALLS.md](docs/reference/EXCITED_HALLS.md)
- **Definition_of_done:** Ty puts URL on applications (`/anthropic` for Fellows); Ellis auditable; TL visible in logs; Build Logs transparent; ecosystem visible (not secret mythology)

### Key insight (2026-06-12)

**Legibility is the build order now.** Ellis isn't going public until we have concrete traces, failed attempts logged, boundary tests passing, and real beta responses annotated. The Build Logs drawer on `/anthropic` becomes proof-of-work. Reviewers can see: decisions (why), friction (what broke), tests (how we know it works).

**Coherence over scatter.** Ellis proves behavioral architecture works at small scale. TL proves it works in a real domain. Sharing the drawer (Ellis logs + TL logs + ecosystem roadmap) shows they're not random projects—they're coordinated research on the same philosophy. Not mythology. Legible architecture.

### Read before every build (mandatory)

1. [docs/reference/WHAT_TY_BRINGS.md](docs/reference/WHAT_TY_BRINGS.md) — **what Ty brings (positioning + build guardrails)**
2. [docs/building/RESEARCH_LOG.md](docs/building/RESEARCH_LOG.md) — **decisions + why + system impact**
3. [docs/building/ELLIS_LEGIBILITY_TESTING.md](docs/building/ELLIS_LEGIBILITY_TESTING.md) — **testing framework + proof-of-work**
4. [docs/building/ELLIS_EXPERIENCE.md](docs/building/ELLIS_EXPERIENCE.md) — memory, budget, scope, Anthropic hook
5. [docs/building/BUILD_ETHOS.md](docs/building/BUILD_ETHOS.md) — **no patches; gut and build clean; dream-bot code**
6. [docs/building/STYLE.md](docs/building/STYLE.md) — Rodeo Dr / Apple bar; dark+light parity
7. [docs/building/BUILD_RHYTHM.md](docs/building/BUILD_RHYTHM.md) — slice loop

**Debug friction:** [docs/building/DEBUG_LOG.md](docs/building/DEBUG_LOG.md)  
**Build Logs drawer:** [docs/building/BUILD_LOGS_DRAWER_SPEC.md](docs/building/BUILD_LOGS_DRAWER_SPEC.md)

### Quickstart

- **Run:** `npm run dev` → http://localhost:3000
- **Test:** `npm run build` · `npm run lint` · `npm run typecheck`
- **Env:** `.env.local` + Vercel — situated ✅ (`ELLIS_MODE=onboarding`)

### Decisions (dated)

- 2026-06-12: **Legibility-first build order** — Ellis Testing & Legibility framework created; Build Logs drawer spec locked; proof before narrative
- 2026-06-12: **Build Logs drawer on /anthropic only** — Non-invasive access to RESEARCH_LOG, DEBUG_LOG, test framework, anonymized traces, beta responses
- 2026-06-11: **Full ME imported** — GoE architecture templates adapted; Ellis-lite 5-system subset; 1686 lines TS; Phase B gates clear
- 2026-06-11: **Build order reversed** — ME first (Phase B), then onboarding (Phase 0.1 last). Ellis needs bones before learning Ty.
- 2026-06-11: **Interior session-scoped** — posture + traces + relational + working memory live in session; die when session expires (no cross-visit)
- 2026-06-10: **Phase B exit** — B.4 audits pass; Ellis streams in onboarding mode
- 2026-06-10: **Phase A exit** — static shell audited (A.4 pass); proceed Phase B
- 2026-06-10: **Infra ready** — GitHub, Vercel, local + Vercel env; GoE Supabase keys for `ellis_usage`
- 2026-06-10: **Supabase on GoE project** — `ellis_usage` only; migration in `supabase/`; service role server-only
- 2026-06-11: **Ellis earns Ty** — blank about-ty; Ellis asks/synthesizes; Wren doesn't fill shelf ([ELLIS_ONBOARDING_BUILD.md](docs/building/ELLIS_ONBOARDING_BUILD.md))
- 2026-06-11: **Build ethos locked** — no temp patches; gut wrong shape, rebuild clean ([BUILD_ETHOS.md](docs/building/BUILD_ETHOS.md))
- 2026-06-11: Style locked — luminous glass, equal dark/light, impressed-even-on-no ([STYLE.md](docs/building/STYLE.md))
- 2026-06-09: Ellis is him; third person; session-only memory; onboarding before code

### Architecture

- **Ellis interior:** 5 systems (state, traces, relational, working memory, sense of self) — session-scoped, no cross-visit
- **World-lite:** Contact events, solitude default, posture derivation — no persistent gardens
- **Knowledge shelf:** `ellis-self.md` (bootstrap) + `about-ty/*` (Ellis-written, Ty-approved, Phase 0.1) + `halls/{slug}.md` (excited overlays)
- **Model routing:** Haiku default; Sonnet if Ty's work in depth (sticky within session)
- **Rate limit:** $1/day per IP; hard stop at cap; warns at 50%, 80%
- **Build spec:** [docs/building/ELLIS_ME_FULL.md](docs/building/ELLIS_ME_FULL.md) (complete reference)
- **Wiring:** [docs/building/WIRING_MAP_ME.md](docs/building/WIRING_MAP_ME.md) (data flow + examples)
- **Route integration:** [docs/building/ROUTE_WIRING_CHECKLIST.md](docs/building/ROUTE_WIRING_CHECKLIST.md) (step-by-step)

### Reference (not runtime)

- [docs/reference/WHAT_TY_BRINGS.md](docs/reference/WHAT_TY_BRINGS.md) — canonical what Ty brings
- [docs/reference/ONBOARDING.md](docs/reference/ONBOARDING.md) — **question script Blocks A–I**
- [docs/reference/ONBOARDING_CAPTURE.md](docs/reference/ONBOARDING_CAPTURE.md) — Ty voice capture
- [docs/reference/ANTHROPIC.md](docs/reference/ANTHROPIC.md) — Anthropic Fellows deep dive
- [docs/reference/APPLICATIONS.md](docs/reference/APPLICATIONS.md) — job hunt notes
- [docs/reference/tonal-learning-research-manifesto.md](docs/reference/tonal-learning-research-manifesto.md) — TL SLA research

### Gotchas

- Built In misreports Anthropic Fellows pay as "2K–4K annually" — stipend is ~$3,850/**week**
- Manifesto needs severe edit pass before application submit
- Fellows: 4 months full-time = household gate before apply

### Open questions

- Site wordmark (`tybuilds` vs `Ellis Hall`)
- Onboarding session → `ty-earnest.md` + `ty-facts.json`

### Next actions

- **Phase 0.1:** Ty ↔ Ellis at `/` — unlock at `/onboarding` if `ELLIS_ONBOARDING_SECRET` set
- Ellis asks from [ONBOARDING.md](docs/reference/ONBOARDING.md); synthesizes `about-ty/*`; Ty approves
- Phase B.4 rhythm gate when ready; wire rate limits before `ELLIS_MODE=public`
