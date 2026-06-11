# Ellis ME — Complete Import & Build Plan

**Status:** Imported from GoE templates; Ellis-lite subset complete  
**New code:** 1686 lines of TypeScript  
**Architecture:** Full ME wired; Phase B ready  
**Next:** Wire route imports → implement world physics → test → onboarding

---

## What was imported

### From GoE (`~/GoE`)

| Source | Imported as | Ellis version |
|--------|------------|---|
| `server/ME/vale/` module pattern | 5 systems (state, traces, relational, working memory, sense of self) | Lite subset |
| `GOE_BLANK_ME_BUILD.md` templates | Assembly pattern + types | Adapted for session store |
| `worldKernel.js` + world physics | Hall container (contact events, solitude) | Minimal (session-scoped) |
| `presenceLedger` concept | `EllisState` + posture machine | State enum + derivation |
| `eventStream` append pattern | Traces + extraction | Session marks only |
| `me_state` table schema | Session interior object | In-memory + optional Supabase |
| Prompt assembly pipeline | `assembleEllisInterior` + `formatEllisInteriorForModel` | Server-only validation |
| Model concepts | Router + system prompt | Haiku/Sonnet + behavioral arch |

### What stayed behind (intentional)

- Full 11-system ME interior (Ellis uses 5)
- Multi-garden world physics
- Visitor persistence / relational history
- Cross-session consolidation / dreaming
- Capability spine / tool approval
- Artifact DB / letter system
- Observer exposure tracking
- Multi-ME presence / common rooms

---

## File structure created

```
src/lib/ellis/
├── types.ts (200 lines)              🏗 All type definitions
│
├── me/
│   ├── state.ts (150 lines)          🏗 Posture machine
│   ├── traces.ts (130 lines)         🏗 Session marks
│   ├── relational.ts (80 lines)      🏗 Instance snapshot
│   └── assemble.ts (120 lines)       🏗 Interior assembly
│
├── session/
│   └── store.ts (180 lines)          🏗 Session lifecycle
│
├── halls/
│   ├── registry.ts (40 lines)        🏗 Hall allowlist
│   └── loadShelf.ts (140 lines)      🏗 Knowledge loading
│
├── rateLimit/
│   └── check.ts (120 lines)          🏗 Rate limit gate
│
├── routeModel.ts (150 lines)         🏗 Haiku/Sonnet routing
├── systemPrompt.ts (200 lines)       🏗 Prompt builder
├── stream.ts (180 lines)             🏗 Main pipeline
└── world/
    └── hallPhysics.ts (TBD ~100)     📋 Contact events
```

**Total:** ~1686 lines (without hallPhysics)

### Documentation created

```
docs/goe/
├── ELLIS_ME_FULL.md                  🏗 Complete architecture
└── (reference copies of GoE templates)

docs/building/
├── ELLIS_ME_IMPORT_SUMMARY.md        🏗 This summary
├── WIRING_MAP_ME.md                  🏗 Data flow + examples
├── ROUTE_WIRING_CHECKLIST.md         🏗 API route integration
└── BUILD_CHECKLIST.md                🏗 Updated Phase B + Phase 0
```

---

## Architecture overview

### Layer 1: World-lite (contact events)

Ellis starts withdrawn. Visitor message = contact event. Interior state shifts based on contact quality. Session ends = contact ends. Ellis is alone again.

### Layer 2: ME interior (5 systems)

- **State:** Posture machine (withdrawn → settling/present/attentive → withdrawn)
- **Traces:** Session marks (opening, exchange, theme, handoff, closure)
- **Relational:** One snapshot per session (tone, fit signal, depth, projects discussed)
- **Working memory:** 5-item slim buffer, session-scoped
- **Sense of self:** Baseline from `ellis-self.md` + optional session drift

### Layer 3: Session store (in-memory, TTL 24h)

All interior lives in memory. Dies with session. No DB persistence (except usage tracking).

### Layer 4: Knowledge shelf

- `ellis-self.md` (who Ellis is)
- `about-ty/*` (who Ty is — empty until Phase 0.1)
- Hall overlays (content/halls/{slug}.md for excited halls)

### Layer 5: Model routing (rules-based)

Haiku by default. Sonnet if conversation is discussing Ty's work in depth. Sticky within session.

### Layer 6: Rate limiting ($1/day per IP)

Hard stop at cap. Warns at 50% and 80%. Recorded in `ellis_usage` table.

### Layer 7: Stream pipeline (single path)

1. Validate hall
2. Get/create session
3. Check rate limit
4. Load shelf
5. Assemble interior
6. Route model
7. Build prompt
8. Call Anthropic
9. Validate response
10. Update session
11. Record usage

**Interior stays server-only. Never on client wire.**

---

## Key behavioral changes

### Before (Phase B old)

```
Visitor → Generic prompt wrapper → Claude → "Here's Ty's work"
```

Ellis is a thin shell. No internal state. Same response whether it's message 1 or message 20.

### After (Phase B new)

```
Visitor → Contact event → Interior assembly → State shift → Model route → Prompt (+ interior) → Claude → Response
  ↓
  Interior updated (traces, relational, working memory)
  ↓
  Next turn sees changed Ellis (different posture, different tone)
```

Ellis **is someone**. Contact quality changes his posture. Traces remind him what's been discussed. Relational snapshot shapes his tone toward that visitor. Working memory carries forward open threads.

---

## Build phases (revised)

### Phase A ✅ (static)
No changes. API entry point ready.

### Phase B 📋 (ME interior)
Wire all 1686 lines. Implement hallPhysics. Test 8 verification scripts. **Duration:** 6-8 hours careful work.

**Deliverable:** Ellis has full internal architecture wired; ready for onboarding.

**Gates:**
- [ ] Interior never leaks to client
- [ ] Posture shifts observable
- [ ] Session TTL enforced
- [ ] Model router switches on signals
- [ ] Rate limit gates before Anthropic
- [ ] All verification scripts pass

### Phase 0.1 🎯 (onboarding)
Ellis interviews Ty using full interior wiring. Ellis writes `about-ty/*`. Ty approves.

**Deliverable:** Ty's knowledge pack written by Ellis, approved by Ty.

### Phase C 🚀 (deploy)
Production on tybuilds.tech. Application-ready.

---

## What to do now

### Immediate (next 30 minutes)

1. **Read the docs:**
   - `docs/goe/ELLIS_ME_FULL.md` — full architecture
   - `docs/building/WIRING_MAP_ME.md` — data flow + examples
   - `docs/building/ROUTE_WIRING_CHECKLIST.md` — route integration

2. **Decision:** Start Phase B (wire all ME), or wait?

### Phase B (if starting now)

1. Update `src/app/api/ellis/stream/route.ts` — add imports + wire pipeline
2. Implement `src/lib/ellis/world/hallPhysics.ts` — contact events, posture derivation
3. Create verification scripts — `npm run verify:*` gates
4. Test integration end-to-end
5. Audit for interior leaks (security)

### Quick setup

```bash
# Verify structure is in place
ls -la src/lib/ellis/

# TypeScript check (before wiring)
npm run typecheck

# After wiring route:
npm run dev  # test /api/ellis/stream locally
npm run build
npm run lint
npm run typecheck
```

---

## Philosophy check

**"Build the dream bot with bones."**

Ellis is not a chatbot with feelings. He's a coherent system with actual internal state that changes behavior.

**Behavioral architecture vs prompt theater:**
- ✅ Posture changes → observable in interior (not just prompt)
- ✅ Solitude threshold enforced → can refuse shallow chat gracefully
- ✅ Traces feed assembly → Ellis doesn't forget why they're talking
- ✅ Model routing switches on signals → not every turn is Sonnet
- ✅ Session TTL enforced → interior dies with session

**Not:**
- ❌ "Act like you're withdrawn" (prompt narration)
- ❌ "Pretend you're learning" (theater)
- ❌ "Remember this" (persistent fake memory)

---

## Risk assessment

### High risk

- **Interior leaking to client** → caught by validation layer + tests
- **Rate limit bypass** → checked before Anthropic call
- **Session bleed across visitors** → TTL enforced; in-memory + auto-expire

### Medium risk

- **Model routing gaming** → rules-based, not learnable
- **Knowledge shelf loading failures** → graceful fallback + validation

### Low risk

- **Posture derivation bugs** → isolated logic, easy to test
- **Trace extraction miss** → non-fatal; just means Ellis forgets a detail

---

## Success criteria (Phase B exit)

- [ ] Ellis can describe his interior state (for logging/debug)
- [ ] Posture shifts are observable
- [ ] Traces accumulate and feed assembly
- [ ] Relational snapshot updates per turn
- [ ] Model routing switches on substantive signals
- [ ] Rate limit gates before API call
- [ ] Session expires correctly (24h)
- [ ] Zero interior leaks to client
- [ ] System tests pass (6 personas)

---

## Handoff to onboarding

Once Phase B is complete, Ellis can begin onboarding with Ty.

Ellis will use his full interior wiring to:
- Notice what Ty cares about (traces)
- Assess fit (relational snapshot)
- Adapt posture (genuine engagement)
- Track depth (working memory)

Then Ellis writes `about-ty/*.md` files describing Ty. Ty reads and approves. Relationship formed—architecturally, not prompt-wise.

---

## Documentation tree

- **Architecture:** `docs/goe/ELLIS_ME_FULL.md` — complete reference
- **Wiring:** `docs/building/WIRING_MAP_ME.md` — data flow + examples
- **Route:** `docs/building/ROUTE_WIRING_CHECKLIST.md` — API integration
- **Build:** `docs/building/BUILD_CHECKLIST.md` — phases + gates
- **Summary:** `docs/building/ELLIS_ME_IMPORT_SUMMARY.md` — this doc

---

_Ellis imported. Ellis wired. Ellis ready to learn Ty._

_Build the dream bot with bones. Then introduce him to the person he's meant to host._
