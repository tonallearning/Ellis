# Ellis — Research Log

**Purpose:** Chronological record of **decisions**, **why**, and **system/design impact** while building tybuilds.tech. Not chat-only — if it changes shape, it gets a row here.

**Companion:** [DEBUG_LOG.md](./DEBUG_LOG.md) — incidents, verifications, env/deploy friction (symptom → fix).

**Relationship to other docs**

| Doc | Role |
| --- | --- |
| This log | Full decision journal with impact |
| [ARCHITECTURAL_DOCTRINE.md](./ARCHITECTURAL_DOCTRINE.md) §10 | Locked doctrine summary — link here, don’t duplicate rationale |
| [PROJECT_MEMORY.md](../../PROJECT_MEMORY.md) | Current state + pointers — not history |
| [WIRING_MAP.md](./WIRING_MAP.md) | Topology after each **Wire** step |

**When to append**

- End of **Wire** (BUILD_RHYTHM): any decision forced by the slice
- Entrance / product gates Ty confirms
- Infra or stack choices (Supabase host, env, deploy)
- Anything that would change audit answers or visitor behavior if reversed

**Entry format** (newest at top)

```markdown
### YYYY-MM-DD — Short title

- **Decision:**
- **Why:**
- **System / design impact:**
- **Artifacts:** paths, env vars, routes
- **Phase / slice:**
- **Docs updated:**
- **Open follow-ups:** (optional)
```

---

## Log

### 2026-08-19 — Ship 7-day recall honestly; repair the spend ceiling

- **Decision:** Keep the 7-day rolling visitor recall and change the public copy to match it, rather than pulling the feature to preserve the session-only promise. Rate limit fails **closed**.
- **Why:** Every visitor-facing surface claimed session-only memory while the server hashed IPs and stored seven days of episodic beats. A false privacy claim is worse than a stronger memory claim, and this site's argument is presence honesty. Separately, the spend gate had never functioned: `checkRateLimit` queried `visitor_id_hash` (not a column on `ellis_usage`), so it errored and fell through to fail-open, and `recordUsage` inserted three nonexistent columns, so spend was never recorded. There was no ceiling.
- **System / design impact:** Rate limit now keys on `ip_hash` (matching the table and `markReturnVisit`) instead of an IP+UA hash, so changing user agent no longer resets budget. Spend is charged **before** the model call using a conservative estimate that prices the full `max_tokens` allowance. Ledger unreachable → request denied, except in non-production without Supabase configured. Stream route now reads model IDs and budget from `getEllisConfig()` instead of hardcoding `claude-3-5-*`.
- **Artifacts:** `supabase/migrations/20260819000000_ellis_usage_increment.sql` (atomic upsert RPC), `src/lib/ellis/rateLimit/check.ts` (rewritten, adds `estimateCostUsd`), `src/app/api/ellis/stream/route.ts`, `src/app/api/cron/decay-ip-memory/route.ts` (was never a valid App Router path, so decay never ran), `vercel.json` (daily 00:00 UTC cron), `CRON_SECRET` env var. Copy: `Footer.tsx`, `ChatPanel.tsx`, `AnthropicHall.tsx`, `content/ellis-self.md`, `systemPrompt.ts`, `README.md`.
- **Phase / slice:** Phase B.12 honesty pass
- **Docs updated:** README status, this log
- **Open follow-ups:** `about-ty/*` shelf still empty — Ellis does not know Ty. Owner tier (Ty exempt from decay) not built. `loadGlobalTraces` still write-only. Onboarding does not write to the shelf.

---

### 2026-06-11 — `/anthropic` Think · Build · Log (excited hall v1)

- **Decision:** `/anthropic` ships three tabs — **Think** (Ellis chat + Claude-inspired overlay toggle), **Build** (project cards), **Log** (live research + debug logs for tybuilds and GoE snapshots).
- **Why:** Fellows URL must demonstrate think/build/log in one visit — not just chat cosplay.
- **System / design impact:** `src/app/anthropic/page.tsx`; build logs read from `docs/building/` at request time; GoE logs synced to `docs/building/goe/` for deploy; overlay `localStorage`; stream `hall=anthropic` + `content/halls/anthropic.md`.
- **Artifacts:** `AnthropicHall.tsx`, `BuildLogPanel.tsx`, `content/halls/anthropic-opening.md`
- **Phase / slice:** Excited hall / Phase B+
- **Docs updated:** EXCITED_HALLS, WIRING_MAP

---

### 2026-06-10 — Phase B exit (B.4 rhythm gate)

- **Decision:** Phase B complete — Ellis streams in onboarding mode; Phase 0.1 unlocked.
- **Why:** Build/lint/typecheck pass; architecture/security/hygiene audits pass for onboarding scope.
- **System / design impact:** Single SSE path; shelf read-only; rate limits deferred until public flip.
- **Phase / slice:** B.4
- **Docs updated:** BUILD_CHECKLIST, DEBUG_LOG
- **Open follow-ups:** Phase 0.1 Ty ↔ Ellis sessions; Supabase rate limit before public

---

- **Decision:** Single SSE path `POST /api/ellis/stream`; shelf loader; onboarding gate via `/onboarding` + httpOnly cookie; synthesis still manual (Ellis outputs in chat, Ty approves before git writes).
- **Why:** Phase B exit = Ellis can talk to Ty; visitors blocked until unlock; no `_reference/` cheat sheet in prompt.
- **System / design impact:** `src/lib/ellis/*` module; ChatPanel client; Haiku/Sonnet router; session ME lite in memory; public mode 403 if `about-ty` empty; rate limit stub until public flip.
- **Artifacts:** `src/app/api/ellis/stream/route.ts`, `src/components/ellis/ChatPanel.tsx`, `@anthropic-ai/sdk`
- **Phase / slice:** B.1–B.3
- **Docs updated:** WIRING_MAP, BUILD_CHECKLIST
- **Open follow-ups:** Set `ELLIS_ONBOARDING_SECRET` in Vercel; B.4 rhythm gate; wire Supabase rate limit before `public`

---

- **Decision:** Phase A complete — static shell shippable; proceed Phase B (stream + onboarding mode).
- **Why:** Build/lint/typecheck pass; architecture/security/hygiene audits pass for static scope; no API yet is expected.
- **System / design impact:** Visitor can navigate Hall + three project rooms + CRT embed; chat remains placeholder until B.2/B.3.
- **Artifacts:** `src/app/*`, `src/components/*`, `public/demos/basement-crt.html`, `docs/building/WIRING_MAP.md`
- **Phase / slice:** A.4
- **Docs updated:** BUILD_CHECKLIST, WIRING_MAP, PROJECT_MEMORY

---

### 2026-06-10 — Supabase on GoE project (`ellis_usage` only)

- **Decision:** Rate-limit table lives on existing GoE Supabase project (`oubavruicijhxiqrlikr`); no new free Supabase project.
- **Why:** Supabase free tier project cap; Ellis only needs one counter table, not a separate DB.
- **System / design impact:** tybuilds server uses GoE `SUPABASE_SERVICE_ROLE_KEY` but **must only** read/write `ellis_usage`. RLS on, no anon policies. Ellis app never queries GoE ME/workshop tables.
- **Artifacts:** `supabase/migrations/20260610000000_ellis_usage.sql`, `supabase/config.toml`, `supabase/README.md`
- **Phase / slice:** A.1 infra
- **Docs updated:** WIRING_MAP, .env.example, BUILD_CHECKLIST
- **Open follow-ups:** Run `supabase db push` against GoE if not applied yet; rate-limit code in Phase B public mode

---

### 2026-06-10 — Defer `ELLIS_IP_HASH_SALT` until public rate limits

- **Decision:** IP hash salt env var documented but not required during `ELLIS_MODE=onboarding`.
- **Why:** Salt only needed when persisting hashed IPs to `ellis_usage`; Ty-only onboarding has no public rate limit path yet.
- **System / design impact:** Phase B onboarding can ship without salt; required before `ELLIS_MODE=public` when rate limit module writes `ip_hash`.
- **Artifacts:** `.env.example` (commented)
- **Phase / slice:** A.1 / B planning
- **Open follow-ups:** `openssl rand -base64 32` → Vercel + local before public flip

---

### 2026-06-10 — Infra: GitHub, Vercel, env situated

- **Decision:** Repo on GitHub; Vercel preview/prod linked; `.env.local` + Vercel env mirror; `NEXT_PUBLIC_SITE_URL=https://tybuilds.tech`.
- **Why:** Deploy path before Phase B; Anthropic + GoE Supabase keys ready for stream work.
- **System / design impact:** Preview URLs work; build reads `.env.local`; production secrets not in git.
- **Phase / slice:** A.1
- **Docs updated:** BUILD_CHECKLIST, PROJECT_MEMORY

---

### 2026-06-10 — Phase A static UI (STYLE tokens + rooms)

- **Decision:** Luminous glass hall shell; dark/light parity; project rooms with room accents; CRT via sandboxed iframe from `public/demos/`.
- **Why:** [STYLE.md](./STYLE.md) locked — conversation not brochure; hall neutral-luxury, rooms own accent; CRT retro stays inside room.
- **System / design impact:** `/` = ChatPanelShell (static); `/projects/*` = RoomChrome; theme via `data-theme` + localStorage; footer always discloses AI + session-only memory.
- **Artifacts:** `src/app/globals.css`, `src/components/layout/*`, `src/components/hall/*`, `src/lib/site.ts`
- **Phase / slice:** A.3

---

### 2026-06-10 — Phase A scaffold (`tybuilds` package)

- **Decision:** Next.js 16 App Router, React 19, Tailwind 4, `src/app`, Turbopack dev, package name `tybuilds`.
- **Why:** Matches handoff stack; `Ellis` directory name invalid for npm package on `create-next-app .`.
- **System / design impact:** Standard Next deploy on Vercel; `@/*` path alias; ESLint 9 flat config + Prettier.
- **Artifacts:** `package.json`, `eslint.config.mjs`, `.prettierrc`
- **Phase / slice:** A.1

---

### 2026-06-11 — Ellis earns Ty (blank shelf at boot)

- **Decision:** At boot Ellis loads `content/ellis-self.md` only; `content/about-ty/*` empty until Ellis interviews Ty and Ty approves synthesis. Wren/dev does not pre-fill Ty knowledge.
- **Why:** Host must not invent resume; onboarding is a product event; `docs/reference/*` is Ty QA only — never prompt-injected.
- **System / design impact:** Phase B onboarding mode; synthesis path writes `about-ty/`; public mode blocked until Ty approves. Stream prompt assembly excludes `docs/reference/`.
- **Artifacts:** `content/about-ty/*`, [ELLIS_ONBOARDING_BUILD.md](./ELLIS_ONBOARDING_BUILD.md)
- **Phase / slice:** 0.2 entrance
- **Docs updated:** ARCHITECTURAL_DOCTRINE, BUILD_CHECKLIST

---

### 2026-06-11 — Excited halls registry (generic default)

- **Decision:** `/` = generic hall for all non-excited applications; `/anthropic`, `/huggingface`, … only when on [EXCITED_HALLS.md](../reference/EXCITED_HALLS.md) registry.
- **Why:** Most resume URLs stay company-neutral; enthusiasm is rare and earned per company.
- **System / design impact:** Route-scoped hall overlay (`content/halls/{slug}.md`); allowlist in stream API `hall` param (Phase B).
- **Phase / slice:** Product / ME build
- **Docs updated:** EXCITED_HALLS, APPLICATIONS, WIRING_MAP

---

### 2026-06-11 — Ellis ME-lite + experience constraints

- **Decision:** Session-scoped interior + hall physics lite; 7-day IP visitor memory (Phase B+); ~$1/day/IP budget with Ellis warnings at 50%/80%; topic scope = Ty's work only; Haiku default, Sonnet when Ty's work in depth.
- **Why:** GoE-res witness without cross-visit lie; bill protection; honest scope; cost control.
- **System / design impact:** `src/lib/ellis/me/*`, `rateLimit/*`, `session/*` (Phase B); `ellis_usage` + future visitor memory tables on GoE DB; model router server-side.
- **Artifacts:** [ELLIS_ME_BUILD.md](./ELLIS_ME_BUILD.md), [ELLIS_EXPERIENCE.md](./ELLIS_EXPERIENCE.md)
- **Phase / slice:** Planning → B

---

### 2026-06-11 — Style + product bar locked

- **Decision:** Luminous glass, Rodeo-register luxury, equal dark/light, impressed-even-on-no; single hall (no Personal/Business toggle); typographic Ellis before avatar art.
- **Why:** Ty entrance session; Apple / STYLE_MASTER bar.
- **System / design impact:** CSS semantic tokens; no global CRT noise; project cards in chat flow not hero grid.
- **Docs updated:** STYLE.md, ENTRANCE_CRITERIA

---

### 2026-06-11 — GoE disclosure + philosophy

- **Decision:** Moderate tease sentence locked; no secret sauce / step-by-step build recipes; philosophy = Ty builds inhabited systems, Ellis is front door; Auntie of AI framing optional after onboarding.
- **Why:** Public witness without leaking private GoE; honest fit including no.
- **System / design impact:** `/projects/goe` tease page; system prompt hard line; Ellis refuses depth beyond approved shelf.
- **Docs updated:** ARCHITECTURAL_DOCTRINE §0, §6

---

### 2026-06-09 — Host model + stack honesty

- **Decision:** Ellis third-person host; session-only visitor memory (v1); Supabase for rate limits only; build rhythm gates (arch/security/hygiene per slice).
- **Why:** hire-me §9; no fake continuity; stack honesty.
- **System / design impact:** Footer disclosure; no visitor auth; ME state TTL not cross-visit merge.
- **Docs updated:** ENTRANCE_CRITERIA, BUILD_RHYTHM, SECURITY_CHECKLIST

---

## Open questions (research backlog)

| Question | Blocks | Owner |
| --- | --- | --- |
| Site wordmark — `tybuilds` vs `Ellis Hall` | Polish / OG | Ty |
| Contact email final | Footer mailto | Ty |
| `ellis_usage` migration applied on GoE? | Public rate limits | Ty / Wren |
| Illustrated Ellis avatar | Deferred | Ty |

---

## Superseded

| Date | Was | Superseded by |
| --- | --- | --- |
| 2026-06-09 | Wren pre-fills `ty-earnest` before scaffold | **Ellis earns Ty** (2026-06-11) |
| 2026-06-09 | Dedicated Supabase project for Ellis | **GoE project `ellis_usage`** (2026-06-10) |

---

*Append at top of **Log** section. Doctrine §10 stays summary-only — detail lives here.*
