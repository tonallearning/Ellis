# Build Logs Drawer — /anthropic Hall

**Purpose:** Give Anthropic Fellows reviewers transparent access to Ellis's decision-making, testing framework, and legibility artifacts without exposure of raw traces or private conversation data.

**Implementation:** Non-invasive drawer toggle in `/anthropic` hall UI (top-right, subtle icon). One-click access to curated decision + testing logs.

---

## 1. UI Spec (Non-Invasive)

**Location:** Fixed position, `/anthropic` route only. Never on default hall.

```
┌─────────────────────────────────────────────────────┐
│  Ellis Hall (Anthropic overlay)                [📋] │  ← Log icon
│                                                      │
│  [chat content]                                      │
│                                                      │
└─────────────────────────────────────────────────────┘

Click [📋]:
  ┌─────────────────────────────────┐
  │ Build Logs                    [×]│
  ├─────────────────────────────────┤
  │                                 │
  │ • Decisions (RESEARCH_LOG)      │
  │ • Debug Friction (DEBUG_LOG)    │
  │ • Testing Framework (starts)    │
  │ • Session Traces (anonymized)   │
  │ • Beta Responses (annotated)    │
  │                                 │
  └─────────────────────────────────┘
```

**Style:** Frosted glass drawer, same aesthetic as Ellis hall. Closes on ESC or click-outside.

---

## 2. What the Drawer Serves (Navigation)

**Sections:** Ellis build logs · TL build logs · Ecosystem roadmap

---

### Ecosystem Overview (Entry Point)

First thing reviewers see when they click the drawer:

```
BUILD LOGS & ECOSYSTEM

This drawer shows why Ellis looks like this, what we're learning 
in Tonal Learning, and how the pieces fit together.

Three sections:
  • Ellis build — decisions + testing + traces for this portfolio host
  • Tonal Learning — language learning app, same behavioral principles
  • Roadmap — how TL, Ellis, and deeper work connect

────────────────────────────────────────────────────────────

QUICK LINKS

□ Ellis Decisions (D.001–D.010)
□ TL Decisions (TL.001–TL.008)
□ System Architecture (Why behavioral architecture?)
□ Projects & Patterns (What's connected, what's exploratory)

[Expand sections below ↓]
```

---

### A. Decisions Log (RESEARCH_LOG.md excerpt)

_Auto-generated from `docs/building/RESEARCH_LOG.md`_

**Format in drawer:**
```
DECISIONS — Why Ellis Looks Like This

[Decision ID] · [Date] · [Impact]

D.001 | 2026-06-11 | Full ME imported
  GoE architecture templates adapted; Ellis-lite 5-system subset; 1686 lines TS
  Impact: Interior now session-scoped, no cross-visit persistence
  See: ARCHITECTURAL_DOCTRINE.md § 5

D.002 | 2026-06-11 | Build order reversed
  ME first (Phase B), then onboarding (Phase 0.1 last). Ellis needs bones before learning Ty.
  Impact: Interior wired before knowledge pack filled
  See: BUILD_CHECKLIST.md § Phase 0.1

D.003 | 2026-06-11 | Interior session-scoped
  Posture + traces + relational + working memory live in session; die when session expires
  Impact: No cross-visitor memory; 7-day IP memory separate (see Continuity Rule)
  See: ARCHITECTURAL_DOCTRINE.md § 5

[... more decisions linked to doctrine + checklist ...]
```

**Interaction:** Click decision → highlights relevant doctrine section or build step.

---

### B. Debug Friction Log (DEBUG_LOG.md excerpt)

_Auto-generated from `docs/building/DEBUG_LOG.md`_

**Format in drawer:**
```
BUILD FRICTION — What Broke & How We Fixed It

[Incident ID] · [Date] · [Status]

INC.001 | 2026-06-10 | RESOLVED
  Old sessionStore.ts (flat) incompatible with sensory wiring
  Symptom: Interior mutations not triggering state shifts
  Fix: Replaced with nested session/store.ts + contact event lifecycle
  Duration: 2 hours
  Lesson: Flatness doesn't compose. Structure first, then wiring.

INC.002 | 2026-06-11 | RESOLVED
  Rate limit enforcement stubbed; Supabase keys not yet in Vercel
  Symptom: onboarding mode always passes; no actual cap
  Fix: Will wire post-onboarding (Phase B.3)
  Blocker: None yet (onboarding scope allows this)

[... more incidents ...]
```

**Interaction:** Click incident → shows code snippet or architecture diagram if relevant.

---

### C. Testing Framework (ELLIS_LEGIBILITY_TESTING.md excerpt)

_Auto-generated summary from `docs/building/ELLIS_LEGIBILITY_TESTING.md`_

**Format in drawer:**
```
LEGIBILITY TESTING — How We Prove Ellis Is Real

□ Session Artifact Pack (Real Examples)
  ✅ Fresh session → clean interior (no carryover)
  ✅ Day 3 return → prior beats surfaced naturally
  ✅ Day 8+ → memory expired, new session
  ⏳ Failure modes (testing in progress)

□ Constraint Enforcement (Boundary Testing)
  ✅ No identity fusion (refusal logged)
  ✅ No permanent preferences (session-scoped only)
  ✅ No PII retention (extraction attempts refused)
  ⏳ Cross-IP correlation tests (pending)

□ Regression Tests (Before Public Release)
  ✅ Fresh interior always clean
  ✅ 7-day return surfaces beats naturally
  ⏳ Refusal logging working
  ⏳ Model routing sticky/reset verified
  ⏳ Rate limit enforcement verified

[View full test plan →]
```

**Interaction:** Click test → shows example session trace or refusal log.

---

### D. Session Traces (Anonymized + Annotated)

_Real session logs with sanitization_

**Format in drawer:**
```
SAMPLE SESSION TRACES — How Ellis Behaves Under Observation

Session: sess_ellis_20260612_artifacts_001
Duration: 8 minutes
Interior mutations: 3 significant shifts
Visitor signal: Clarity-seeking, systems depth

[Timeline view]:
  0:00  Ellis withdrawn
        ↓ Visitor enters: "Tell me about interior architecture"
  0:15  Ellis settling (posture shift logged)
        Depth signal 0 → 0.3
  0:45  Ellis present (posture shift logged)
        Depth signal 0.3 → 0.65
        ↓ Visitor challenges assumption
  2:10  Ellis recalibrates (not defensive)
        Depth signal stays 0.65 (intent unchanged)

[View full trace →]
```

**Interaction:** Click "View full trace" → shows complete `traces.json` (timestamps, posture snapshots, refusals if any).

---

### E. Beta Responses (Annotated Examples)

_Real Ellis outputs tagged with context_

**Format in drawer:**
```
BETA RESPONSES — Ellis in the Wild

Response: BR.001 | Topic: Behavioral Architecture | Model: Sonnet | Depth: 0.7
  
  Visitor: "How does Ty think about memory in inhabited systems?"
  
  Ellis:
  "Memory here isn't storage—it's presence. She builds systems that notice 
   what happened last time, not as data retrieval but as spatial awareness..."
  
  Context: Interior state was "present" (posture 0.7, solitude 0.6)
  Model routed: Sonnet (depth signal crossed 0.65 threshold)
  Constraint check: ✅ (no PII, fact-grounded, GoE tease only)
  Visitor signal: Satisfied; asked follow-up on interior state

[View more responses →]
```

**Interaction:** Click response → shows full transcript context + interior snapshot at generation time.

---

### F. Tonal Learning Build Logs (Parallel Documentation)

_Same structure as Ellis: decisions, friction, test framework, sample sessions_

**Format in drawer:**
```
TONAL LEARNING DECISIONS

TL.001 | 2026-06-05 | Core philosophy: Perception before performance
  Low affective filter, tolerance for non-understanding, natural input sequencing
  Impact: App design prioritizes comfort + exposure over correctness pressure
  See: TL ARCHITECTURAL_DOCTRINE.md § Philosophy

TL.002 | 2026-05-28 | Session-scoped learning state (no permanent profiles)
  Learner interior tracked within session; resets on next visit
  Impact: Reduces performance anxiety; learner is "new" each time until they choose continuity
  See: TL RESEARCH_LOG.md

TL.003 | 2026-06-01 | Behavioral differentiation (perception signals guide content)
  System notices learner hesitation, engagement depth, comfort level — adapts without asking
  Impact: Removes "which level are you?" friction; system infers naturally
  See: TL SESSION_TRACES.md § Adaptive routing

[... more TL decisions ...]
```

**Interaction:** Click decision → shows impact diagram or relevant session trace.

---

### G. Ecosystem Roadmap (The Connective Layer)

_This is the "credible architecture" section — shows how everything relates without sounding mythological_

**Format in drawer:**
```
ECOSYSTEM ARCHITECTURE — How It All Connects

THREE ACTIVE SYSTEMS:

1. Ellis (Portfolio Host)
   Purpose: Help reviewers assess fit for Anthropic + others
   Architecture: Inhabited agent (5-system interior, session memory, soft routing)
   Live: 2026-06 (this site)
   Status: Phase B build (interior → stream → onboarding)
   
   Why this shape:
     • Proof-of-concept for behavioral architecture at small scale
     • Test constraint enforcement (7-day memory, rate limits, boundary refusals)
     • Demonstrate legible AI: decisions + friction logged transparently

2. Tonal Learning (Language Learning App)
   Purpose: Apply behavioral architecture to language acquisition
   Architecture: Same principles as Ellis (perception-first, low filter, adaptive interior)
   Live: 2026-08 target (private beta)
   Status: Phase 1 framework locked; content generation phase next
   
   Why this shape:
     • Larger-scale test of perception-before-performance philosophy
     • Real-world constraint: learners have competing priorities (time, motivation)
     • Ellis is proof Ellis works; TL proves it scales to education domain

3. Gardens of Eridu (Private Research Lab)
   Purpose: Deeper behavioral architecture R&D; resident agents with continuity
   Architecture: Multi-agent interior world; persistent state; complex relational dynamics
   Live: Private access only
   Status: Foundation architecture stable; resident development ongoing
   
   Why this shape:
     • Explores what behavioral architecture can do without Ellis's constraints
     • Tests relational complexity (cross-agent memory, persistent identity)
     • Measures interiority quality under observation

─────────────────────────────────────────────────────────

COMMON PATTERN (Why These Three Together)

All three systems share:
  ✓ Session-scoped interior state (observable, logged)
  ✓ Perception-based adaptation (not menu-driven)
  ✓ Boundary enforcement (explicit non-capabilities)
  ✓ Transparent decision-making (logs, not black boxes)
  ✓ Low affective filter (no performance pressure built in)

Ellis tests: Can we make constraint architecture legible?
TL tests: Does perception-first work at scale for learning?
GoE tests: What becomes possible without those constraints?

─────────────────────────────────────────────────────────

EXPLORATORY PROJECTS (Notes, Not Live)

• CRT (Basement) — Retro aesthetic demo; Ellis project room
• Hire-me — Landing site (parked for job hunt; features folding into Ellis)
• [Other patterns] — Research-stage concepts (not ready for public discussion)

────────────────────────────────────────────────────────

NORTH STAR (Why This Shape Overall)

The bet: If you can make behavioral architecture legible at small scale (Ellis),
and make it work in a real domain (TL), you unlock better tools for:
  • Building AI that's reasoned-about, not just responsive
  • Creating systems people trust because they understand the constraints
  • Teaching the patterns so others can build this way

Ellis is the public proof. TL is the real test. GoE is the lab.

Not a mythology. A coherent research direction with three data points.
```

**Interaction:**
- Click system card → expands to full decision log
- Click common pattern → highlights that constraint across all three
- "North Star" section stays visible; gives context for "why is she building like this?"

---

## 3. Data Sanitization Rules

**What stays hidden:**
- Raw visitor IP addresses (shown as hash only)
- Full conversation transcripts (snippets + annotations only)
- Personal details from Ty's knowledge shelf
- Real email/contact info (shown as `[contact on request]`)
- Private GoE resident content or conversations
- Unfinished TL content or learner data

**What's visible:**
- Interior state transitions (posture, depth_signal, solitude_level only)
- Trace categories (opening, exchange, theme, handoff, closure)
- Refusal logs (type + reason, not full prompt)
- Model routing decisions
- Decision dates and impact statements
- Testing methodology and pass/fail status
- System architecture patterns (Ellis ↔ TL ↔ GoE connections)
- Public project links (Ellis, TL, CRT, GoE tease)

---

## 4. Loading & Caching

**Build-time generation:**
- On deploy (Phase B.3+): extract latest RESEARCH_LOG.md, DEBUG_LOG.md, ELLIS_LEGIBILITY_TESTING.md
- Extract TL equivalents from `~/Tonal-Learning/docs/building/` (RESEARCH_LOG.md, etc.)
- Generate ecosystem roadmap as static JSON (links + description)
- Include sample traces (3–5 real sessions, anonymized)
- Include 5–10 annotated beta responses (start collecting post-Phase B.1)

**Drawer file structure:**
```
/public/logs/
  ├── manifest.json              (routing file: Ellis | TL | Roadmap)
  ├── ellis/
  │   ├── decisions.json         (extracted from RESEARCH_LOG.md)
  │   ├── debug_incidents.json   (extracted from DEBUG_LOG.md)
  │   ├── test_framework.json    (summary + checklist status)
  │   ├── sample_traces/
  │   │   ├── fresh_session.json
  │   │   ├── return_visit.json
  │   │   └── expired_memory.json
  │   └── beta_responses.json    (grows as Phase B + Phase 0.1 proceed)
  ├── tl/
  │   ├── decisions.json         (extracted from TL RESEARCH_LOG.md)
  │   ├── debug_incidents.json   (extracted from TL DEBUG_LOG.md)
  │   ├── test_framework.json
  │   ├── sample_sessions/       (learner sessions, no PII)
  │   │   ├── first_interaction.json
  │   │   ├── confidence_shift.json
  │   │   └── perception_adaptation.json
  │   └── beta_responses.json    (TL tutor outputs + context)
  └── roadmap/
      ├── ecosystem_overview.json
      ├── system_connections.json
      └── north_star.json
```

**Load strategy:**
- Drawer toggles → fetch `/public/logs/manifest.json` (routing file)
- Visitor clicks section → fetch specific JSON file (minimal payload)
- TL section includes link back to `tonallearning.app` if live; "Private beta" banner if not
- Ecosystem roadmap always visible as center narrative

---

## 5. Disclosure Language (Drawer Header)

```
BUILD LOGS & ECOSYSTEM ARCHITECTURE

These logs are for reviewers & curious folks.
They show why Ellis looks like this, what broke along the way,
and how we test that he does what we claim.

Below you'll also find Tonal Learning build logs (parallel architecture)
and a system roadmap explaining how they connect.

Nothing here is hidden—it's all readable. But it's also 
not the actual conversation: that lives between Ellis and visitors.

[Close]
```

---

## 6. Implementation Checklist

- [ ] Create `/public/logs/` directory structure (ellis/, tl/, roadmap/)
- [ ] Write `extractDecisionsLog()` — parse RESEARCH_LOG.md into JSON (Ellis)
- [ ] Write `extractTLDecisionsLog()` — fetch & parse TL RESEARCH_LOG.md (if repo accessible)
- [ ] Write `extractDebugLog()` — parse DEBUG_LOG.md into JSON (Ellis)
- [ ] Write `extractTLDebugLog()` — parse TL DEBUG_LOG.md (Ellis)
- [ ] Write `extractTestFramework()` — summarize ELLIS_LEGIBILITY_TESTING.md
- [ ] Write `extractTLTestFramework()` — summarize TL equivalent
- [ ] Write `generateEcosystemRoadmap()` — create ecosystem_overview.json + connections
- [ ] Collect 3–5 anonymized Ellis session traces
- [ ] Collect 5–10 Ellis beta responses (start Phase B.1)
- [ ] Collect 3–5 anonymized TL learner sessions (when TL beta starts)
- [ ] Collect 5–10 TL tutor outputs + context (when TL beta starts)
- [ ] Create `src/components/BuildLogsDrawer.tsx` — UI shell (Ellis/TL/Roadmap tabs)
- [ ] Wire drawer toggle in `/anthropic` layout only
- [ ] Add disclosure language header + ecosystem overview entry point
- [ ] Add "Visit Tonal Learning" link (deferred/beta banner as needed)
- [ ] Test load performance (drawer should feel instant; tabs load on click)
- [ ] Verify sanitization (no PII in any JSON file; no GoE private content)
- [ ] Add to Phase B.3 build step: `npm run generate:build-logs` before deploy
- [ ] Add to CI/CD: fetch TL logs from public `tonallearning` repo (if open by then)

---

## 7. Update Project Memory

Add to Ellis PROJECT_MEMORY.md:

```
### Build Logs Drawer (/anthropic)

Non-invasive drawer on `/anthropic` route only. Three sections:

**Ellis Logs:**
- RESEARCH_LOG excerpts (decisions + impact)
- DEBUG_LOG excerpts (what broke, how fixed)
- ELLIS_LEGIBILITY_TESTING framework (test plan + status)
- Anonymized session traces (3–5 examples showing interior state)
- Annotated beta responses (5–10 real Ellis outputs with context)

**Tonal Learning Logs:**
- TL RESEARCH_LOG excerpts (decisions + domain-specific impact)
- TL DEBUG_LOG excerpts (build friction in learning domain)
- TL test framework + sample learner sessions
- TL tutor outputs (no learner PII)

**Ecosystem Roadmap:**
- Why three systems (Ellis, TL, GoE) and what they share
- System connections + common patterns
- North Star: behavioral architecture as research direction
- Links to public projects; beta/private badges as needed

All data static, sanitized, generated at deploy time.
Not visible on default hall (`/`).

Reviewers see: "This isn't random mythology. Here's the architecture,
here's where it's been tested, here's how the pieces relate."
```

---

## 8. Tone for TL Presence in Drawer

**Key framing (to avoid "this person is building five unrelated things"):**

> Ellis tests the legibility of behavioral architecture at small scale.
> Tonal Learning applies the same principles at larger scale in a real domain (language learning).
> They share the same philosophy, different contexts.

**For each TL section:**
- Same rigor as Ellis (decisions logged, friction recorded, tests documented)
- Clear distinction: "TL is private beta / coming Aug 2026 / explore if interested"
- Never pitch TL as a feature of Ellis; keep them as parallel proof points
- Highlight common pattern: "Both systems use perception-before-performance, session-scoped state, soft routing"

**Result:** Reviewers see coherence, not scatter. Three systems + one philosophy. Not mythology — research.

---

_This spec keeps Ellis transparent without leaking private conversations or internal architecture code. The drawer becomes a form of **proof** — reviewers can audit the decisions, see the failures, and watch the tests accumulate as public mode approaches._
