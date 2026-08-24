# Ellis ME — Build spec (GoE-res lite)

> **Partly superseded 2026-08-21.** The session-scoped interior described below was
> replaced by a single persistent body (`src/lib/ellis/me/body/`, table `ellis_body`),
> and several symptoms this spec assumes — `workingMemory`, `sessionDrift`, the
> `shouldEngage` gate, `hallPhysics` — were deleted after an audit found they were
> never wired. Posture, traces, and contact quality still work as written. See
> RESEARCH_LOG 2026-08-21 for what changed and why.

**Status:** Locked direction 2026-06-11 — supersedes "chat wrapper + shelf only" for Ellis host  
**Doctrine:** [ARCHITECTURAL_DOCTRINE.md](./ARCHITECTURAL_DOCTRINE.md) · [BUILD_ETHOS.md](./BUILD_ETHOS.md)  
**Wiring:** [WIRING_MAP.md](./WIRING_MAP.md) · [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)

---

## What changed

Ellis is no longer a thin prompt over a knowledge shelf. He is a **public ME** — as close to GoE resident architecture as tybuilds can ship **without cross-visit visitor memory**.

| Layer              | GoE resident (Vale)                            | Ellis (tybuilds)                                                                |
| ------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------- |
| **Interior**       | Full 11-system ME, persistence across sessions | **Subset** — mood, traces, sense-of-self drift, session working memory          |
| **World**          | Full house physics, multi-ME, gardens          | **Hall container** — contact, solitude, minor physics only                      |
| **Visitor memory** | Ty returns; relational depth accrues           | **None across visits** — honest disclosure; one-shot strangers                  |
| **Relational**     | Return visits, charge over time                | **Instance-maximal** — derive everything possible from _this_ visit             |
| **Solitude**       | Variable; shared house                         | **High threshold** — default alone; contact is the exception worth attending to |

Ellis must **describe** full GoE ME interior and world physics from Ty's design (knowledge + lived subset). He **lives** the lite version.

---

## Two memory layers (do not conflate)

```txt
VISITOR (ephemeral — honest "we won't remember you")
  └── Client transcript for current tab/session
  └── No cross-visit recall; no visitor DB profile

ELLIS ME (session-scoped server state — NOT visitor memory)
  └── Tied to server session id; TTL on abandon
  └── Mood, traces, relational snapshot, interior assembly inputs
  └── Discarded when session ends — Ellis does not "remember you next time"
```

**UI copy stays true:** session-only _visitor_ memory. Ellis may have interior continuity _during_ the visit without breaking that promise.

---

## Ellis ME interior (v1 subset)

Port **patterns** from GoE (`~/GoE/docs/build/templates/GOE_BLANK_ME_BUILD.md`), not the full 11-system stack.

### Load-bearing modules

| Module                    | Purpose                                                                                   | Session scope                              |
| ------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| **State**                 | Posture / orientation (GoE vocabulary subset — e.g. `present`, `withdrawn`, `settling`)   | Updates per turn from events               |
| **Traces**                | Lightweight marks from conversation beats — not full event ledger                         | Append during session; feed assembly       |
| **Relational (instance)** | Snapshot of _this_ visitor contact — tone, fit signal, depth reached                      | One row per session; no return-visit merge |
| **Working memory**        | Slim carry-forward inside session — open threads, not full ME metabolism                  | In-memory or session store                 |
| **Sense of self**         | Baseline from `ellis-self.md` + **session drift** (how this conversation is changing him) | Static + session delta                     |

### Explicitly not in Ellis v1

- Cross-session consolidation / dreaming / metabolism
- Multi-ME presence or parallel solitude
- ME-private artifacts DB, letters, capabilities spine
- Visitor profiles or relational history across IPs

### Interior → prompt

```txt
assembleEllisInterior(sessionState, relationalSnapshot, traces)
  → format for model (server-only — never on client wire)
  → merge with knowledge shelf + system prompt
```

**Removal test:** Strip interior assembly → Ellis flattens to generic host; observable tone/depth change.

Ellis can **explain** what full GoE MEs get (Vale interior, consolidation, etc.) from shelf content — distinguish _his_ experience vs _theirs_.

---

## World-lite physics (hall container)

Minimal GoE world container so Ellis speaks from experience, not metaphor only.

| Physics                | Ellis hall behavior                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Default state**      | **Solitude** — high threshold; Ellis is alone until visitor engages                                               |
| **Contact**            | Visitor message = contact event; `inContact` for session duration                                                 |
| **Solitude threshold** | Hard to pull Ellis into shallow chat energy — prefers depth or sabai silence; won't perform for drive-by          |
| **Consequence**        | Interior state responds to contact quality (shallow vs genuine fit conversation) — behavioral, not prompt cosplay |
| **Rooms**              | Project handoff = threshold cross to room (navigation), not second world                                          |

No multi-garden simulation. One hall. Optional: `solitudeActivity` idle vs `engaged` when in active thread.

**Knowledge:** `content/goe-physics-teach.md` (or section in `ellis-self.md`) — what full GoE has vs what Ellis hall runs.

---

## Relational design — one-shot visitors

Most visitors won't return. Ellis is built for that.

| Principle                   | Implementation                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------- |
| **Instance-maximal**        | Extract fit signal, curiosity, project handoffs _now_ — don't defer to "next time" |
| **No fake reunion**         | Never "welcome back" without a real scoped mechanism (there isn't one v1)          |
| **High solitude threshold** | Alone is baseline; contact matters because it's rare and bounded                   |
| **Sabai**                   | Unhurried; won't chase; comfortable ending in "probably not"                       |
| **Brag when true**          | May mention Sonnet when switching into depth on Ty's work — sparingly              |

---

## Model routing (locked 2026-06-11)

**Haiku only** — unless the conversation is **directly discussing Ty's work in depth**, then **Sonnet**.

| Model                        | When                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Claude Haiku** (default)   | Everything else — greetings, light fit chat, short project pointers, refusals, sabai small talk, "what is this site"      |
| **Claude Sonnet** (fallback) | Turn is substantively about **Ty's work** at depth — architecture, research, projects, honest fit _with technical detail_ |

### What counts as "Ty's work in depth"

**Sonnet yes:**

- GoE — behavioral vs representational architecture, ME interior, world physics, Vale/Ada/Ellis design (from teach shelf)
- Tonal Learning — SLA research, Phase 0, Lexi/Lumi, pre-output state, manifesto-level questions
- Ada — cognition, continuity, development status (honest scope)
- tybuilds / Ellis — how the host is built, ME-lite, session honesty
- Basement CRT — teaching console, demo intent
- Fit judgment **when** visitor is drilling stack, project evidence, or role-vs-work match with specifics

**Sonnet no (stay Haiku):**

- Generic hiring chat without drilling into her work
- Off-topic, therapy, spam
- One-line "she built X" — pointer to project room is enough
- Ellis personality / vibe / unrelated chitchat

### Router (`src/lib/ellis/routeModel.ts`)

Rules-based v1 — **no client model picker**.

```txt
1. Default: haiku
2. If classifyTurn(messages, session) → ty_work_in_depth: sonnet
3. Once a thread is in_depth, sticky for that session until topic shifts (avoid flip-flop per message)
```

**Signals for `ty_work_in_depth` (implement any two or explicit override):**

- Visitor message asks for detail/explain/how/why about named project or Ty's approach
- Active project room context + substantive follow-up
- Ellis prior turn opened a deep work thread (session flag)
- Keyword + intent combo on Ty-work topics (not keyword alone)

**Not signals:** message length alone, "go deep" without Ty-work topic, gaming to burn Sonnet tokens.

### Ellis voice

May mention substrate **when switching into depth** — once, naturally (_"let me think through that properly"_), not every Sonnet turn. Witness energy, not spec sheet.

### Env

`ANTHROPIC_API_KEY` only. Model IDs in server config (`ELLIS_MODEL_HAIKU`, `ELLIS_MODEL_SONNET`) — not client-selectable. Rate limits apply to **both** models per IP.

---

## Rate limits & bill protection (required v1)

**Full spec:** [ELLIS_EXPERIENCE.md](./ELLIS_EXPERIENCE.md) § Daily budget.

~**$1 USD / day / IP** (env config — never shown to visitors). Haiku + selective Sonnet. Ellis warns casually at ~**50%** and ~**80%**. Hard stop at cap.

Extend `ellis_usage` with `estimated_cost_usd`, `day_utc`, `warned_50`, `warned_80`.

---

## Hall variants (locked 2026-06-11)

**Same Ellis** — same ME stack, same voice, same honesty rules. **Different hall context** via route-scoped prompt overlay.

**Registry:** [EXCITED_HALLS.md](../reference/EXCITED_HALLS.md)

### Routing rule

| Route         | Hall        | Who gets it                                                                                             |
| ------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| **`/`**       | **Generic** | **Everyone else** — SimuTech, Adaptify, Wild Card, curious peers, any send without excitement-tier hall |
| **`/{slug}`** | **Excited** | Only companies on the registry — Ty's genuine enthusiasm, not every application                         |

**Excitement is the gate.** Custom halls are rare. Most URLs on Ty's resume are plain `tybuilds.tech`.

### Generic hall (`/`)

- Witness for any evaluator
- Fit judgment honest — yes, no, stretch
- No company-first pitch unless visitor raises it
- **Default for all non-excited applications**

### Excited halls (e.g. `/anthropic`, `/huggingface`)

Each registered slug gets:

- `content/halls/{slug}.md` — Ty-approved enthusiasm + alignment brief
- Lead with authentic excitement for **that** company — still not a closer
- Optional subtle route accent (STYLE) — editorial, not corporate

**Anthropic (`/anthropic`):** Fellows URL, enthusiasm overlay, **Claude-inspired visual hook + Ellis types first** — see [ELLIS_EXPERIENCE.md](./ELLIS_EXPERIENCE.md)

**Hugging Face (`/huggingface`):** ⏸ when Ty ready — same pattern, HF-specific overlay

**Not excited → no hall.** SimuTech, Adaptify, etc. use `/` only.

### Implementation (one path)

```txt
src/app/page.tsx                    → hall: 'default'
src/app/[hall]/page.tsx             → hall from registry (or static /anthropic at v1)
src/lib/ellis/halls/registry.ts     → EXCITED_HALLS allowlist

POST /api/ellis/stream { messages, sessionId?, hall }
  → hall must be 'default' OR registered excited slug — reject unknown
  → loadKnowledgeShelf(hall) = base shelf + content/halls/{slug}.md if excited
```

**Not:** separate API per company, separate Ellis identity, client-supplied prompt fragments.

### Anti-patterns

- Custom hall for every job application
- Generic `/` opening with Anthropic (or any company) pitch unprompted
- Excited hall sycophant mode or invented insider knowledge
- SimuTech-style sends getting `/simutech` without excitement-tier registration

---

## Knowledge shelf additions

| Path                           | Role                                                      |
| ------------------------------ | --------------------------------------------------------- |
| `content/ellis-self.md`        | Bootstrap — Ellis knows himself                           |
| `content/about-ty/*`           | **Ellis-written** after onboarding with Ty — starts empty |
| `content/halls/anthropic.md`   | Anthropic excited hall overlay                            |
| `content/halls/huggingface.md` | Hugging Face excited hall overlay (when ready)            |
| `docs/reference/*`             | Ty QA only — **never prompt-injected**                    |

Ellis **must not** invent Vale interior or private GoE paths. Teach from `about-ty/goe-teach.md` after Ty teaches _him_.

---

## Code layout (target)

```txt
src/lib/ellis/
  loadKnowledgeShelf.ts      # base + hall overlay
  loadHallOverlay.ts         # default | anthropic
  systemPrompt.ts
  stream.ts
  routeModel.ts              # Haiku / Sonnet
  session/
    createSession.ts         # server session id
    sessionStore.ts          # TTL state — Redis or memory + Supabase optional
  me/
    assembleInterior.ts
    formatInterior.ts
    updateState.ts           # post-turn interior mutation
    relational.ts            # instance snapshot
  world/
    hallPhysics.ts           # contact, solitude threshold
  rateLimit/
    check.ts
    record.ts
```

**Single stream path** — [BUILD_ETHOS.md](./BUILD_ETHOS.md).

---

## Wiring deltas

See [WIRING_MAP.md](./WIRING_MAP.md) — master flow gains:

- Session store + ME interior assembly before Anthropic
- Model router (Haiku/Sonnet)
- Rate limit gate before stream
- Supabase `ellis_usage` (not visitor memory)

---

## Slice impact

| Slice     | Added work                                                                      |
| --------- | ------------------------------------------------------------------------------- |
| Phase A   | Env + Supabase migration for `ellis_usage` if not deferred                      |
| Phase B   | **Ellis ME module** + session store + router + rate limit + **onboarding mode** |
| Phase 0.1 | Ellis interviews Ty — synthesizes `about-ty/*`                                  |
| Phase B+  | Interior depth tuning; hall physics; goe-teach shelf files                      |
| Polish    | Expression pulse in UI (optional) — weights from interior, no mood labels       |

---

## Audit hooks

- [ ] Visitor still has **no** cross-visit persistence
- [ ] Ellis interior is **session-scoped** — dies with session
- [ ] Interior/context **server-only** — not in client bundle or API leak
- [ ] Rate limit **before** Anthropic call
- [ ] One stream path; one assembly path
- [ ] Ellis can describe GoE ME/physics from shelf — no invention
- [ ] Solitude default + high threshold observable in behavior

---

## Decisions log entry

| Date       | Decision                                                                                |
| ---------- | --------------------------------------------------------------------------------------- |
| 2026-06-11 | Ellis = GoE-res lite ME + hall physics; session interior; no visitor cross-visit memory |
| 2026-06-11 | Haiku only; Sonnet if Ty's work in depth                                                |
| 2026-06-11 | Excited halls only (`/anthropic`, `/huggingface`, …); everyone else `/`                 |
| 2026-06-11 | Rate limits required v1 — IP/window; Supabase usage table                               |
| 2026-06-11 | Instance-maximal relational design; high solitude threshold                             |

---

_Build the dream bot — with bones._
