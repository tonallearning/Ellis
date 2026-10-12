# Ellis / tybuilds.tech — Wiring Map

**Status:** Phase B complete — Phase 0.1 (Ellis learns Ty) next  
**Doctrine:** [ARCHITECTURAL_DOCTRINE.md](./ARCHITECTURAL_DOCTRINE.md)  
**Rhythm:** [BUILD_RHYTHM.md](./BUILD_RHYTHM.md) — update this map during the **Wire** step of each slice. Next gates: [ARCHITECTURE_CHECKLIST.md](./ARCHITECTURE_CHECKLIST.md) → [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) → [HYGIENE_CHECKLIST.md](./HYGIENE_CHECKLIST.md) Core.  
**Build criterion:** Remove one system → observable visitor behavior changes.

**Legend:** 🟡 Planned · ✅ Shipped · ⏸ Deferred

---

## Master flow (target)

```mermaid
flowchart TB
  subgraph visitor [Visitor]
    Hall["Ellis Hall /"]
    HallAnthropic["Anthropic hall /anthropic"]
    Rooms[Project rooms]
  end

  subgraph shell [Platform shell]
    Layout[Layout + footer]
    Disclosure[AI disclosure + session copy]
  end

  subgraph ellis [Ellis host]
    ChatUI[Chat UI]
    StreamAPI["POST /api/ellis/stream"]
    InputGate[Envelope validation + session binding]
    OwnerGate[HMAC-signed owner identity]
    RateLimit[Rate limit IP hash]
    SessionME[Session + ME interior]
    HallPhysics[Hall physics lite]
    PromptAsm[Prompt assembly]
    Router[Haiku; Sonnet if work in depth]
    Anthropic[Anthropic stream]
  end

  subgraph shelf [Knowledge shelf — read-only]
    Self[ellis-self.md]
    Facts[ty-facts.json]
    Earnest[ty-earnest.md]
    GoETeach[goe-me-teach + physics-teach]
    HallOverlay["content/halls/{slug}.md if excited"]
  end

  subgraph usage [Usage — not memory]
    UsageDB[ellis_usage Supabase]
  end

  subgraph rooms [Project rooms]
    CRT["/projects/basement-crt"]
    TL["/projects/tonal-learning"]
    GoE["/projects/goe"]
  end

  Hall --> ChatUI
  HallAnthropic --> ChatUI
  ChatUI -->|SSE| StreamAPI
  StreamAPI --> InputGate
  InputGate --> OwnerGate
  OwnerGate --> RateLimit
  RateLimit --> UsageDB
  StreamAPI --> SessionME
  SessionME --> HallPhysics
  SessionME --> PromptAsm
  PromptAsm --> Self
  PromptAsm --> Facts
  PromptAsm --> Earnest
  PromptAsm --> GoETeach
  PromptAsm --> HallOverlay
  PromptAsm --> Router
  Router --> Anthropic
  Anthropic --> ChatUI
  StreamAPI -->|post-turn| SessionME
  ChatUI -->|open project| Rooms
  Layout --> Hall
  Layout --> Rooms
  CRT -->|iframe| CRTDemo[basement-crt.html]
  TL -->|link| TLlive[tonallearning.com]
```

---

## Routes (target)

| Route                          | Domain         | Status | Purpose                                              |
| ------------------------------ | -------------- | ------ | ---------------------------------------------------- |
| `/`                            | Hall (generic) | ✅     | **Default — all non-excited applications**           |
| `/anthropic`                   | Hall (excited) | ✅     | Think · Build · Log tabs; overlay toggle; build logs |
| `/huggingface`                 | Hall (excited) | ⏸      | Hugging Face — when Ty ready                         |
| `/projects/basement-crt`       | Room           | ✅     | CRT demo embed (`public/demos/basement-crt.html`)    |
| `/projects/tonal-learning`     | Room           | ✅     | TL showcase + external link                          |
| `/projects/goe`                | Room           | ✅     | Public tease only                                    |
| `/onboarding`                  | Platform       | ✅     | Ty unlock form for onboarding mode                   |
| `/api/ellis/stream`            | Ellis host     | ✅     | Validated Claude SSE + atomic spend reservation      |
| `/api/ellis/onboarding/unlock` | Platform       | ✅     | HMAC-signed Ty owner + onboarding cookie unlock      |
| `/api/health`                  | Platform       | ⏸      | Optional deploy smoke                                |

No visitor auth routes in v1.

---

## Chat happy path (target)

```txt
1. Visitor lands on / — Ellis Hall (Ellis default: solitude; contact on engage)
2. Client holds visitor transcript in memory (React state) + server session id
3. Visitor sends message → POST /api/ellis/stream { messages, sessionId?, hall }
4. Server validates roles, content/history caps, hall allowlist, and session ownership
5. Server checks the hashed-IP ledger, then atomically reserves projected spend — 429 before Anthropic if the reservation crosses the cap
6. Server: load session ME state (or create); hall physics contact event
7. Server: load knowledge shelf + hall overlay + assemble Ellis interior → prompt
8. Server: routeModel selects the configured public model
9. Server: Anthropic stream → SSE to client; upstream failures become a generic SSE error
10. Post-turn: update session ME state, then atomically append a bounded two-sided beat through `ellis_memory_append`
11. Client appends tokens and keeps the visible transcript in session storage
12. Session state expires after 24 hours; the bounded seven-day visit summary decays separately
```

Ty's durable path is deliberately not the household IP. A valid signed
`ellis_owner` cookie selects the sentinel memory key `owner`, skips the spend
ceiling and decay job, and exposes eight recent remembered exchanges to the
prompt. Everyone else uses the salted connection hash, forty-beat cap, and
seven-day rolling expiry. Re-unlocking at `/onboarding` is required when the
cookie expires or its signing format changes.

**Code target (Phase B):** [ELLIS_ME_BUILD.md](./ELLIS_ME_BUILD.md) — `src/app/api/ellis/stream/route.ts` + `src/lib/ellis/**` + `src/components/ellis/*`

---

## Knowledge shelf (read/write)

| Asset                  | Path                            | Read by                  | Written by      | Notes                              |
| ---------------------- | ------------------------------- | ------------------------ | --------------- | ---------------------------------- |
| Ellis identity         | `content/ellis-self.md`         | Prompt assembly          | Ty (git deploy) | Voice + boundaries                 |
| Verifiable facts       | `content/ty-facts.json`         | Prompt assembly          | Ty (git deploy) | No visitor mutation                |
| Earnest texture        | `content/ty-earnest.md`         | Prompt assembly          | Ty (git deploy) | From onboarding                    |
| System prompt template | `src/lib/ellis/systemPrompt.ts` | Stream API               | Dev             | Enforces §4 doctrine               |
| GoE ME teach           | `content/goe-me-teach.md`       | Prompt assembly          | Ty              | Describe full ME; Ellis lives lite |
| GoE physics teach      | `content/goe-physics-teach.md`  | Prompt assembly          | Ty              | Full physics vs hall               |
| GoE tease copy         | `content/` or room MD           | Prompt + `/projects/goe` | Ty              | Moderate disclosure only           |

**Invariant:** Visitor chat cannot write any knowledge shelf row. Session ME state is not visitor memory.

---

## Project room wiring

| Room           | Embed / link         | External source                         | Ellis handoff                       |
| -------------- | -------------------- | --------------------------------------- | ----------------------------------- |
| Basement CRT   | iframe → static HTML | `~/coding-home/demos/basement-crt.html` | "Want to see the teaching console?" |
| Tonal Learning | Page + CTA           | `https://tonallearning.com`             | Thai learning, Lexi/Lumi            |
| GoE            | Static tease page    | No private repo link                    | House metaphor only                 |
| Ada            | ⏸ v1                 | In development                          | "Ask Ellis" framing later           |

---

## Environment & secrets

| Variable                    | Where      | Consumer                 | Notes                             |
| --------------------------- | ---------- | ------------------------ | --------------------------------- |
| `ANTHROPIC_API_KEY`         | Vercel env | `/api/ellis/stream`      | Server-only                       |
| `NEXT_PUBLIC_SITE_URL`      | Vercel env | Layout, OG               | `https://tybuilds.tech` at deploy |
| `NEXT_PUBLIC_SUPABASE_URL`  | Vercel env | Rate limit client        | GoE project; `ellis_usage` only   |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env | Server rate limit writes | Server-only; never client         |
| `ELLIS_DAILY_BUDGET_USD`    | Vercel env | ~$1/day/IP cap           | Default `1`                       |
| `ELLIS_IP_HASH_SALT`        | Vercel env | IP hash salt             | Required in production            |

Supabase host: **GoE project** (`oubavruicijhxiqrlikr`). `ellis_usage` = bill protection only — **not** Ellis or visitor memory. Migration: `supabase/migrations/20260610000000_ellis_usage.sql`.

---

## Slice queue

**You are here:** Phase B — Ellis live (onboarding mode).

| #   | Slice                     | Status     | Wire updates expected                     |
| --- | ------------------------- | ---------- | ----------------------------------------- |
| 0   | Entrance + blank shelf    | ✅         | Doctrine, `content/ellis-self.md`         |
| 1   | Phase A static shell      | ✅         | Routes, layout, rooms, CRT embed          |
| 2   | Ellis Hall + stream API   | ✅ shipped | Chat happy path, shelf loader, onboarding |
| 3   | Phase 0.1 Ellis learns Ty | **→ Next** | `about-ty/*` after Ellis interviews       |
| 4   | Phase C deploy            | 🟡         | Production URLs, domain                   |
| 5   | Exit criteria             | 🟡         | Full map review vs production             |

Details: [BUILD_RHYTHM.md](./BUILD_RHYTHM.md) · [BUILD_CHECKLIST.md](./BUILD_CHECKLIST.md)

---

## Connected repos (not wired into runtime)

| Repo           | Path               | Ellis may reference                   |
| -------------- | ------------------ | ------------------------------------- |
| GoE            | `~/GoE`            | Tease only — no API, no private paths |
| Tonal Learning | `~/Tonal Learning` | Public URL + showcase copy            |
| hire-me        | `~/hire-me`        | Origin of Ellis naming; parked        |
| coding-home    | `~/coding-home`    | CRT demo source; planning handoff     |

---

## File index

| Path                                                 | Status | Purpose                              |
| ---------------------------------------------------- | ------ | ------------------------------------ |
| `src/app/page.tsx`                                   | ✅     | Ellis Hall — live chat               |
| `src/app/onboarding/page.tsx`                        | ✅     | Ty onboarding unlock                 |
| `src/app/projects/basement-crt/page.tsx`             | ✅     | CRT iframe room                      |
| `src/app/projects/tonal-learning/page.tsx`           | ✅     | TL showcase + external CTA           |
| `src/app/projects/goe/page.tsx`                      | ✅     | GoE tease room                       |
| `src/components/layout/SiteShell.tsx`                | ✅     | Hall chrome + footer slot            |
| `src/components/layout/Footer.tsx`                   | ✅     | AI disclosure, contact, session copy |
| `src/components/hall/ProjectCard.tsx`                | ✅     | In-hall project handoff cards        |
| `src/components/projects/RoomChrome.tsx`             | ✅     | Room accent + back nav               |
| `src/components/theme/ThemeToggle.tsx`               | ✅     | Dark/light override                  |
| `src/components/ellis/ChatPanel.tsx`                 | ✅     | Live chat UI (SSE)                   |
| `src/lib/site.ts`                                    | ✅     | Site constants + project metadata    |
| `src/app/api/ellis/stream/route.ts`                  | ✅     | Stream API                           |
| `src/app/api/ellis/onboarding/unlock/route.ts`       | ✅     | Onboarding cookie unlock             |
| `src/lib/ellis/loadKnowledgeShelf.ts`                | ✅     | Read content/\*                      |
| `src/lib/ellis/systemPrompt.ts`                      | ✅     | Prompt template                      |
| `src/lib/ellis/stream.ts`                            | ✅     | Anthropic streaming                  |
| `src/lib/ellis/routeModel.ts`                        | ✅     | Haiku / Sonnet router                |
| `src/lib/ellis/session/sessionStore.ts`              | ✅     | Session TTL store                    |
| `src/lib/ellis/rateLimit/check.ts`                   | 🟡     | Stub until public mode               |
| `public/demos/basement-crt.html`                     | ✅     | CRT demo embed                       |
| `content/ellis-self.md`                              | ✅     | Ellis bootstrap                      |
| `content/about-ty/*`                                 | ✅     | Empty shelf — Ellis earns Ty         |
| `supabase/migrations/20260610000000_ellis_usage.sql` | ✅     | Rate limit table (GoE project)       |
| `src/app/[hall]/page.tsx`                            | 🟡     | Excited hall routes                  |

---

## Anti-patterns (wiring)

- Knowledge files in `/public` downloadable without intent
- Client-side Anthropic calls
- Two paths to stream chat (API + server action + direct fetch)
- GoE private paths in any route or prompt
- Custom hall for non-excited companies (SimuTech, etc.) — use `/` only
- Per-company hall sprawl without [EXCITED_HALLS.md](../reference/EXCITED_HALLS.md) registration

---

_Last updated: 2026-06-11 — Ellis ME + rate limits_
