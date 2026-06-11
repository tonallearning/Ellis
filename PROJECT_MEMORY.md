## Project memory — Ellis / tybuilds.tech

### Now

- **Goal:** tybuilds.tech — Ellis portfolio host; job applications incoming (Anthropic Fellows = top priority)
- **Constraints:** 7-day IP memory; ~$1/day/IP budget (implicit); topic scope; no patches
- **Routes:** `/` generic · excited halls only per [EXCITED_HALLS.md](docs/reference/EXCITED_HALLS.md) (`/anthropic`, `/huggingface`, …)
- **Definition_of_done:** Ty puts URL on applications (`/anthropic` for Fellows); Ellis accurate; TL + CRT one click; GoE teased not leaked

### Read before every build (mandatory)

1. [docs/reference/WHAT_TY_BRINGS.md](docs/reference/WHAT_TY_BRINGS.md) — **what Ty brings (positioning + build guardrails)**
2. [docs/building/ELLIS_EXPERIENCE.md](docs/building/ELLIS_EXPERIENCE.md) — memory, budget, scope, Anthropic hook
3. [docs/building/BUILD_ETHOS.md](docs/building/BUILD_ETHOS.md) — **no patches; gut and build clean; dream-bot code**
4. [docs/building/STYLE.md](docs/building/STYLE.md) — Rodeo Dr / Apple bar; dark+light parity
5. [docs/building/BUILD_RHYTHM.md](docs/building/BUILD_RHYTHM.md) — slice loop

### Quickstart

- **Run:** `npm run dev` → http://localhost:3000
- **Test:** `npm run build` · `npm run lint` · `npm run typecheck`
- **Env:** copy `.env.example` → `.env.local`

### Decisions (dated)

- 2026-06-11: **Ellis earns Ty** — blank about-ty; Ellis asks/synthesizes; Wren doesn't fill shelf ([ELLIS_ONBOARDING_BUILD.md](docs/building/ELLIS_ONBOARDING_BUILD.md))
- 2026-06-11: **Build ethos locked** — no temp patches; gut wrong shape, rebuild clean ([BUILD_ETHOS.md](docs/building/BUILD_ETHOS.md))
- 2026-06-11: Style locked — luminous glass, equal dark/light, impressed-even-on-no ([STYLE.md](docs/building/STYLE.md))
- 2026-06-09: Ellis is him; third person; session-only memory; onboarding before code

### Architecture

- **Key_modules:** Ellis Hall chat, `/api/ellis/stream`, Ellis ME lite + hall physics, Haiku (Sonnet if Ty's work in depth), rate limits, knowledge shelf, project rooms
- **Build spec:** [docs/building/ELLIS_ME_BUILD.md](docs/building/ELLIS_ME_BUILD.md)
- **Data_flow:** See [docs/building/WIRING_MAP.md](docs/building/WIRING_MAP.md)

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

- Phase A scaffold → Phase B Ellis (self + onboarding mode + empty about-ty)
- **Phase 0.1:** Ty ↔ Ellis onboarding — Ellis asks from [ONBOARDING.md](docs/reference/ONBOARDING.md)
- Phase C after Ty approves Ellis's `about-ty/*`
