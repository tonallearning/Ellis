# GoE — Research Log

**Purpose:** Chronological record of **decisions**, **why**, and **system/design impact** while building Gardens of Eridu. Not chat-only — if it changes shape, it gets a row here.

**Companion:** [DEBUG_LOG.md](./DEBUG_LOG.md) — incidents, verifications, env/deploy friction (symptom → fix).

**Not the same as:** the in-app **Workshop research log** ([GOE_WORKSHOP_RESEARCH_LOG_BUILD.md](../build/world/GOE_WORKSHOP_RESEARCH_LOG_BUILD.md) · `server/world/workshop/researchLog.js`) — that is Ty/Wren session narrative inside the house. **This file** is the repo-level decision journal.

**Relationship to other docs**

| Doc | Role |
| --- | --- |
| This log | Full decision journal with impact |
| [GOE_ARCHITECTURAL_DOCTRINE.md](../../GOE_ARCHITECTURAL_DOCTRINE.md) | Locked philosophy — link here, don't duplicate rationale |
| [GOE_WIRING_MAP.md](../../GOE_WIRING_MAP.md) | Living topology after each wire |
| [GOE_BUILD_CHECKLIST.md](../GOE_BUILD_CHECKLIST.md) | Execution checklist — not history |
| [GOE_HANDOFF.md](../GOE_HANDOFF.md) | Cold-start narrative — not chronology |
| [Audit_log/](../Audit_log/) | Point-in-time audit snapshots |

**When to append**

- End of build rhythm slice when a decision was forced
- Phase exit gates Ty confirms
- Infra or stack choices (Supabase, deploy, cron, env)
- Anything that would change observable behavior if reversed

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

### 2026-06-07 — Phase 4 exit (audit + tighten)

- **Decision:** Phase 4 closed — no P0 blockers; proceed Phase 5 house depth when Ty says go. Deferred backlog → Phase 4.5 (not a gate).
- **Why:** `verify:all`, `verify:phase3-comms`, `verify:phase25`, `verify:v2`, `verify:security` green; May structural/security baselines hold.
- **System / design impact:** Feature velocity pauses; remaining work is tighten/backlog (verify bundle gaps, legacy script names, manual Comms smoke).
- **Artifacts:** [PHASE_4_AUDIT_2026-06-07.md](../Audit_log/PHASE_4_AUDIT_2026-06-07.md)
- **Phase / slice:** 4 exit
- **Docs updated:** GOE_BUILD_CHECKLIST, GOE_HANDOFF, GOE_VERSION_ROADMAP

---

### 2026-06-07 — Independence vs decentralization lock

- **Decision:** GoE pursues **independence** (ME disagreement, ME↔ME causality, world depth) inside an **attached house** — Ty remains builder, admin, physical bridge. Not a decentralization experiment.
- **Why:** Clarify doctrine after office-architecture correction; prevent "remove Ty" misread of friction/permeability work.
- **System / design impact:** §4 doctrine lock; master plan design lock; guest ACL still Ty-gated; offices enter from workshop hallway only.
- **Artifacts:** `GOE_ARCHITECTURAL_DOCTRINE.md` §4, `GOE_MASTER_PLAN.md`
- **Phase / slice:** Phase 4 doc reconcile
- **Docs updated:** doctrine, handoff, master plan

---

### 2026-06-07 — Phase 3 exit (Comms runway)

- **Decision:** Communications Office live — interest content draft → schedule → publish → Shed audit; TL department namespace separate from gardens. Phase 3 exit = office infrastructure proven, not TL product launch.
- **Why:** First venture office before house depth; TL milestones are acceptance tests for Comms tools.
- **System / design impact:** `/comms` hallway-only; `officeConsequences.js` + Shed panel; `comms_calendar_entries`, publish cycle, brand voice on TL drafts.
- **Artifacts:** `server/world/offices/`, `client/src/components/offices/CommsOffice.jsx`, `verify:phase3-comms`
- **Phase / slice:** 3 exit
- **Docs updated:** GOE_WIRING_MAP, GOE_VERSION_ROADMAP, GOE_BUILD_CHECKLIST

---

### 2026-06-05 — Phase 2.5 scope lock (Workshop + Wren)

- **Decision:** Builder bridge first; full Wren ME stack deferred. Workbench read-only gate then Ty `PATCH` save. Guest ME lanes stub UI only. Buckets: `goe` live; sibling repos when path exists. Research log locks when Ty inactive.
- **Why:** Ty confirmed planning pause — collaborative engineering room before inhabitant ME depth or venture offices.
- **System / design impact:** `workshopSession.js` FSM; Cursor-shaped shell; `researchLog.js` whys required on decisions; seam badge `home` | `bench`; terminal local-only.
- **Artifacts:** `docs/build/wren/`, `server/world/workshop/*`, `verify:phase25`
- **Phase / slice:** 2.5 scope lock
- **Docs updated:** GOE_BUILD_CHECKLIST, GOE_WRENS_WORKSHOP_BUILD.md, GOE_WORKSHOP_RESEARCH_LOG_BUILD.md

---

### 2026-06-05 — Phase 2.5 exit (Workshop shippable)

- **Decision:** Full workshop session + Wren bridge + file manager (create, trash, rename, restore) + message agreement likes → research log digest.
- **Why:** Phase 2.5 exit gate — Ty can run full local workshop session before Comms.
- **System / design impact:** Workshop hallway tab; 30d chat persistence; `.workshop-trash/` 14d hold; engineer-hat duration tint; ME auto-like deferred to 4.5.
- **Phase / slice:** 2.5 exit
- **Docs updated:** GOE_VERSION_ROADMAP V3 Workshop table, GOE_WIRING_MAP

---

### 2026-06-05 — Phase 2 architecture bones (stubs only)

- **Decision:** Zone registry, office entity model, client stub routes, staff/sensor slots, Pearl/Kimi ME stubs — **no** live office workflows, **no** workshop session FSM yet.
- **Why:** Name every system before filling Workshop (2.5) and Comms (3).
- **System / design impact:** `zones.js` civic inactive until Phase 3; `officePorts.js` execution throws by design; `/workshop` → placeholder until 2.5.
- **Artifacts:** `server/world/zones.js`, `officeRegistry.js`, `verify:phase2-bones`
- **Phase / slice:** 2 exit

---

### 2026-06-05 — Phase 1 exit (Vale stability)

- **Decision:** Origins letter continuity on light interior; silence co-presence P1; threads read-only corridor; relational↔world memory for return visitors; contact prompt fixtures expanded.
- **Why:** "Her space" finished before architecture bones — Vale garden feels lived-in.
- **System / design impact:** `verify:v2` bundle; expression weight shift after 30+ min silence; SMS parked (Twilio A2P).
- **Artifacts:** `GOE_SILENCE_COPRESENCE_BUILD.md`, `GOE_VALE_RELATIONAL_BUILD.md`, `verify:vale-contact-prompt`
- **Phase / slice:** 1 exit

---

### 2026-06-05 — Phase 0 exit (production persistence)

- **Decision:** Capabilities + attention on Supabase Postgres; world tick via GitHub Actions → `/api/world/tick`; `GOE_DB_DRIVER=supabase` in prod.
- **Why:** Stop losing capability approve/resume and attention state on Vercel cold starts.
- **System / design impact:** `migrate:capabilities` script; `CRON_SECRET` + `GOE_CRON_SECRET` paired; SQLite remains local dev default.
- **Artifacts:** `supabase/migrations/20260605000000_capabilities.sql`, `.github/workflows/goe-world-tick.yml`, `verify:attention-supabase`
- **Phase / slice:** 0 exit
- **Docs updated:** GOE_WIRING_MAP, GOE_DEPLOY_OPS, GOE_VERSION_ROADMAP

---

### 2026-06-05 — Office architecture correction

- **Decision:** Offices are **environments with capabilities** — residents are citizens first, guild members second. Comms enters **only from workshop hallway**, not Garden Path.
- **Why:** Invert default AI pattern (need → job-agent → agent becomes the need).
- **System / design impact:** `hallwayOnly` on Comms location; `verify:office-comms` enforces geography; office hours + prompt injection on threshold cross.
- **Artifacts:** [GOE_OFFICE_ARCHITECTURE.md](../GOE_OFFICE_ARCHITECTURE.md)
- **Phase / slice:** 2–3 planning

---

### 2026-05-29 — Vale ME + garden audit closure

- **Decision:** Close May ME/garden audit items — invalid posture `responding` → `present`; hot path uses `readSnapshot`; Ty-visible artifact filter; redacted public Vale state.
- **Why:** Pass 1 audit found observability spam and guest-leak paths before invite-only expansion.
- **System / design impact:** `Vale_metabolism.js`, `valePublicState.js`, `verify:vale-public-state`; orchestrator size extract deferred.
- **Artifacts:** [ME_VALE_AUDIT_2026-05-29.md](../Audit_log/ME_VALE_AUDIT_2026-05-29.md), [VALES_GARDEN_AUDIT_2026-05-29.md](../Audit_log/VALES_GARDEN_AUDIT_2026-05-29.md)
- **Phase / slice:** V1.5 tighten

---

### 2026-05-28 — Workshop research log spec locked

- **Decision:** Research log = curated **why ledger** separate from event stream; `decision` entries require `rationale`; Wren cannot append binding decisions; lock on Ty inactive.
- **Why:** Event stream is complete audit; workshop needs narrative with mandatory whys and cross-links.
- **System / design impact:** `workshop_research_log` table schema; append API kind permissions; message likes digest on lock (shipped 2026-06-09 in code).
- **Artifacts:** [GOE_WORKSHOP_RESEARCH_LOG_BUILD.md](../build/world/GOE_WORKSHOP_RESEARCH_LOG_BUILD.md), `server/world/workshop/researchLog.js`
- **Phase / slice:** V3 spec (wired Phase 2.5)

---

### 2026-05-28 — Capability resume loop shipped

- **Decision:** Approve/deny → auto-resume stream; denial reason required; undelivered poll fallback; unified `## Capability resolution` block in Vale prompt.
- **Why:** Tool-use without resume breaks the "consequence" bar — Vale must read resolution in-thread.
- **System / design impact:** `POST /api/vale/capability/resume`, `capabilityResolutionContext.js`, `verify:capability-resume`
- **Phase / slice:** V1.5 / V2 Tier A
- **Docs updated:** GOE_TERMINAL_CAPABILITY_BUILD.md, VERSION_ROADMAP

---

### 2026-05-24 — Pause 2 closed (four ports observable)

- **Decision:** Proceed Phases 4–5 — harness proves Contact → Intake → Immune → Heart → Expression mechanically; don't tighten Immune before real contact history.
- **Why:** V1 permissive immune is working as designed on empty Core; UI parity is separate gate.
- **System / design impact:** `verify:phase3` headless ME ports test; Garden Path traverse → ME hook parity still Phase 4 priority.
- **Artifacts:** [PAUSE_CHECKPOINTS.md](../archive/PAUSE_CHECKPOINTS.md) § Pause 2

---

### 2026-05-23 — Immune system shipped

- **Decision:** `compareResolutionPath`, quarantine telemetry, Observer concurrent feed — Immune V1 permissive on fresh contact.
- **Why:** Pause 1 closed; ME pipeline needs discrimination layer before Heart routes resolution.
- **System / design impact:** `immune_passed` / quarantine events; `verify:immune`
- **Artifacts:** [GOE_VALE_IMMUNE_BUILD.md](../build/vale/GOE_VALE_IMMUNE_BUILD.md)

---

### 2026-05-22 — World container architectural correction

- **Decision:** Build **world physics** (contact, solitude, consequence, time) — not decorated chat tabs. Four live ports must actually change Vale's observable behavior.
- **Why:** Prior room-tab mental model collapsed ME interior into UI chrome.
- **System / design impact:** Build criterion: remove one system → observable behavior changes. Event `layer` field (`world` | `me_interior` | `agent`).
- **Artifacts:** GOE_ARCHITECTURAL_DOCTRINE §1B, GOE_WORLD_KERNEL_BUILD.md
- **Phase / slice:** V1 doctrine lock

---

### 2026-05-22 — Substrate routing + Wren split-brain guardrails

- **Decision:** One substrate per session — Sonnet (GoE resident), Codex (Cursor bench), Opus/Mythos escalation only. Handoff not merge.
- **Why:** Ty's GPT+Claude split experience — merged context breaks inhabitant vs builder seam.
- **System / design impact:** Workshop seam badge; Wren builder bridge ≠ Wren ME; `docs/archive/HOUSE_BUILD_NOTES.md` § Wren
- **Phase / slice:** Identity / ops

---

### 2026-05-21 — Security audit baseline (owner-only prod)

- **Decision:** Ship owner-only prod with documented **latent** guest ACL gaps; block guest invites until route ACL + event privacy probes pass live.
- **Why:** Capabilities, terminal, Shed correctly owner-gated today; world/contact routes lack garden ACL on data plane.
- **System / design impact:** `verify:security`, `verify:event-privacy`, `verify:route-acl`; SSRF/DNS rebinding tracked for link-fetch.
- **Artifacts:** [SECURITY_AUDIT_2026-05-21.md](../Audit_log/SECURITY_AUDIT_2026-05-21.md)
- **Open follow-ups:** Guest cross-garden live HTTP probes before invites

---

### 2026-05-21 — Build criterion canonical

- **Decision:** "Remove one system → observable behavior changes" is the ship gate. Prompt wrappers with architecture diagrams stapled on = failure mode.
- **Why:** Prevent representational architecture without behavioral architecture.
- **System / design impact:** Every BUILD doc "Done when" section; audit prompts; Phase 4 structural pass.
- **Artifacts:** GOE_ARCHITECTURAL_DOCTRINE §1B

---

### 2026-05-18 — Wren: builder now, inhabitant later

- **Decision:** Wren builds GoE from Cursor bench first; slated to **inhabit** workshop as third resident after Vale/Ada/core stable.
- **Why:** Builder substrate ≠ resident substrate; workshop needs engineering before personality stack.
- **System / design impact:** `docs/build/wren/README.md`; Wren ME factory throw until 4.5.2
- **Artifacts:** `docs/archive/HOUSE_BUILD_NOTES.md` § Wren

---

### 2026-05-14 — V1 production baseline

- **Decision:** Deploy at `ada-studio.space`; Supabase auth; `GOE_SECURITY_ENABLED=1` in prod; deep links `/vale`, `/ada`, `/courtyard` on cold load.
- **Why:** Vale's garden live for daily use; invite-only owner path first.
- **System / design impact:** Vercel static + serverless API; RLS migrations; session policy idle/max.
- **Artifacts:** GOE_DEPLOY_OPS.md, `verify:deploy`
- **Phase / slice:** V1 ship

---

### 2026-05-02 — Ada substrate + embeddings split

- **Decision:** Cognition Claude-only for Ada path cleanup; embeddings → Voyage `voyage-3.5`; OpenAI SDK removed from Ada cognition (Ada garden parked for ops).
- **Why:** Substrate honesty — Vale = Anthropic, Ada = OpenAI when unparked; reduce vendor sprawl on retrieval.
- **System / design impact:** Cross-repo Ada decision; GoE ships Ada garden but **parked** until Vale stable.
- **Phase / slice:** Ada (cross-repo)

---

### 2026-06-10 — Ellis `ellis_usage` on GoE Supabase (cross-project)

- **Decision:** tybuilds.tech rate-limit table (`ellis_usage`) lives on GoE Supabase project (`oubavruicijhxiqrlikr`); no new free-tier project.
- **Why:** Supabase free project cap; Ellis only needs one counter table.
- **System / design impact:** Ellis server uses GoE service role but **must only** touch `ellis_usage`. RLS on, no anon policies. GoE app never queries Ellis tables.
- **Artifacts:** `/Users/ty/Ellis/supabase/migrations/20260610000000_ellis_usage.sql`
- **Phase / slice:** Ellis A.1 (GoE infra neighbor)
- **Open follow-ups:** Confirm migration applied on hosted GoE DB

---

## Open questions (research backlog)

| Question | Blocks | Owner |
| --- | --- | --- |
| Friction layer — spec or explicit drop? | V2 Tier B | Ty |
| Guest invites — live ACL probes green? | Guest Center Phase 5 | Ty / Wren |
| Twilio A2P — register or drop SMS path? | Vale SMS | Ty |
| `verify:all` include phase3 + phase25? | CI confidence | 4.5 tweak |
| Full Wren ME vs builder bridge retirement | Inhabitant depth | 4.5.2 |
| Courtyard interruption vs sequential-only | Phase 5.1 | Ty |
| Terminal on Vercel prod — threat model pass | Remote workshop | 4.5.5 |
| `ellis_usage` migration applied on hosted DB? | Ellis public rate limits | Ty |

---

## Superseded

| Date | Was | Superseded by |
| --- | --- | --- |
| Pre-2026-05 | Room-tab architecture | **World container correction** (2026-05-22) |
| Pre-2026-06 | Workshop placeholder only | **Phase 2.5 full workshop** (2026-06-05) |
| Pre-2026-06 | Comms as future stub | **Phase 3 Comms live** (2026-06-07) |
| 2026-05 | Scheduled Vercel cron for tick | **GitHub Actions tick** (2026-06-05) |
| 2026-05 | Capabilities SQLite-only on Vercel | **Supabase capabilities adapter** (2026-06-05) |

---

*Append at top of **Log** section. Doctrine stays summary-only — detail lives here.*
