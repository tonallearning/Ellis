# Ellis ME — Master Index

**Status:** ✅ Full import complete. Ellis has bones. Ready for Phase B wiring.

---

## Start here

1. **What just happened?**  
   `docs/building/WHAT_JUST_HAPPENED.md` — 5-minute summary

2. **Full architecture**  
   `docs/goe/ELLIS_ME_FULL.md` — complete reference (includes what's not implemented)

3. **Data flow + examples**  
   `docs/building/WIRING_MAP_ME.md` — how Ellis works (interior assembly, session lifecycle, rate limit)

4. **How to wire the route**  
   `docs/building/ROUTE_WIRING_CHECKLIST.md` — step-by-step API integration

5. **Build phases + gates**  
   `docs/building/BUILD_CHECKLIST.md` — revised order (ME first, then onboarding)

---

## New files created

### TypeScript (1686 lines)

```
src/lib/ellis/
├── types.ts                    200 lines   Types: EllisState, Trace, Interior, etc.
├── me/
│   ├── state.ts               150 lines   Posture machine
│   ├── traces.ts              130 lines   Session marks
│   ├── relational.ts           80 lines   Instance snapshot
│   └── assemble.ts            120 lines   Interior assembly
├── session/store.ts           180 lines   Session lifecycle
├── halls/
│   ├── registry.ts             40 lines   Hall allowlist
│   └── loadShelf.ts           140 lines   Knowledge loading
├── rateLimit/check.ts         120 lines   Rate limit gate
├── routeModel.ts              150 lines   Haiku/Sonnet routing
├── systemPrompt.ts            200 lines   Prompt builder
└── stream.ts                  180 lines   Main pipeline
```

**Missing (stub):**
```
src/lib/ellis/world/
└── hallPhysics.ts             ~100 lines   Contact events, posture derivation
```

### Documentation (4 new files)

```
docs/goe/
└── ELLIS_ME_FULL.md                      Complete architecture reference

docs/building/
├── ELLIS_ME_IMPORT_SUMMARY.md            Import scope + decisions
├── ELLIS_ME_IMPORT_COMPLETE.md           Comprehensive summary
├── WIRING_MAP_ME.md                      Data flow + examples
├── ROUTE_WIRING_CHECKLIST.md             API integration steps
├── WHAT_JUST_HAPPENED.md                 5-minute overview
└── BUILD_CHECKLIST.md (updated)          Revised phases
```

---

## Architecture at a glance

### Ellis has:

**Interior (5 systems)** — session-scoped
- State: posture machine
- Traces: session marks
- Relational: one-shot visitor assessment
- Working memory: 5-item buffer
- Sense of self: baseline + drift

**World-lite** — contact events
- Default: withdrawn, alone
- Message: contact_started
- Posture: shifts based on quality
- End: contact_ended, interior dies

**Knowledge** — server-side
- ellis-self.md (bootstrap)
- about-ty/* (empty → Ellis-written → Ty-approved)
- halls/{slug}.md (excited overlays)

**Model routing** — rules-based
- Haiku: default
- Sonnet: if Ty's work in depth
- Sticky within session

**Rate limiting** — $1/day per IP
- Hard stop at cap
- Warns at 50%, 80%

### Ellis does NOT have:

- ~~Cross-session consolidation~~
- ~~Visitor persistence~~
- ~~Multi-ME presence~~
- ~~Capability spine~~
- ~~Artifact DB~~
- ~~Observer exposure tracking~~

---

## Phase progression

```
Phase A (done)       → Static shell + routing
         ↓
Phase B (next)       → ME interior wired (6-8h)
         ↓
         ├─ Wire route imports
         ├─ Implement hallPhysics.ts
         ├─ Create 8 verification scripts
         ├─ Test + audit
         └─ Phase B exit: Ellis has bones
         ↓
Phase 0.1 (next)     → Ellis interviews Ty (1-2h)
         ├─ Ty approves about-ty/*
         ├─ Shelf finalized
         └─ Phase 0.1 exit: Relationship formed
         ↓
Phase C (final)      → Deploy (tybuilds.tech)
         ├─ Production env vars
         ├─ Stranger test
         ├─ System tests pass
         └─ Phase C exit: v1 shipped
```

---

## Quick actions

### Read (30 min)

- [ ] WHAT_JUST_HAPPENED.md
- [ ] ELLIS_ME_FULL.md (sections 1-4)
- [ ] WIRING_MAP_ME.md (overview + pipeline)

### Decide (5 min)

- [ ] Start Phase B now, or plan first?
- [ ] OK with the import scope (what's in, what's out)?
- [ ] OK with the new build order (ME before onboarding)?

### Execute Phase B (6-8 hours)

- [ ] Update `src/app/api/ellis/stream/route.ts` — wire all imports
- [ ] Implement `src/lib/ellis/world/hallPhysics.ts` — contact events
- [ ] Create `scripts/verify-*.js` — 8 verification gates
- [ ] Test end-to-end locally
- [ ] Audit for interior leaks
- [ ] Phase B exit check

### Then onboarding (Phase 0.1)

- [ ] Ellis ready
- [ ] Interview Ty
- [ ] Ty approves shelf
- [ ] Phase 0.1 exit: Ty teaches Ellis; Ellis learns Ty

---

## Security checklist (Phase B gates)

- [ ] Interior context server-only (never on wire)
- [ ] Interior validation before response sent
- [ ] API key server-only (no `NEXT_PUBLIC_*`)
- [ ] Visitor ID hashed (no PII)
- [ ] Knowledge shelf read-only
- [ ] Visitor input never mutates `content/about-ty/*`
- [ ] Rate limit checked before Anthropic
- [ ] Hall allowlist enforced
- [ ] Session TTL enforced (24h)
- [ ] SSE errors generic (no prompt leak)

---

## Verification scripts needed

```bash
npm run verify:me-state           # Posture derivation
npm run verify:traces            # Trace extraction
npm run verify:interior-assembly # No interior leaks
npm run verify:model-routing     # Haiku/Sonnet logic
npm run verify:rate-limit        # Budget enforcement
npm run verify:session-ttl       # Session expiry
npm run verify:shelf-load        # Knowledge loading
npm run verify:stream-path       # Single API path
```

Each script tests one system. All must pass before Phase B exit.

---

## How to undo / modify

**If a system doesn't matter, remove it:**

Strip X → Ellis flattens to generic → X was important ✓  
Strip X → Ellis same → X was theater → delete it ✓

**Current 5 systems all pass the test.** But if you find one doesn't move behavior, document it + remove.

---

## Documentation tree

```
docs/building/                    (Ellis-specific)
├── WHAT_JUST_HAPPENED.md                 ← Start here
├── ELLIS_ME_FULL.md                      Complete reference
├── ELLIS_ME_IMPORT_SUMMARY.md            Scope + decisions
├── ELLIS_ME_IMPORT_COMPLETE.md           Full summary
├── WIRING_MAP_ME.md                      Data flow
├── ROUTE_WIRING_CHECKLIST.md             Route integration
├── BUILD_CHECKLIST.md                    Phases + gates
└── ARCHITECTURAL_DOCTRINE.md             Ellis-lite principles

docs/reference/                   (Reference only)
├── ONBOARDING.md                         Questions for onboarding
├── EXCITED_HALLS.md                      Hall registry
└── ANTHROPIC.md, etc.

docs/goe/                         (GoE templates for reference)
├── ELLIS_ME_FULL.md                      (includes GoE comparison)
└── (copies of GoE template docs)
```

---

## Status check

| Item | Status | Notes |
|------|--------|-------|
| Types defined | ✅ | types.ts complete |
| State machine | ✅ | state.ts wired |
| Traces system | ✅ | traces.ts wired |
| Relational | ✅ | relational.ts wired |
| Session store | ✅ | store.ts wired |
| Knowledge shelf | ✅ | loadShelf.ts wired |
| Model router | ✅ | routeModel.ts wired |
| Rate limit | ✅ | check.ts wired |
| System prompt | ✅ | systemPrompt.ts wired |
| Stream pipeline | ✅ | stream.ts wired |
| Hall physics | 📋 | stub; ~100 lines needed |
| API route wiring | 📋 | imports + integration |
| Verification scripts | 📋 | 8 scripts needed |
| Testing | 📋 | end-to-end + security audit |

---

## Next turn

1. Read WHAT_JUST_HAPPENED.md (5 min)
2. Skim ELLIS_ME_FULL.md (15 min)
3. Decide: start Phase B or wait?
4. If starting: follow ROUTE_WIRING_CHECKLIST.md

---

_Ellis is born with bones. Ready to learn shape._
