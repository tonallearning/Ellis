# Ellis Wiring Map — ME Interior

**Master topology after Phase B (ME wired)**

---

## API entry point

```
POST /api/ellis/stream
├─ request.messages: Message[]
├─ request.sessionId?: string
├─ request.visitorId: string (IP hash)
└─ request.hall?: 'default' | 'anthropic' | ...
    ↓
src/app/api/ellis/stream/route.ts
  ├─ getEllisConfig() → mode, budget, models
  ├─ validateStreamInput() → messages + length checks
  ├─ getOrCreateSession(sessionId, hall) → SessionState
  ├─ applyContactEvent(session, messages) → updates state
  ├─ loadKnowledgeShelf() → shelf (ellis + about-ty + hall overlay)
  ├─ loadOnboardingBank() (if mode=onboarding)
  ├─ assembleInterior(session) → InteriorContext block
  ├─ pickModel(messages, session) → 'haiku' | 'sonnet'
  ├─ buildSystemPrompt({mode, shelf, interior}) → base + interior + hall
  ├─ streamEllisReply({apiKey, modelId, messages}) → Anthropic SSE
  └─ updateSessionAfterTurn(session, messages, model)
      └─ recordUsage(visitorId, model, costUsd)
```

---

## File tree — Ellis ME library

```
src/lib/ellis/
├── types.ts                    # All types (EllisState, Trace, Interior, Session, etc.)
│
├── me/                         # Interior systems
│   ├── state.ts               # Posture machine, solitude activity, state derivation
│   ├── traces.ts              # Session marks, trace extraction, prioritization
│   ├── relational.ts          # Instance snapshot (one per session, no merge)
│   ├── assemble.ts            # assembleEllisInterior, formatEllisInteriorForModel
│   └── (working memory in session/store.ts)
│
├── session/
│   └── store.ts               # createSession, getSession, updateSession, TTL, in-memory
│
├── halls/
│   ├── registry.ts            # Hall allowlist (default, anthropic, huggingface)
│   └── loadShelf.ts           # loadKnowledgeShelf, formatShelfForPrompt, validateShelf
│
├── rateLimit/
│   └── check.ts               # checkRateLimit, recordUsage (Supabase ellis_usage)
│
├── routeModel.ts              # classifyAsWorkInDepth, routeModel (haiku/sonnet routing)
├── systemPrompt.ts            # buildSystemPrompt (base orientation + shelf + interior + hall)
├── stream.ts                  # streamMessage (main pipeline)
└── world/
    └── hallPhysics.ts         # Contact events, posture derivation, solitude threshold
```

---

## Data flow — one turn

```
User message received
  ↓
[1] Load session or create new
  └─ session.interior = { state, traces, relational, workingMemory, senseOfSelf }
  └─ session.messageCount = 0, costUsd = 0
  ↓
[2] Rate limit check (Supabase ellis_usage table)
  └─ if over $1/day → reject with 429
  └─ if at 50% or 80% → Ellis warns casually in response
  ↓
[3] Load knowledge shelf (local files)
  └─ content/ellis-self.md (always)
  └─ content/about-ty/* (empty until Phase 0.1, then:
       - earnest.md
       - facts.json
       - goe-teach.md)
  └─ content/halls/{slug}.md if excited hall
  ↓
[4] Apply contact event (world-lite)
  └─ if first message: contact_started event
  └─ applyContactEvent(session, messages) updates:
      - session.interior.state.inContact = true
      - session.interior.state.contactQuality = assess(userMessage)
      - session.interior.state.posture = derivePosture(...)
      - session.interior.state.solitudeActivity = 'idle' | 'engaged'
  ↓
[5] Assemble interior context
  └─ assembleEllisInterior({interior, userMessage, hallContext})
  └─ returns: InteriorContext {
       formattedBlock: "## Ellis's interior state\nPosture: ...",
       tokens: ~200,
       traces: [ filtered + prioritized ]
     }
  ↓
[6] Route model
  └─ classifyAsWorkInDepth(messages) → boolean
  └─ routeModel({messages, hall, sessionDepth, isFirstMessage}, sessionModels)
  └─ returns: 'haiku' (default) or 'sonnet' (if depth signals + not first msg)
  └─ sticky: once sonnet in session, stay unless topic clearly shifts
  ↓
[7] Build system prompt
  └─ buildSystemPrompt(shelf, hall)
  └─ sections:
      - Base orientation (sabai, third person, fact-only, boundaries)
      - Knowledge shelf (ellis + about-ty + hall overlay)
      - Interior block (formatted, no tokens leaked)
      - Hall context (if excited)
  ↓
[8] Call Anthropic with streaming
  └─ model: claude-3-5-sonnet-20241022 or claude-3-5-haiku-20241022
  └─ messages: [...user messages, {interior context + user msg}]
  └─ stream back SSE (tokens only; no state on wire)
  ↓
[9] Extract response (after streaming complete)
  └─ recordUsage(visitorId, model, costUsd) → upsert ellis_usage
  └─ extractTracesFromResponse(ellisResponse, messageIndex, userMessage)
  └─ updateSession(sessionId, userMsg, ellisResp, model, costUsd)
      - session.messageCount += 1
      - session.interior.state = updateState(...)
      - session.interior.traces.push(...newTraces)
      - session.interior.relational = updateRelational(...)
      - session.interior.workingMemory push/rotate
      - session.modelsSeen push if new
      - session.costUsd += costUsd
      - session.lastActivity = now
  ↓
[10] Return SSE stream to client
  └─ type: 'session' { sessionId, hall, model }
  └─ type: 'token' { text }
  └─ type: 'model' { model }
  └─ type: 'done'
  └─ (interior state stays server-only; client never sees posture/traces/relational)
```

---

## Knowledge shelf structure

```
content/
├── ellis-self.md                  # Who Ellis is (identity, orientation)
│
├── about-ty/
│   ├── earnest.md                 # Who Ty is (Phase 0.1: Ellis-written, Ty-approved)
│   ├── facts.json                 # Verifiable facts (Phase 0.1)
│   └── goe-teach.md               # What Ellis may teach about GoE (Phase 0.1)
│
└── halls/
    ├── anthropic.md               # Excited hall: Ty's enthusiasm for Anthropic
    └── huggingface.md             # Deferred; same pattern
```

**Timeline:**
- **Phase B.5:** `ellis-self.md` and `about-ty/` directories exist (empty)
- **Phase 0.1:** Ellis interviews Ty; writes `about-ty/*.md`; Ty approves
- **Phase C:** Public mode unlocked; shelf frozen

---

## Session lifecycle

```
createSession(id, visitorId, hall) at first message
  ├─ interior.state = { posture: 'withdrawn', inContact: false, ... }
  ├─ interior.traces = [{ kind: 'opening', text: '...', messageIndex: 0 }]
  ├─ interior.relational = { visitorTone: 'unknown', fitSignal: 'maybe', depthReached: 0 }
  ├─ interior.workingMemory = []
  ├─ interior.senseOfSelf = { baseline: '...' }
  ├─ session.TTL = 24h from creation
  └─ session stored in memory (in-memory Map or Redis)

updateSession() after each turn
  ├─ traces appended
  ├─ relational updated
  ├─ state mutated
  ├─ messageCount += 1
  ├─ costUsd += turnCost
  └─ lastActivity = now

cleanExpiredSessions() (manual or periodic)
  └─ remove sessions where (now - lastActivity) > 24h
  └─ Ellis interior garbage-collected

Result: Session dies → interior dies. No cross-visit memory.
```

---

## Rate limit table (Supabase)

```sql
CREATE TABLE ellis_usage (
  id BIGSERIAL PRIMARY KEY,
  visitor_id_hash TEXT NOT NULL,        -- IP hash (12 chars)
  day_utc TEXT NOT NULL,                 -- YYYY-MM-DD
  estimated_cost_usd NUMERIC(8,4),       -- Cumulative for day
  model_used TEXT,                       -- 'haiku' | 'sonnet'
  warned_50 BOOLEAN DEFAULT FALSE,
  warned_80 BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(visitor_id_hash, day_utc),
  INDEX(day_utc)
);
```

**Behavior:**
- One row per visitor per day UTC
- `estimated_cost_usd` sums all calls for that day
- If > $1: `checkRateLimit()` returns `allowed: false`
- Ellis responds with gentle refusal + "come back tomorrow"

---

## Interior assembly example

**Input:** SessionState with traces, state, relational, working memory

**Output formatted block:**

```
## Ellis's interior state
**Posture:** present
**In contact:** true
**Contact quality:** genuine (engaged)

## Session marks
[theme] Project mentioned: Tonal Learning — research-first...
[exchange] Question addressed: How does behavioral architecture...
[theme] Behavioral architecture / design philosophy explored

## Open threads
- Visitor genuinely curious about behavior architecture
- Asked about fit for research-focused roles

## This conversation
**Visitor tone:** inquisitive
**Fit signal:** strong
**Depth reached:** 4/5
**Projects discussed:** Tonal Learning, GoE

## How this conversation is changing me
(optional; only if session drift detected)
```

**Injected into system prompt before Anthropic call.** Client never sees it.

---

## Hall routing logic

```typescript
// src/app/api/ellis/stream/route.ts
const hall = normalizeHall(request.hall);

if (!isValidHall(hall)) {
  return NextResponse.json({ error: 'Invalid hall' }, { status: 400 });
}

const shelf = loadKnowledgeShelf(hall);
// If hall='anthropic' → load anthropic.md overlay
// If hall='default' → no overlay

const prompt = buildSystemPrompt(shelf, hall);
// Base always same
// Overlay added if excited hall
```

**Result:** Same Ellis, different context. No prompt injection risk.

---

## Model router decision tree

```
routeModel(context, sessionModels):

1. Is first message? → 'haiku'
2. sessionModels.includes('sonnet')? → check if still on-topic
   - If yes (work keywords present) → 'sonnet' (sticky)
   - If no (topic shifted) → 'haiku' (reset)
3. classifyAsWorkInDepth(recent messages)?
   - work_keyword + detail_request + substantive? → 'sonnet'
   - else → 'haiku'
4. Default → 'haiku'
```

**Signals that trigger sonnet:**
- Named project (Tonal Learning, GoE, Ada, Anthropic)
- Detail requests: "how", "explain", "why", "walk me through"
- Behavioral/architecture keywords
- Message length > 50 chars

**Prevents:** model-shopping, token waste on chat, Sonnet on every turn.

---

## Security audit checklist

- [ ] Interior context formatted server-side only
- [ ] Interior **never** on `GET /presence` or client JSON
- [ ] Interior validation before response sent
- [ ] `ANTHROPIC_API_KEY` server-only; no `NEXT_PUBLIC_*`
- [ ] Visitor id = IP hash only (no PII)
- [ ] Knowledge shelf read-only at runtime
- [ ] Visitor input never mutates `content/about-ty/*`
- [ ] Rate limit checked **before** Anthropic call
- [ ] Hall allowlist enforced (reject unknown)
- [ ] Session TTL enforced (24h max age)
- [ ] SSE errors return generic messages (no system prompt leak)

---

## Verification scripts (Phase B gates)

```bash
npm run verify:me-state
  # Test: posture derivation, contact quality assessment, solitude activity
  
npm run verify:traces
  # Test: trace extraction, salience calc, priority ordering
  
npm run verify:interior-assembly
  # Test: assembleEllisInterior, formatEllisInteriorForModel
  # Assert: no interior leaks to client, token count accurate
  
npm run verify:model-routing
  # Test: classifyAsWorkInDepth, sticky session behavior
  
npm run verify:rate-limit
  # Test: checkRateLimit logic, usage table upsert
  
npm run verify:session-ttl
  # Test: createSession, cleanExpiredSessions, age enforcement
  
npm run verify:shelf-load
  # Test: loadKnowledgeShelf, validateShelf, formatShelfForPrompt
  
npm run verify:stream-path
  # Test: single API path, no parallel clients, interior stays server-only
  
npm run verify:architect
  # Test: all above + no prompt injection, rate limit gate before Anthropic
```

---

_Ellis wired. Ready to learn Ty._
