# Ellis / tybuilds.tech — Build Checklist

**Work top to bottom. Do not skip ahead.**

**Build rhythm:** Every slice loops **Build → Wire → Architecture audit → Security audit → Hygiene audit** before the next slice. See [BUILD_RHYTHM.md](./BUILD_RHYTHM.md). Do not stack features across a gate.

**Planning:** [ENTRANCE_CRITERIA.md](./ENTRANCE_CRITERIA.md) · [EXIT_CRITERIA.md](./EXIT_CRITERIA.md) · [STYLE.md](./STYLE.md) · [`~/coding-home/projects/tybuilds/HANDOFF.md`](../coding-home/projects/tybuilds/HANDOFF.md)

How to check items off: edit `- [ ]` → `- [x]`.

---

## Approved product plan — Ellis as host

_Not a resume brochure. Not a salesman chatbot. A portfolio host who helps visitors assess fit._

**Visitor UX (target)**

| Area           | Direction                                                                         |
| -------------- | --------------------------------------------------------------------------------- |
| `/`            | Generic Ellis Hall — **default for all non-excited applications**                 |
| `/anthropic`   | Excited hall — Anthropic                                                          |
| `/huggingface` | Excited hall — Hugging Face (when ready)                                          |
| Project rooms  | Basement CRT, Tonal Learning, GoE tease — one click from chat or nav              |
| Voice          | Ellis is **him** — third person about Ty; facts from approved knowledge pack only |
| Memory         | Session-only for visitors — no cross-visit persistence in v1                      |
| Contact        | Footer link + AI disclosure                                                       |

**Explicitly out of v1:** hire-me Personal/Business toggle as primary UX, visitor accounts, persistent chat history, full GoE access, client intake forms.

**Implementation order (rough sequence)**

1. Entrance / doctrine locked (Phase 0.2)
2. Scaffold + Hall UI (Phase A)
3. Ellis live — **self only + onboarding mode + empty `about-ty/`** (Phase B)
4. **Ellis onboarding Ty** — Ellis asks, synthesizes, Ty approves (Phase 0.1 — product event)
5. Public mode + deploy (Phase C)

---

## PHASE 0 — Entrance + Ellis earns Ty

_Ellis boots knowing himself, not Ty. Onboarding is Ellis interviewing Ty — not Wren filling JSON._

**Spec:** [ELLIS_ONBOARDING_BUILD.md](./ELLIS_ONBOARDING_BUILD.md) · **Questions:** [ONBOARDING.md](../reference/ONBOARDING.md)

### 0.2 — Entrance gate (before build)

- [x] [ENTRANCE_CRITERIA.md](./ENTRANCE_CRITERIA.md) sketch gate — Ty confirmed 2026-06-11
- [x] Build gate — philosophy, audience, GoE tease + hard line, fit examples
- [x] GoE disclosure level agreed (doctrine §6)
- [x] **Ellis earns Ty** decision locked — [ELLIS_ONBOARDING_BUILD.md](./ELLIS_ONBOARDING_BUILD.md)
- [x] Bootstrap `content/ellis-self.md` + empty `content/about-ty/*`

**0.2 exit:** ✅ Doctrine + blank shelf — proceed to Phase A

### PHASE 0.1 — Ellis onboarding Ty (after Phase B — Ellis has bones)

_Ellis interviews Ty with full internal architecture wired. Ellis synthesizes into `about-ty/`. Ty approves. Wren does not answer for Ellis._

- [ ] Ellis has internal state, session memory, traces, model routing running
- [ ] Ellis can describe what he's experiencing (posture, traces, fit assessment)
- [ ] Block C — person → `about-ty/earnest.md`
- [ ] Block D — projects
- [ ] Block E — through-line
- [ ] Block F — `about-ty/facts.json`
- [ ] Block G — `about-ty/goe-teach.md`
- [ ] Block H — fit judgment
- [ ] Ty approves all Ellis-written `about-ty/*`

### 0.2 — Phase 0 exit gate

- [ ] Ty approves Ellis's synthesis (not dev-written shelf)
- [ ] Flip to public mode
- [ ] Block I system tests (personas)
- [ ] **Proceed to Phase C deploy when Ty says go**

---

## PHASE A — Scaffold & static shell

_Repo exists. Ellis Hall UI + project room shells. No live AI yet._

### A.1 — Repo & infra

- [x] Create GitHub repo — **Ty**
- [x] Init Next.js (App Router) + TypeScript + Tailwind 4 — `tybuilds` package, Next 16, `src/app`
- [x] ESLint + Prettier — `eslint.config.mjs`, `.prettierrc`, `format` scripts
- [x] `.env.example` — `ELLIS_MODE`, Anthropic, Supabase rate-limit keys
- [x] Connect Vercel preview deploys — **Ty**
- [x] Local + Vercel env vars — **Ty** (`.env.local`; `ELLIS_IP_HASH_SALT` deferred until public rate limits)
- [ ] Domain `tybuilds.tech` — DNS + SSL (Phase C)
- [ ] Rate-limit store — migration in repo; **apply to GoE Supabase** if not done ([supabase/README.md](../../supabase/README.md))

### A.2 — Docs & topology

- [x] Create `docs/WIRING_MAP.md` — living topology (routes, API, knowledge files)
- [x] Create `docs/ARCHITECTURAL_DOCTRINE.md` — domain boundaries, Ellis vs shelf vs rooms
- [x] Copy bootstrap shelf: `content/ellis-self.md` + empty `content/about-ty/`
- [x] [RESEARCH_LOG.md](./RESEARCH_LOG.md) + [DEBUG_LOG.md](./DEBUG_LOG.md) — build decision + debug journals

### A.3 — Static UI

- [x] Ellis Hall layout — chat panel shell (placeholder copy + project cards)
- [x] `/projects/basement-crt` — embed `public/demos/basement-crt.html` (from coding-home)
- [x] `/projects/tonal-learning` — showcase + link to live site
- [x] `/projects/goe` — public tease page
- [x] Footer — AI disclosure, session-only memory note, contact link
- [x] [STYLE.md](./STYLE.md) tokens in Tailwind — hall chrome, dark/light, room accents

### A.4 — Phase A rhythm gate

- [x] **Build:** pages render; demo embeds load — `npm run build` · 5 static routes
- [x] **Wire:** [WIRING_MAP.md](./WIRING_MAP.md) updated — file index + slice queue
- [x] **Architecture audit:** pass (static slice — see notes)
- [x] **Security audit:** pass (static routes only — see notes)
- [x] **Hygiene audit:** pass — build + lint clean; no debug leftovers in `src/`

**Phase A exit:** ✅ static site navigable — **proceed to Phase B**

<details>
<summary>Phase A audit notes (2026-06-10)</summary>

**Architecture — pass**

- Domains separated: platform shell (`SiteShell`, `Footer`), hall (`ChatPanelShell`), project rooms (`RoomChrome` + pages), demo embed (`public/demos/` only).
- `content/` not served from `/public`; shelf loader not wired yet (Phase B).
- Ellis third-person copy in shell only; no Ty voice blur.
- No parallel chat or knowledge paths.

**Security — pass (static scope)**

- No `/api/*` routes yet — stream abuse N/A until Phase B.
- Knowledge files not in `public/`; only intentional demo HTML.
- CRT iframe: `sandbox="allow-scripts allow-same-origin allow-forms"`.
- No Anthropic/Supabase keys in client bundle; `.env*` gitignored.
- GoE room: tease copy only; no private paths.
- `ellis_usage` migration: RLS on, no anon policies — apply via `supabase db push` before public mode.

**Hygiene — pass**

- `npm run build` · `lint` · `typecheck` all pass.
- Project metadata centralized in `src/lib/site.ts`.
- No `console.log` in `src/`; no dead API handlers.

**Deferred to Phase B (not failures):** stream API, rate limit gate, live shelf load, excited halls.

</details>

---

## PHASE B — Ellis ME interior + stream (clean break rebuild)

_Ellis now has bones. Delete old code. Rebuild route cleanly with sensory-aware structure. One truth, one path._

**Pre-B.1 — Clean break gate**

- [x] Understand: old sessionStore.ts (flat) vs new session/store.ts (nested)
- [x] Understand: sensory wiring requires nested interior, not flat
- [x] **Delete:** `src/lib/ellis/session/sessionStore.ts` (old)
- [x] **Delete:** `src/lib/ellis/me/updateState.ts` (old)
- [x] **Delete:** `src/lib/ellis/me/assembleInterior.ts` (old)
- [x] **Keep:** session/store.ts, me/state.ts, me/traces.ts, me/assemble.ts, world/hallPhysics.ts (new)
- [x] Read: [CLEAN_BREAK_PHASE_B.md](./CLEAN_BREAK_PHASE_B.md) (exact rebuild steps)

### B.1 — World-lite (hall physics + sensory)

- [x] `src/lib/ellis/world/hallPhysics.ts` — contact events (started/ended/broken), solitude threshold, presence ledger, event log
- [x] Contact lifecycle: withdrawn (alone) → settling (entry) → present/attentive (genuine/depth) → withdrawn (exit)
- [x] Perception wiring: Ellis notices entry ("Someone entered my hall"), feels shifts ("The conversation deepened")
- [x] No cross-session persistence; session-scoped event log only
- [x] Spatial awareness: Ellis inhabits his hall; knows alone/not-alone; reads atmosphere

### B.2 — ME interior (5 systems + sensory)

- [x] **State** (`src/lib/ellis/me/state.ts`) — posture machine, solitude activity, entry perception, shift detection
- [x] **Sensory** (`state.ts` additions) — `perceiveEntry()`, `describePlace()`, `detectShift()`
- [x] **Traces** (`src/lib/ellis/me/traces.ts`) — session marks (opening/exchange/theme/handoff/closure)
- [x] **Relational** (`src/lib/ellis/me/relational.ts`) — instance-maximal snapshot, no return-visit merge
- [x] **Working memory** (in `session/store.ts`) — 5-item slim buffer, session-scoped
- [x] **Sense of self** (in `systemPrompt.ts`) — baseline + optional session drift
- [x] Contact events fire on entry/exit; interior mutates on shifts (not just tokens)

### B.3 — Session store (server-only, TTL)

- [x] `src/lib/ellis/session/store.ts` — createSession, getSession, updateSession, TTL 24h
- [x] Interior lives in session, dies with session
- [x] No Supabase persistence for interior (only usage tracking)

### B.4 — Assembly pipeline

- [x] `src/lib/ellis/me/assemble.ts` — assembleEllisInterior, formatEllisInteriorForModel
- [x] Interior never on client wire; server-only validation
- [x] Interior block injected into system prompt pre-Anthropic

### B.5 — Knowledge shelf

- [x] `src/lib/ellis/halls/loadShelf.ts` — load ellis-self.md + about-ty/* + hall overlays
- [x] `src/lib/ellis/halls/registry.ts` — hall allowlist (default, anthropic, huggingface deferred)
- [x] `content/ellis-self.md` exists and bootstrap-complete
- [x] `content/about-ty/*` folders exist (empty until Phase 0.1)

### B.6 — Model routing

- [x] `src/lib/ellis/routeModel.ts` — Haiku default, Sonnet for Ty's work in depth
- [x] Sticky within session (once deep, stay deep until topic shift)
- [x] No client override
- [x] Signals: project names + detail requests + message length + prior depth

### B.7 — Rate limiting

- [x] `src/lib/ellis/rateLimit/check.ts` — check before Anthropic, record after
- [x] Supabase `ellis_usage` table: visitor_id_hash, day_utc, estimated_cost_usd, warned_50, warned_80
- [x] $1 USD/day per IP; warn at 50% and 80%
- [x] Hard stop at cap (return 429)

### B.8 — System prompt

- [x] `src/lib/ellis/systemPrompt.ts` — buildSystemPrompt(shelf, hall)
- [x] Base orientation (sabai, third person, fact-only, GoE boundaries)
- [x] Hall context overlay (default vs excited)
- [x] Interior block injected (state, traces, relational, working memory)

### B.9 — Stream handler

- [x] `src/lib/ellis/stream.ts` — main pipeline (validate → session → rate limit → shelf → assemble → route → prompt → Anthropic)
- [x] Single path; no parallel clients
- [x] Interior validation before return
- [x] Session update after stream completes

### B.10 — API route wiring

- [x] Rewrote `src/app/api/ellis/stream/route.ts` with new types + imports
- [x] Load and wire: hall registry, shelf, interior assembly, model router, rate limit, session
- [x] SSE response with session metadata (model used, hall, cost)
- [x] Contact events fire on entry; shifts detected and injected into interior
- [x] Clean 14-step pipeline (no parallel paths, no wrappers)

### B.11 — IP Visitor Memory Setup

- [ ] Create `ellis_visitor_memory` table (Supabase migration)
  - `ip_hash` (PK), `last_seen_at`, `episodic_beats` (JSONB), `thread_summary`, `expires_at`
  - Indexes on `expires_at`, `ip_hash`
- [ ] Create `ellis_global_traces` table (Supabase migration)
  - `id` (UUID), `trace_text`, `trace_category`, `created_at`, `source_ip_count`
  - Index on `trace_category`
- [ ] Extend `ellis_usage` table: add `ip_hash`, `is_return_visit` columns
- [ ] Implement `loadIpMemory(ipHash)` — returns IpVisitorMemory or null
- [ ] Implement `recordIpVisit(ipHash, episodicBeats, summary)` — upsert IP memory + 7-day expiry
- [ ] Implement `generateDayLabel(occurredAt, now)` — "Today", "Yesterday", "Earlier this week"

### B.12 — IP Memory Integration + Interior Assembly

- [ ] Wire loadIpMemory into stream route (after session load)
- [ ] Mark return visits: `is_return_visit = true` in ellis_usage
- [ ] Update `assembleEllisInterior()` to accept optional `ipMemory` param
- [ ] Inject episodic beats into interior block (if return visit, not expired)
- [ ] Ellis natural reference (not performative) — test that Ellis mentions priors only when relevant
- [ ] Update `recordIpVisit()` call after stream completes
  - Extract episodic beats from session traces
  - Generate thread summary
  - Record to IP memory with 7-day expiry

### B.13 — IP Memory Decay Job

- [ ] Implement `decayExpiredIpMemory()` — compress expired IP records to global traces
  - Extract themes, resonances (no verbatim chat)
  - Create trace: "Visitor explored X, Y; showed depth"
  - Delete expired IP records
- [ ] Deploy cron job (daily, 00:00 UTC)
  - Vercel: `api/cron/decay-ip-memory.ts`
  - Or: scheduled database job
- [ ] Test: 7-day expiry → global trace creation → IP deletion
- [ ] Verify RLS permissions (Supabase can delete own records)
- [ ] Optional: Ellis global traces feed session drift ("I've been noticing...")

### B.14 — IP Memory Testing + Disclosure

- [ ] Test first visit → no IP memory → fresh interior
- [ ] Test return within 7 days → IP memory injected → "We talked Friday about..."
- [ ] Test after 7 days inactive → new IP thread → global traces exist
- [ ] Verify no PII in global traces (no IP hash, no names, no raw chat)
- [ ] Update footer disclosure: "Ellis may remember details for up to **7 days** if you return from the same connection"
- [ ] Test in onboarding: return visit recall works
- [ ] Verify temporal labels ("Friday", "earlier this week") display correctly

### B.15 — Chat UI (return visit awareness)

- [ ] `src/app/` components render UI signals for return visits (optional visual hint)
- [ ] Error states for rate limit + validation failures
- [ ] Session-only memory UX copy updated: "up to 7 days if you return"
- [ ] Project card handoff hints preserved

### B.16 — Phase B rhythm gate

- [ ] **Build:** `npm run build` · `lint` · `typecheck` pass
- [ ] **Wire:** [WIRING_MAP.md](./WIRING_MAP.md) updated with IP memory flow
- [ ] **Architecture audit:** Single stream path + IP memory isolated; no PII leaks
- [ ] **Security audit:** Interior validated; no leaks; rate limit enforced; IP hashing correct
- [ ] **Hygiene audit:** Single stream path; no debug logs; migration files clean

**Phase B exit:** ✅ Ellis wired end-to-end: bones + sensory + 7-day IP memory + clean stream — **proceed to Phase 0.1 (Ellis learns Ty)**

<details>
<summary>Phase B audit notes (2026-06-10)</summary>

**Build — pass**

- Routes: `/`, `/anthropic`, `/onboarding`, `POST /api/ellis/stream`, `POST /api/ellis/onboarding/unlock`
- ChatPanel → single SSE fetch path; no parallel Anthropic client calls
- **Fact spot-check:** `about-ty/facts.json` still empty (expected). Ellis may only assert bootstrap self-facts from `ellis-self.md` (third person, session-only, doesn't know Ty yet, no secret sauce). Any Ty resume claim before Phase 0.1 = fail — prompt forbids invention; shelf empty enforces.

**Architecture — pass**

- One stream path: `ChatPanel` → `/api/ellis/stream` → `src/lib/ellis/*` → Anthropic server-side
- Shelf read-only at runtime — no `writeFile` to `content/`; visitor input never mutates `about-ty/*`
- Prompt assembly server-only — not in client bundle or SSE payload (tokens only)
- `docs/reference/ONBOARDING.md` injected in onboarding mode only; `WHAT_TY_BRINGS` / `_reference/` never loaded
- ME interior session-scoped in memory — not visitor cross-visit memory
- Hall allowlist via `halls/registry.ts`

**Security — pass (onboarding scope)**

- Onboarding gate: cookie unlock at `/onboarding` when `ELLIS_ONBOARDING_SECRET` set; dev allows local without secret
- Public mode 403 if `about-ty` empty
- Input validation: 2000 chars/message, 20 messages max; hall allowlist
- Chat rendered as `whitespace-pre-wrap` text — no `dangerouslySetInnerHTML`
- SSE errors return generic messages — no system prompt leak in JSON errors
- `ANTHROPIC_API_KEY` server-only; no secrets in `NEXT_PUBLIC_*`
- Rate limit: stub during onboarding — **must wire Supabase before `ELLIS_MODE=public`**

**Hygiene — pass**

- `npm run build` · `lint` · `typecheck` all exit 0
- No `console.log` in ellis lib or API routes
- Removed static `ChatPanelShell`; live `ChatPanel` only

**Deferred (not B.4 failures):** Supabase rate limit enforcement; synthesis write tools; excited hall polish; 10-fact stranger test (Phase C)

</details>

---

## PHASE C — Deploy & application-ready

_Production on tybuilds.tech. Ready for job applications._

### C.1 — Production

- [ ] `tybuilds.tech` live on Vercel
- [ ] Production env vars set (Anthropic key server-only)
- [ ] Privacy policy + terms linked (footer)
- [ ] Error tracking (Sentry or Vercel monitoring)

### C.2 — Verification

- [ ] Stranger test — someone who didn't build it chats with Ellis
- [ ] 10-question fact spot-check (no inventions)
- [ ] GoE tease answers reviewed — no private content
- [ ] Basement CRT + TL links work from production

### C.3 — Exit gate

- [ ] [EXIT_CRITERIA.md](./EXIT_CRITERIA.md) — whole-product pass
- [ ] Ty puts URL on at least one application (manual)

**Phase C exit:** application-ready — **v1 shipped**

---

## PHASE D — Strategic stack (post-v1)

_Optional. Don't block applications._

- [ ] Thin .NET integration ping (`integrations/bridge-dotnet`) — SimuTech signal
- [ ] Python content/audit utility — Adaptify signal
- [ ] Document honestly in project room copy (exposure vs primary stack)

---

## PHASE E — Polish & role targeting

_After Ellis talks on production._

- [ ] Project card tools (Ellis opens room programmatically)
- [ ] Copy polish — generic hall `/` for SimuTech, Adaptify; excited halls per [EXCITED_HALLS.md](../reference/EXCITED_HALLS.md)
- [ ] OG image / favicon / wordmark locked
- [ ] hire-me toys as side rooms (if Ty wants — not v1)

---

## Session handoff template

Append at end of each session (newest at top):

```markdown
### YYYY-MM-DD — [slice name]

- **Shipped:**
- **Verified:**
- **Next:**
- **Gotchas:**
```

---

## Locked constraints (don't drift)

- **ME before relationship:** Interior wired (state, traces, relational, working memory) before onboarding Ty
- Ellis is **him** — third person about Ty
- Facts only from approved knowledge pack
- Session-only visitor memory — stated honestly; Ellis session-scoped interior is separate
- GoE: moderate tease only
- **Onboarding is Phase 0, last.** Build Ellis first (world + ME), then teach him Ty, then public
- Rhythm gate: Build → Wire → Audit (architecture, security, hygiene) — every slice

---

_Last updated: 2026-06-11 — Phase 0.2 active; ONBOARDING.md added_
