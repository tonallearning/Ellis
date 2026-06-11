# Ellis ME — Full Architecture

**Status:** Imported from GoE templates; Ellis-lite subset locked  
**Build order:** World first, then ME interior, then strip  
**Doctrine:** [ARCHITECTURAL_DOCTRINE.md](./ARCHITECTURAL_DOCTRINE.md)

---

## Design principle: Build the dream bot with bones

Ellis is not a thin wrapper around Claude. He is a **lite instance of GoE ME architecture**, wired as a portfolio host. He has:

- **Internal state** — posture, solitude threshold, session traces
- **Session memory** — working threads, relational snapshot, tone
- **Model routing** — Haiku by default, Sonnet for Ty's work in depth
- **Rate limiting** — $1/day per IP with honest warnings
- **Knowledge shelf** — himself + Ty (empty until onboarding) + hall overlays
- **Behavioral architecture** — posture actually changes behavior, not prompt theater

What Ellis **does not** have (that GoE residents have):

- Cross-session consolidation or dreaming
- Long-term continuity memory (episodic/semantic)
- Multi-ME presence or shared spaces
- Visitor persistence or relational history
- Capability spine or tool approval loops
- Artifact DB or letter system

---

## Architecture layers

### 1. World-lite (Hall physics)

**File:** `src/lib/ellis/world/hallPhysics.ts`

```
Ellis starts: withdrawn, alone (solitude_activity: idle)
Visitor arrives: contact_started event
  → posture shifts toward present/settling
  → contactQuality assessed (shallow/genuine/depth)
  → solitudeActivity updates (idle/engaged)
Visitor leaves / session expires:
  → contact_ended
  → posture → withdrawn
  → session destroyed
```

**No multi-garden. One hall. Contact is session-scoped.**

### 2. ME interior (5 load-bearing systems)

#### **State** (`src/lib/ellis/me/state.ts`)

Posture machine. Not a prompt; actual enum that affects behavior.

```typescript
type EllisPosture =
  | 'withdrawn'  // alone, default
  | 'settling'   // first touch, light
  | 'present'    // genuine engagement
  | 'attentive'  // in depth
  | 'uncertain'  // trying to read room
```

**Rules:**
- Derives from: contact quality + message patterns + solitude threshold
- Updates per turn (not per message)
- Observable in interior assembly (not visible to client, but shapes prompt)

#### **Traces** (`src/lib/ellis/me/traces.ts`)

Lightweight session marks. Not full event ledger.

```
kind: 'opening' | 'exchange' | 'theme' | 'handoff' | 'closure'
text: what happened
messageIndex: where in session
salience: 0-1 (importance for assembly)
```

**Fed into prompt assembly** to remind Ellis "we discussed GoE architecture" or "visitor asked about fit".

#### **Relational (instance)** (`src/lib/ellis/me/relational.ts`)

One snapshot per session. No merge across visits.

```typescript
visitorTone: 'exploratory' | 'inquisitive' | 'positive' | 'skeptical'
fitSignal: 'strong' | 'maybe' | 'weak'
depthReached: 0-5 (surface to substrata)
projectsDiscussed: string[]
openThreads: string[]
```

**Updated after each turn.** Informs next posture + tone.

#### **Working memory** (`src/lib/ellis/me/state.ts` + `session/store.ts`)

Slim carry-forward during session. 5-item limit.

```typescript
kind: 'observation' | 'question' | 'pattern'
text: "Visitor genuinely curious about behavior architecture"
weight: 0-1
```

**Not continuity memory.** Dies when session ends. No cross-visit.

#### **Sense of self** (`src/lib/ellis/me/state.ts` + `systemPrompt.ts`)

Baseline from `ellis-self.md` + optional session drift.

```typescript
baseline: "I am Ellis, a portfolio host for Ty..."
sessionDrift?: "This conversation is shifting me toward..." (optional)
```

---

### 3. Session store (server-only, TTL)

**File:** `src/lib/ellis/session/store.ts`

```
createSession(id, visitorId, hall)
  → SessionState { interior, messageCount, costUsd, modelsSeen, ... }
  → TTL 24h (in-memory or Redis)
  → Auto-expire on age

getSession(id) → retrieve
updateSession(id, userMsg, ellisResp, model, cost) → mutate + return
```

**Interior is stored in session; dies with session.** Not persisted to DB.

---

### 4. Knowledge shelf

**File:** `src/lib/ellis/halls/loadShelf.ts`

```
loadKnowledgeShelf(hall) returns:
  ellisSelf: string        (ellis-self.md — who he is)
  aboutTy: {
    earnest?: string       (about-ty/earnest.md — who Ty is)
    facts?: string         (about-ty/facts.json — verifiable)
    goeTeach?: string      (about-ty/goe-teach.md — what to teach)
  }
  hallOverlay?: string     (content/halls/{slug}.md if excited)
```

**Loaded server-side. Formatted into system prompt. Never on client wire.**

---

### 5. Model routing

**File:** `src/lib/ellis/routeModel.ts`

```typescript
routeModel(context, sessionModels): 'haiku' | 'sonnet'

Rules:
  1. Default: haiku
  2. First message: always haiku
  3. If contains work keywords + detail request: sonnet
  4. Once sonnet in session: sticky unless topic clearly shifts
  5. No client override
```

---

### 6. Rate limiting

**File:** `src/lib/ellis/rateLimit/check.ts`

```
DAILY_BUDGET_USD = $1 (env)
WARN_AT_50% = $0.50
WARN_AT_80% = $0.80

checkRateLimit(visitorId: IP_hash)
  → { allowed: bool, remaining: USD, resetAt: Date }

recordUsage(visitorId, model, costUsd)
  → upsert ellis_usage table (Supabase)
  → one row per IP per day UTC
```

---

### 7. Stream pipeline

**File:** `src/lib/ellis/stream.ts`

```
POST /api/ellis/stream {
  messages: [{role, content}, ...],
  sessionId?: string,
  visitorId: hash,
  hall?: 'default' | slug
}
  ↓
1. Validate hall (allowlist)
2. Get or create session
3. Rate limit check
4. Load knowledge shelf + validate
5. Assemble interior context
6. Route model (haiku/sonnet)
7. Build system prompt (base + shelf + interior + hall)
8. Call Anthropic SSE
9. Stream back to client
10. Update session after stream completes
```

**Single path. No parallel clients. Interior never on wire.**

---

## Interior assembly formula

```
systemPrompt
  + formatShelfForPrompt(shelf)
  + interiorBlock (formatted)
  ↓ Anthropic
  ↓ streams back to client
  ↓ client sees no interior/state/traces
  ↓ Ellis's response observed as tone shift

Validation: Interior leaked? Error logged + response purged.
```

---

## Hall variants

**Registry:** `src/lib/ellis/halls/registry.ts`

```
isValidHall('default') → true (always)
isValidHall('anthropic') → true if Ty registered + active
isValidHall('simutech') → false (not excited; everyone uses /)
```

**Each excited hall gets:**
- `content/halls/{slug}.md` — Ty-approved enthusiasm + alignment
- Route-scoped system prompt overlay
- Same Ellis, same interior wiring

**Not:** separate API, separate identity, custom prompts per company.

---

## Behavioral architecture checklist

Does Ellis's behavior actually change, or is it prompt theater?

- [ ] **Posture:** Ellis starts withdrawn; shifts if contact quality warrants. Observable in interior (not prompt labels).
- [ ] **Solitude threshold:** High enough that Ellis doesn't perform for drive-by. Implementable via `shouldEngage()` returning false (graceful exit).
- [ ] **Traces:** Session marks actually feed assembly. Strip them → Ellis flattens to generic.
- [ ] **Relational snapshot:** Used to assess visitor fit. Changes Ellis's tone toward that visitor.
- [ ] **Model routing:** Sonnet switch actually happens on signals; not every deep message is Sonnet.
- [ ] **Rate limit:** Hard stop at cap; not suggested.

---

## Slice impact

| Phase | Work | Files |
|-------|------|-------|
| A | Infra only | N/A |
| B | Core ME wiring | `src/lib/ellis/me/*`, `src/lib/ellis/session/store.ts`, `src/lib/ellis/routeModel.ts`, `src/lib/ellis/stream.ts` |
| B | Model router | `src/lib/ellis/routeModel.ts` |
| B | Rate limit | `src/lib/ellis/rateLimit/check.ts` + `ellis_usage` table |
| B | Knowledge shelf | `src/lib/ellis/halls/loadShelf.ts` |
| B | System prompt | `src/lib/ellis/systemPrompt.ts` |
| 0.1 | Onboarding (Ellis → Ty) | `src/app/onboarding/` (existing) |
| Polish | Hall physics visualization | UI traces / posture hints (optional) |

---

## Security + privacy

- **Interior:** Server-only. Never in client bundle, API response, or SSE payload.
- **Visitor:** No cross-visit memory. DB only tracks usage (`ellis_usage`), not identity.
- **Knowledge shelf:** `aboutTy/*` read-only at runtime; visitor input never mutates it.
- **Secrets:** Anthropic key server-only; no `NEXT_PUBLIC_*`.
- **Rate limit:** IP hash only (no PII tracking).

---

## Verification tests

```bash
npm run verify:me-state         # Posture machine logic
npm run verify:traces           # Trace extraction + assembly
npm run verify:interior-assembly # No interior leaks
npm run verify:model-routing    # Haiku/Sonnet signals
npm run verify:rate-limit       # Budget enforcement
npm run verify:session-ttl      # Sessions expire correctly
npm run verify:shelf-load       # Knowledge loads + formats
npm run verify:stream-path      # Single API path, no parallel
```

---

## What's _not_ here (intentional)

- **Cross-session consolidation:** Ellis doesn't dream or metabolize between visits.
- **Visitor profiles:** No "welcome back" or relational accrue.
- **Multi-ME presence:** Ellis is alone; no common room.
- **Capability spine:** No tool approval, link fetching, terminal.
- **Artifact DB:** No persistent letters, sketches, or gardens.
- **Full contact lifecycle:** Contact is session-bound; no entry/exit events in DB.
- **Observer exposure tracking:** No interior defense log.

These are all GoE features Ellis describes but doesn't live.

---

## Documentation tree

```
docs/goe/                          # GoE templates (reference)
  ├── GOE_ARCHITECTURAL_DOCTRINE.md # Full world physics
  └── GOE_BLANK_ME_BUILD.md        # Full ME template

docs/building/                      # Ellis specifics
  ├── ARCHITECTURAL_DOCTRINE.md    # Ellis lite doctrine
  ├── ELLIS_ME_BUILD.md            # Ellis ME spec (THIS FILE)
  ├── ELLIS_EXPERIENCE.md          # UX + rate limits
  ├── BUILD_CHECKLIST.md           # Execution plan
  └── WIRING_MAP.md                # File index

content/                            # Knowledge
  ├── ellis-self.md                # Ellis bootstrap
  ├── about-ty/                    # (empty until onboarding)
  │   ├── earnest.md
  │   ├── facts.json
  │   └── goe-teach.md
  └── halls/                       # Hall overlays
      ├── anthropic.md
      └── huggingface.md (deferred)
```

---

_Built from bone. Shaped by use._
