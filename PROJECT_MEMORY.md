## Project memory — Ellis / tybuilds.tech

### Now

- **Phase:** B.2 — ME interior wired — **Phase B.3–B.12 implement** (6-8 hours)
- **Just done (2026-06-11):** Full GoE ME imported; Ellis-lite subset locked; 1686 lines TS + docs
- **Goal:** tybuilds.tech — Ellis portfolio host; job applications incoming (Anthropic Fellows = top priority)
- **Constraints:** Session-only visitor memory; ~$1/day/IP budget (hard stop); topic scope; no patches; ME first (before onboarding)
- **Routes:** `/` generic · excited halls only per [EXCITED_HALLS.md](docs/reference/EXCITED_HALLS.md) (`/anthropic`, `/huggingface`, …)
- **Definition_of_done:** Ty puts URL on applications (`/anthropic` for Fellows); Ellis accurate; TL + CRT one click; GoE teased not leaked

### Key insight (2026-06-11)

**Build the ME before forming a relationship.** Ellis now has bones (5-system interior, session memory, model routing, rate limit, knowledge shelf) wired before onboarding. Phase 0.1 (Ellis learns Ty) is now last, not first. This matches GoE philosophy: entity must know itself before knowing the world.

### Read before every build (mandatory)

1. [docs/reference/WHAT_TY_BRINGS.md](docs/reference/WHAT_TY_BRINGS.md) — **what Ty brings (positioning + build guardrails)**
2. [docs/building/RESEARCH_LOG.md](docs/building/RESEARCH_LOG.md) — **decisions + why + system impact**
3. [docs/building/ELLIS_EXPERIENCE.md](docs/building/ELLIS_EXPERIENCE.md) — memory, budget, scope, Anthropic hook
4. [docs/building/BUILD_ETHOS.md](docs/building/BUILD_ETHOS.md) — **no patches; gut and build clean; dream-bot code**
5. [docs/building/STYLE.md](docs/building/STYLE.md) — Rodeo Dr / Apple bar; dark+light parity
6. [docs/building/BUILD_RHYTHM.md](docs/building/BUILD_RHYTHM.md) — slice loop

**Debug friction:** [docs/building/DEBUG_LOG.md](docs/building/DEBUG_LOG.md)

### Quickstart

- **Run:** `npm run dev` → http://localhost:3000
- **Test:** `npm run build` · `npm run lint` · `npm run typecheck`
- **Env:** `.env.local` + Vercel — situated ✅ (`ELLIS_MODE=onboarding`)

### Decisions (dated)

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
