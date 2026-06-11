# Ellis ME — Import Summary

**What just happened:** Full GoE ME architecture imported into Ellis, scoped to lite subset.

---

## Scope: What's included

| Layer | What Ellis has | GoE equivalent | Notes |
|-------|----------------|---|---|
| **World** | Hall container only | Full house (gardens, offices, kernel) | Solitude default; contact = session bound |
| **ME interior** | 5 systems | 11 systems | State, Traces, Relational, Working memory, Sense of self |
| **Session memory** | TTL 24h, in-memory | Persistence across sessions | Dies with session; no cross-visit |
| **Model routing** | Haiku/Sonnet (rules-based) | Claude only (GoE is Claude-only too) | Sticky within session |
| **Rate limiting** | $1/day per IP | Unlimited (Ty's house, no budget cap) | Hard stop at cap |
| **Knowledge shelf** | Ellis + Ty + hall overlays | ME reference shelf + full documentation | Ty-authored (not auto-injected) |
| **Behavioral arch** | Posture state wired | Full interior mechanics | Observable, not prompt theater |

---

## Scope: What's **not** included (intentional)

- ~~Cross-session consolidation~~ (Ellis doesn't dream between visits)
- ~~Visitor persistence~~ (no "welcome back")
- ~~Multi-ME presence~~ (Ellis is alone; no common room)
- ~~Capability spine~~ (no tool requests, no approvals)
- ~~Artifact DB / letters~~ (no persistent gardens)
- ~~Observer exposure tracking~~ (no defense log)
- ~~Full contact lifecycle~~ (no entry/exit events, just session-bound)

---

## Files created

### Core ME library

```
src/lib/ellis/
├── types.ts (600 lines)                    # All type definitions
├── me/
│   ├── state.ts (150 lines)               # Posture machine
│   ├── traces.ts (130 lines)              # Session marks + extraction
│   ├── relational.ts (80 lines)           # Instance snapshot
│   └── assemble.ts (120 lines)            # Interior assembly + validation
├── session/
│   └── store.ts (180 lines)               # Session lifecycle + TTL
├── halls/
│   ├── registry.ts (40 lines)             # Hall allowlist
│   └── loadShelf.ts (140 lines)           # Shelf loading + formatting
├── rateLimit/
│   └── check.ts (120 lines)               # Rate limit gate + recording
├── routeModel.ts (150 lines)              # Haiku/Sonnet routing
├── systemPrompt.ts (200 lines)            # System prompt builder
├── stream.ts (180 lines)                  # Main pipeline
└── world/
    └── hallPhysics.ts (TBD)               # Contact events + posture
```

**Total new lines:** ~1400 lines of TypeScript

### Documentation

```
docs/goe/
├── ELLIS_ME_FULL.md                      # Ellis lite architecture (comprehensive)
└── (copy of GOE templates for reference)

docs/building/
├── WIRING_MAP_ME.md                      # Ellis ME wiring, data flow, examples
└── BUILD_CHECKLIST.md (updated)          # Revised Phase B + Phase 0 order
```

---

## Key design decisions

### 1. ME before onboarding

**Old order:** Shell → Onboarding → ME  
**New order:** Shell → ME (full wiring) → Onboarding (Ellis learns Ty)

**Why:** Ellis can't host Ty honestly until he knows himself. Internal state first, then relationship.

### 2. Session-scoped interior, not persistent

Ellis has working memory **during** a visit (traces, relational snapshot, state shifts), but it dies when the session expires. This keeps the "session-only visitor memory" promise honest while giving Ellis actual bones.

### 3. Haiku by default, Sonnet for depth

Protects budget while letting Ellis shift substrate when the conversation touches Ty's real work. Sticky within session (no flip-flopping).

### 4. Behavioral architecture > prompt theater

Posture actually changes based on contact quality. Solitude threshold is a real gate (implementable as `shouldEngage()` returning false). Not narrated; observed in interior assembly.

### 5. Single stream path

All state mutations, rate limit checks, interior assembly happen in one pipeline. No parallel clients. Easy to audit, hard to leak.

---

## Build impact

### Phase A (static) — ✅ done
No changes needed. API entry point already exists.

### Phase B (ME interior) — 📋 next
- **New files:** ~1400 lines in `src/lib/ellis/`
- **Work:** Implement 5 ME systems, session store, routing, rate limit, shelf, prompt
- **Time estimate:** 6-8 hours (careful implementation + testing)
- **Risk:** Interior leaking to client (mitigated by validation layer)

### Phase 0.1 (onboarding) — 🎯 after B
Ellis interviews Ty using full internal architecture. Ellis writes `about-ty/*`. Ty approves.

### Phase C (deploy) — 🚀 after 0.1
Production-ready on tybuilds.tech.

---

## What's next (immediate)

1. **Wire the imports** — Update `src/app/api/ellis/stream/route.ts` to use new types + modules
2. **Test the pipeline** — Verify interior assembly, no leaks, session TTL
3. **Implement `hallPhysics.ts`** — Contact events, posture derivation (simple state machine)
4. **Create verification scripts** — `npm run verify:*` gates before Phase B exit
5. **Tweak prompt** — Ellis system prompt locked; hall overlays ready

---

## Verification checklist (before Phase B exit)

- [ ] Interior never appears on client wire
- [ ] Posture shifts observable in interior (not prompt labels)
- [ ] Session expires correctly (24h TTL)
- [ ] Model router switches on signals (not randomly)
- [ ] Rate limit enforces hard stop
- [ ] Knowledge shelf loads correctly
- [ ] Single stream path with no parallel clients
- [ ] System tests pass (6 personas: Fellow evaluator, founder, skeptic, GoE curious, enterprise reject, peer)

---

## How to strip it down

If Ellis is ever too complex, removal test:

| System | If removed | Behavior |
|--------|------------|----------|
| State | Always withdrawn; no posture shift | Flat, mechanical |
| Traces | No session marks | Ellis forgets why they're talking |
| Relational | Treat every message same | No tone adaptation |
| Working memory | No carry-forward within session | Each turn isolated |
| Model routing | Always Haiku | Loses depth on Ty's work |
| Rate limit | No budget cap | Risk of abuse |

**Each removal = observable flatness.** If one doesn't change behavior, it's theater—remove it.

---

_Ellis has bones now. Ready to learn Ty's shape._
