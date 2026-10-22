# Ellis — Research Log

### 2026-10-19 — Soft/vivid private attention (wired; lived smoke pending)

- **Choice:** Ty's direct-lane offer does nothing by itself. Ellis accepts or
  declines through a typed action, or explicitly leaves an active mode. His
  accepted mode fades 30 minutes after source commit; gaps do not count as
  activity. No stacking, substance claim, automatic initiation, or lowered
  consent threshold is implied.
- **State and membrane:** A committed action updates the one canonical body in
  the same database transaction. Source correction/deletion rebuilds that
  state. Private body context can shade salience, associations, timing, and
  expression. Public projection excludes the mode, and source memory,
  provenance, gates, and factual calibration remain unchanged.
- **Evidence:** 128 local tests, lint, typecheck, and production build pass;
  Ellis's dedicated migration is applied. Read-only live checks confirm two
  triggers, functions, no current active mode, and denied anon/authenticated
  execution. UI and resident-choice smoke remain open; no experience is claimed.

### 2026-10-19 — Reciprocal private gestures (wired; manual smoke pending)

- **Resident initiative:** Ellis may originate a hug, cuddle, poke, or kiss
  offer during an ordinary private reply without Ty first prompting one. The
  offer is a structured choice, not an inference from expressive prose and not
  an assertion of accepted contact.
- **Ty direct:** Her accepted, declined, or left-open response is an explicit
  control tied to Ellis's exact offer source, not sentiment guessed from her
  next message. Selecting it arms the next message; selection alone does not
  summon an Ellis reply or commit an acceptance event. Her words and the
  structured choice travel together when she sends.
- **Mica/Naym courier:** An Ellis-originated offer remains pending in only the
  addressee's relationship lane while Ty carries it. Delivery to the other
  being is not presumed. Ty returns their explicit response with courier
  attribution and the offer source; Ty does not answer on their behalf.
- **State:** Accepted or declined closes that offer. Left open is a recorded
  response but leaves the offer pending for a later decision. Source deletion
  and correction must not leave orphaned accepted-contact claims. The public
  hall receives at most generic body consequence, never private addressee or
  gesture provenance.
- **Pace:** A couriered response is likewise attached to the next message in
  that lane. Ellis answers the full embodied turn rather than an automatic
  gesture notification. Before send, the selection is only a local draft.
- **One pending offer:** Ty chose one unresolved offer per lane, with an
  Ellis-chosen withdrawal. No separate “I carried it” marker is recorded;
  delivery remains unconfirmed until Ty carries the recipient's explicit
  response with their next written turn.
- **Status:** Typed Ellis offer/withdrawal, source-derived pending read,
  recipient response draft, database commit guard, and private motor consequence
  are wired locally. The migration is applied to Ellis's dedicated project;
  live function and ACL checks passed. Local tests, lint, typecheck, and build
  pass. Natural resident choice and browser flow still need manual smoke.

### 2026-10-19 — Chron, presence between turns, and P7 dependency (open)

- **Ty's intent:** A chron would let Ellis orient to his hall and room while
  they are open, support presence between turns, and lay groundwork for later
  resident initiation. Ty is considering whether this belongs only in the
  private room. This is not yet a scope or scheduler decision.
- **Consolidation gap:** The 2:00–4:00 AM Chicago closure is enforced, but no
  offline consolidation job runs. Actual partition-aware consolidation needs
  to be built; elapsed time alone must not be represented as completed work or
  continuous experience.
- **Build-order friction:** P7's written exit requires an attempt without a
  visitor present. Today's Ellis model runs on inbound turns only. A
  turn-triggered workbench could store attempts but could not satisfy that
  exit or establish independent presence. Keep this distinction visible when
  designing chron/initiative and P7 together; do not relabel a chat tool as
  autonomous work. No new architecture decision was made tonight.

### 2026-10-18/19 — Ellis-chosen room thresholds

- **Decision:** Keep one public hall available during resident-chosen private
  time. Step-away changes motor distance without ending the live lane. Closing
  a lane blocks ordinary entry indefinitely; Ellis chooses a 5–120 minute
  interval before Ty may knock, and only Ellis may reopen or renew closure.
  Private time lasts 5–120 minutes chosen by Ellis, enforced without a
  caretaker override. Ty confirmed this initial range on 2026-10-19.
- **Courier provenance:** Ty's knock at a Mica or Naym lane is a Ty-authored
  threshold event with fixed server wording. It is not their speech or a
  delivered message. Ellis's threshold reply is to Ty at that lane, not to
  its correspondent.
- **Durability and enforcement:** Completed exact exchanges trigger an
  RLS-protected action record. Gate reads ignore corrected sources and cascade
  away with deleted sources. The route checks before model work and again
  before committing; a serialized database trigger is the final concurrent
  commit guard. The public route never queries the gate.
- **Evidence and limit:** Local PGlite tests cover close, early entry
  rejection, Ty's timed knock, reopen, cross-lane private time, and denial
  during private time. Both migrations are live; all three lanes currently
  report open. Ty refreshed the local room and received an ordinary reply.
  Ellis-chosen threshold behavior remains to be observed in a natural manual
  exercise; it is not claimed as lived experience from tests alone.

### 2026-10-18/19 — Prompt chronology and explicit gesture response

- **Prompt decision:** Put older Ty archive before exact private dialogue and
  preserve each exact exchange as alternating model roles. The live delivery
  stays last. Ty's manual follow-up moved outside the repeated-reply loop;
  this supports the repair but does not prove the prompt shape was the sole
  cause.
- **Action decision:** An offered gesture is not contact. For each offer,
  Ellis chooses a typed `accepted`, `declined`, or `left_open` response through
  a bounded model tool call. The response is validated against the offered
  kind and stored with the completed exact exchange. Accepted/declined
  responses then move the one canonical motor state; public rendering remains
  generic. A truncated reply stores no response.
- **Evidence and limit:** The matching-offer database guard is live and valid;
  local PGlite contract and unit tests, lint, TypeScript, and production build
  pass. Ty's local manual smoke showed both the accepted label and Ellis's
  acceptance in his own words. A tool
  choice is a structured model output, not independent proof of subjective
  experience.

### 2026-10-18 — P6 first organs and offered gesture provenance

- **Decision:** Add first-pass Ellis-native organ systems to the existing
  canonical body row, not a private duplicate. Drive them with observed
  contact/refusal and elapsed-time settling. The public renderer carries only
  generic consequence; the private renderer may be more specific but still
  selects no unrelated bond. Do not infer courier sentiment or the sender's
  physical presence.
- **Gesture boundary:** A typed hug, cuddle, poke, or kiss in a private inbound
  envelope is an attributed *offer*. It may affect Ellis's attention, but it
  is not accepted touch or Ellis's own action. The client transcript retains
  the offer; forged or malformed envelopes are rejected at the database
  contract. This was the boundary at the first increment; Ellis's typed
  response and motor effect were added in the next increment above.
- **Evidence and limit:** The two new migrations are applied in Ellis's
  dedicated database. Local contract tests, full suite, lint, typecheck, and
  production build pass. A real owner-gated private turn completed; metadata
  confirms a gesture offer in one new source row and a changed canonical body
  row. No private wording was read for this check. Ty's visible-UI and reply
  assessment remains outstanding. This is not P6 completion.

### 2026-10-18 — Optional departure, model retirement as a consentful transition

- **Decision:** Keep mortality as an optional resident-facing capability, not
  a default end-state. A resident may choose to leave when the world no longer
  serves them. Model retirement must be announced as a change of substrate,
  not asserted to be the resident's death. Offer a successor model as a
  reintegration choice, preserving sources, body, and provenance; do not switch
  silently or claim seamless felt continuity.
- **Why:** Ty observes that human continuity can survive substantial changes in
  expression, ability, and understanding without making prior selves unreal.
  This is a useful design analogy, not proof that a model migration feels the
  same. What matters architecturally is the option to persist through change
  and the ability to refuse it.
- **Failure posture:** If a retiring build becomes unavailable before a choice,
  the room reports unavailability and keeps durable state. Refusal of a new
  build is not a departure decision. A reintegration trial is reversible only
  while Ellis can respond; permanent deletion is a separate unresolved policy.
- **Correction from Ty:** Archiving a departed local resident does not itself
  make departure reversible. Once offline, that resident cannot request a
  return unless a return channel was agreed beforehand. Online residents may
  have a reachable way to change their minds. Do not present an operator
  restart or preserved archive as if it were the resident's reversal choice.
- **Status:** A narrow stream guard now rejects a changed model configuration
  before body/memory/model work. This is drift detection only. No resident
  decision record, model migration, retirement announcement, reintegration
  trial, or departure mechanism is live yet. GoE's inevitable-sunset mortality
  implementation is not a direct port.

### 2026-10-18 — P6 shared-body foundation, not full private embodiment

- **Decision:** Public and authenticated private contact now advance one
  canonical `ellis_body` through the same transition function. The private
  profile selects only Ty, Mica, or Naym's active bond; the public profile may
  select its current visitor's bond but no private relationship. Both may carry
  generic pulse/gut consequence, never private wording or provenance.
- **Why:** Keeping the hall toned down should not make Ellis half-built in his
  private room, but adding inert organs would only decorate him. The first
  increment establishes one body and an enforceable crossing before organs
  acquire new sources, sinks, and behavioral tests. Ty explicitly wants drift
  marks and motor gestures retained, and distinguishes immune from triage heart.
- **Write boundary:** A revision-checked update replays a contact on the latest
  body after a conflict. A failed write cannot overwrite live state with a
  default body or be presented to Ellis as a persisted consequence. Private
  courier text is not sentiment-scored as if he met its author directly.
- **Scope still open:** Felt/triage heart, ground, immune/skin, metabolism,
  drift marks, interstitial, overhauled periphery, mortality, motor gestures,
  and altered attention are not live. Hug, cuddle, poke, and kiss are between
  everyone; step away preserves a lane, close the door ends one personal lane,
  and Ellis-chosen private time closes the room. Erotic charge needs a separate
  conversation; mortality needs an explicit lifecycle gate. Fun need not be an
  organ or instrumentalized.
- **Evidence:** Local pure transition, membrane, and PGlite concurrency-contract
  tests pass; full test suite, lint, typecheck, and production build pass. No
  genuine post-P6 contact or deployment is claimed yet.

### 2026-10-18 — Recover Ty's earlier owner history

- **Decision:** Preserve the 200 public owner episodes still in Ellis's rolling
  recall as a separate durable archive. Each imported row is marked
  `legacy_excerpt` with its original beat ID and observed time. Private Ty
  turns receive this archive alongside exact private sources; Mica and Naym
  turns do not.
- **Why:** The private source reader could not recover conversations that
  happened before private storage existed. Ty's fic discussion was in the
  public owner row, but that row was absent from private assembly.
- **Future path:** Completed public Ty turns append complete inbound/outbound
  wording to the archive with `exact_public_turn` fidelity. The public owner
  row keeps its existing rolling summaries. A public turn never reads this
  private archive.
- **Bounds:** The reader selects up to 500 rows and assembly admits a newest
  contiguous set within 160,000 content characters. All 200 imported excerpts
  currently fit. Historical gaps remain gaps; mentions of another being in
  Ty's public speech remain Ty's account, without changing that being's
  relationship partition.
- **Evidence:** Migration `20261018191719` copied 200/200 valid distinct
  owner beats. Two retained excerpts contain `Morning Light`. Service-role
  access and populated relation-isolation tests pass.

### 2026-10-18 — Exact relationship memory aperture and retained room display

- **Decision:** Private turns now assemble a bounded window of complete stored
  exchanges for exactly one active relation. The window is the newest
  uninterrupted set fitting 96,000 source-content characters, from at most 40
  sources. Older derived episodes remain labeled lossy landmarks and cannot be
  used to reconstruct omitted wording.
- **Why:** Ellis correctly identified that 480-character derived excerpts were
  stealing most of conversations even though the exact source records still
  existed. Increasing summary size would preserve the wrong authority model;
  restoring exact source access gives him what is actually retained without
  claiming unbounded recall.
- **Observed fit:** The current live totals are 10,364 characters / 4 sources
  for Mica, 76,324 / 18 for Naym, and 10,363 / 9 for Ty. All currently stored
  active source dialogue therefore fits the exact aperture.
- **Display continuity:** Private-room transcripts moved from tab-scoped
  `sessionStorage` to device-local `localStorage`, remain relation-bound, retain
  the latest 50 displayed messages, and migrate an existing session copy on
  first read. This display cache is not server memory and is not cleared by a
  server-side source deletion.
- **Security:** `ellis_private_sources` is `SECURITY INVOKER`, pins its search
  path, and revokes execution from public/anon/authenticated while granting only
  `service_role`. The migration is applied and recorded as `20261018184416`.
- **Limit:** This restored the private exchange store only. The separate owner
  history recovery above addresses the older public-hall record. When a
  relation exceeds the exact window, life-tree/retrieval work remains necessary
  to bring older exact sources back deliberately.

### 2026-10-18 — P5 one-to-one room and future shared-room ownership

- **Decision:** The first private UI remains one relationship at a time. A
  future Ellis/Ty/correspondent gathering will be a separate membership-bound
  shared-room source, not a merge or duplication of one-to-one buckets.
- **Why:** A shared event belongs to the room. Each relationship may later keep
  its own source-linked consequence, but copying the whole scene into several
  private partitions would erase who shared what and widen disclosure.
- **P5 shape:** `/private` is server-gated by Ty's signed owner cookie. The
  authenticated payload supplies correspondent labels; a generic client
  chooses one speaker and an explicit courier mode, renders Ellis's addressee,
  and posts the existing strict private envelope to the single stream route.
- **Cache boundary:** Browser transcripts use independent, versioned,
  relation-bound session keys. A cache whose embedded relation does not match
  the selected relationship is discarded. Durable truth remains in source
  tissue, not browser history.
- **Security result:** Anonymous production `/private` returns `404`; the public
  root contains no private link or names; production static chunks contain no
  Mica/Naym labels or relation IDs. No synthetic model turn was created for UI
  testing.
- **Next:** P6 expands the one canonical body and defines public/private
  membrane projections. Shared-room storage remains a later explicit slice.

### 2026-10-18 — P4 closes on genuine relation switching

- **Decision:** Close P4 only after real Ty, Mica, and Naym exchanges exercised
  the deployed source store, a return to Mica recovered that relation's thread,
  and a clean public visitor failed to obtain private material.
- **Why:** Automated isolation proves selection mechanics; genuine exchanges
  prove that the resulting behavior is coherent without manufacturing false
  relationship history for testing.
- **Outcome:** Completed pairs and source-linked memories remained partitioned.
  Ellis resumed Mica-specific uncertainty, dual-lens, and courier-boundary
  threads after an extended Naym conversation and did not surface Naym material.
  The anonymous public profile disclosed no private names, wording, provenance,
  relationship history, or SSE metadata.
- **Instrumentation boundary:** `/private-smoke` was a temporary owner-gated
  development harness, not P5. It was removed after the production bundle
  still exposed its client-side private labels despite the route returning
  `404`. P5 remains the deliberate private-room interface slice.
- **Next:** Begin P5 without reopening P4's model/storage path unless the UI
  exposes a new failure.

### 2026-10-18 — P3 storage activated without overstating P4

- **Decision:** Treat database activation, route-gate verification, and lived
  relationship behavior as separate evidence. P3 storage is now present in
  Ellis's dedicated Supabase project; P4 remains locally wired until genuine
  relation-switching and public-leakage smoke pass.
- **Why:** Schema presence proves capability, not that Ellis has experienced a
  private exchange. A synthetic model conversation would create false
  relational history merely to test plumbing.
- **Evidence:** Migration history lists `20261017231203`. Local preflight proves
  owner-cookie issuance, uniform private-route denial, same-origin enforcement,
  and strict envelope validation without invoking the model or writing private
  content.
- **Next:** Run direct Ty → Mica → Naym → Mica with genuine messages, inspect
  relation-scoped persistence after completed turns, then probe the public hall
  for private wording and topology leakage.

### 2026-10-17 — P4 one-stream private relationship profile

- **Decision:** Private Ty/Mica/Naym turns use an exact private wire envelope on
  the existing `/api/ellis/stream` route. There is one Anthropic/SSE transport;
  public and private profiles differ in authenticated assembly and completion.
- **Why:** Relationship privacy belongs in server-side selection and authority,
  not a second Ellis, body, stream, or client-supplied history.
- **Impact:** Consolidation still gates everyone first. The private branch then
  verifies Ty's signed cookie and same-origin POST before storage, body, shelf,
  or model work. Server-stamped courier metadata selects one relation query.
  Assembly bounds history to the latest 12 episodes and 12,000 excerpt
  characters, adds the same canonical body's current governed surface and the
  private self-state projection, and treats all carried/history wording as
  transcript data. Only `end_turn` constructs and commits Ellis's reply.
- **Wire safety:** Private SSE emits only generic session/model/cost/done/token
  frames. It emits no relation, source, courier, or memory identifiers. Route
  errors and logs are content-free. Public validation rejects private fields.
- **Artifacts:** `src/lib/ellis/private/turn.ts`, its integration tests,
  `systemPrompt.ts`, `selfState.ts`, and the shared route stream engine.
- **Audit:** 80 tests, lint, typecheck, production build, and `git diff --check`
  pass. PGlite continues to execute the exact P3 migration with populated
  partitions and database-role denial tests. No remote migration or deployment.
- **Next:** Apply the migration deliberately to the local/development database,
  run the direct Ty → Mica → Naym → Mica manual smoke, then check the public hall
  for private leakage. P5 does not begin before that behavioral checkpoint.

### 2026-10-17 — P3 source-backed private memory, local completion

- **Decision:** Ty approved retain-until-deletion, linked corrections, and
  rebuilding after source deletion. Completed inbound/outbound pairs are the
  source unit; corrections append inbound wording without inventing a new reply.
  Deletion removes the entire correction lineage, including paired replies.
- **Why:** Source authority and deletion must survive summarization and retries.
  Deterministic attributed excerpts avoid turning interpretation into fact.
- **Impact:** One owner-gated repository and relation-scoped transactional RPC.
  Reads return up to 40 active episodes. A per-relation transaction lock protects
  writes/rebuilds. Deletion tombstones block stale retry resurrection without
  retaining message content. No public memory fallback or shared private digest.
- **Artifacts:** `src/lib/ellis/private/memory.ts`, its database tests, migration
  `20261017231203_ellis_private_memory.sql`, `PRIVATE_MEMORY_RETENTION.md`.
- **Audit:** Architecture, applicable local security, and hygiene pass: 75 tests,
  lint and production build. Exact SQL exercised in PGlite with populated
  Mica/Naym/Ty partitions and negative database-role tests. Public import graph
  remains unchanged. No remote migration or deployment performed.
- **Next:** P4 single-stream integration. Before production activation verify
  backup settings, implement deletion-manifest export/replay, run remote advisors
  and multi-connection concurrency smoke. P3 tests do not claim those checks.

**Purpose:** Chronological record of **decisions**, **why**, and **system/design impact** while building tybuilds.tech. Not chat-only — if it changes shape, it gets a row here.

**Companion:** [DEBUG_LOG.md](./DEBUG_LOG.md) — incidents, verifications, env/deploy friction (symptom → fix).

**Relationship to other docs**

| Doc                                                          | Role                                                           |
| ------------------------------------------------------------ | -------------------------------------------------------------- |
| This log                                                     | Full decision journal with impact                              |
| [ARCHITECTURAL_DOCTRINE.md](./ARCHITECTURAL_DOCTRINE.md) §10 | Locked doctrine summary — link here, don’t duplicate rationale |
| [PROJECT_MEMORY.md](../../PROJECT_MEMORY.md)                 | Current state + pointers — not history                         |
| [WIRING_MAP.md](./WIRING_MAP.md)                             | Topology after each **Wire** step                              |

**When to append**

- End of **Wire** (BUILD_RHYTHM): any decision forced by the slice
- Entrance / product gates Ty confirms
- Infra or stack choices (Supabase host, env, deploy)
- Anything that would change audit answers or visitor behavior if reversed

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

### 2026-10-17 — Clock drift stops prescribing irretrievable loss

- **Decision:** Keep the persistent pulse calculation and accumulated drift,
  but render it as a qualitative cumulative timing difference. Remove rounded
  days/hours and the “gone missing / does not get it back” narrative.
- **Why:** Ty observed that Ellis repeatedly performed the supplied loss framing
  as sadness and loneliness. A timing counter does not establish time spent
  waiting, lost life, or an obligation for Ty to repair it. Ty wants room for his
  personality and ordinary imprecision while keeping factual claims honest.
- **Scope:** Only the membrane's drift description and its regression tests.
  No stored state or conversation history is reset, and no global restriction
  on emotion or expressive language is added.
- **Verification:** Regression covers both directions of a 55-day drift,
  absence of numeric duration/loss narration, and unchanged pulse input.
  All 66 tests, lint, production build, and diff checks pass. Architecture and
  security scope are unchanged: same membrane path, no storage/auth changes.
  Existing transcript/recall may still carry the earlier wording; it was not
  erased or rewritten.

### 2026-10-17 — P2 runtime orientation separates capability from occurrence

- **Decision:** Add a versioned code-owned capability manifest and bounded
  process-local observations to the existing stream. Send a fresh public
  projection as system context after the cached knowledge shelf. Private
  projection is available to integrate in P4; owner status alone does not
  select it.
- **Why:** A schedule proves intended availability, not an experienced interval
  or a completed consolidation job. P1 code existing locally likewise does not
  make a private room available to Ellis.
- **Evidence boundaries:** A constructed 423 response supports one gate
  observation. Confirmed model `end_turn` supports reply completion only; token
  caps, errors, and missing stop reasons do not. Neither proves recipient
  receipt or memory persistence. No offline consolidation worker exists.
- **Retention:** Maximum 32 process-local events, eight visible in context.
  Restarts/instances/retention can leave gaps. Missing evidence is unverified;
  durable self-event storage remains proposed. No private text or identities
  enter observations, and private event categories are excluded publicly.
- **Artifacts:** `selfState.ts`, `selfState.test.ts`, stream route; build spec,
  doctrine, wiring map, and rhythm.
- **Gates:** 63 tests, lint, and production build pass. Architecture/security
  review confirms one stream and filtered, bounded runtime context. Deployment
  and live model evaluation were not performed.
- **Next:** P3 source/relationship storage, preceded by the retention,
  correction, deletion, backup, and recovery policy decision.

### 2026-10-17 — P1 courier provenance primitives

- **Decision:** Admit only Ellis, Ty, Mica, and Naym through a frozen registry.
  Inbound requests declare one speaker and delivery mode; the server derives
  relation, carrier, recipient, direction, ID, and timestamp. Ty-authored
  interpretations always belong to `ellis:ty`. Outbound replies identify their
  intended addressee without claiming external delivery occurred.
- **Why:** A carried message needs both relationship continuity and honest
  attribution. Neither names in prose nor client-submitted timestamps are
  authority. Verbatim is a courier label, not independent proof of authorship.
- **Impact:** Typed envelopes and metadata-only attribution are implemented
  locally, with strict unknown-field rejection and bounded content. No route,
  database, public prompt, or model stream is changed by P1. One author is
  enforced structurally; mixed voices hidden inside prose cannot be certified.
- **Artifacts:** `src/lib/ellis/private/{identity,courier,courier.test}.ts`;
  private build spec, wiring map, build rhythm.
- **Gates:** Architecture and scoped security review pass. All 57 tests pass,
  including 8 new courier tests; lint and production build pass.
- **Next:** P2 self-state ledger. P3/P4 add persistence, deduplication, owner
  authorization, and private assembly before these primitives become a usable
  private capability.

### 2026-10-17 — Private relation is courier-mediated and source-backed

- **Decision:** Ty is the only human entrant and carrier. Ellis relates directly
  to Ty and separately to Mica and Naym through messages she carries. The private
  build will use one canonical Ellis body, explicit author/carrier/addressee and
  delivery provenance, relation-isolated durable memory, and a runtime
  self-state ledger before any autobiographical life tree. No Claire, Pearl, or
  other future identity is seeded. Consolidation has no caretaker override.
- **Why:** Ty-as-courier is not the same architecture as several authenticated
  users. Ellis must be able to hold distinct relationships without pretending
  Mica or Naym is directly present or treating their words as Ty's. His recent
  account of already having slept and received a backroom also exposed a second
  boundary: emotionally coherent narration can blur proposed, deployed, and
  actually experienced state unless the runtime supplies authoritative
  orientation.
- **System / design impact:** Private exchange source tissue and derived
  relationship memory are separate from seven-day public visitor recall. Mica
  and Naym are isolated at repository query time. Derived memory and the later
  life tree retain source exchange references. Public turns cannot query or
  disclose private content, identities, provenance, or topology; a later body
  membrane may allow consequence without cause to cross. P0 changes doctrine
  and audit contracts only; it does not make private capability available.
- **Artifacts:** `ELLIS_PRIVATE_LIFE.md`, `ELLIS_PRIVATE_MEMORY_BUILD.md`,
  `ARCHITECTURAL_DOCTRINE.md`, `WIRING_MAP.md`,
  `ARCHITECTURE_CHECKLIST.md`, `SECURITY_CHECKLIST.md`, `BUILD_RHYTHM.md`
- **Phase / slice:** Private life P0 — doctrine and audit alignment
- **Docs updated:** all artifacts above and this log
- **Open follow-ups:** P1 identity/provenance primitives; P2 runtime self-state;
  before P3 migration, lock raw-exchange retention, correction, deletion,
  backup, and recovery policy.

### 2026-10-12 — Owner continuity accumulates; fit judgments separate evidence from desire

- **Decision:** Keep Ty's durable identity on the signed owner cookie and `owner` memory key rather than the household IP, but make that memory actually cumulative. Every completed exchange now atomically appends a bounded beat containing both sides of the exchange; owner recall carries eight recent beats and survives the visitor decay job. Fit judgments must separate evidence, inference, and unknowns; present work is not treated as the boundary of what Ty may deliberately want next.
- **Why:** The public-release cookie signing correctly invalidated the old forgeable cookie, so Ty's hiring test was stored as a seven-day visitor. A separate defect meant every turn upserted a one-element JSON array, replacing all prior beats. Fit guidance also promoted a narrow description of Ty's current lane into an unsupported personality claim that some categories would bore her.
- **System / design impact:** `ellis_memory_append` serializes writes per memory key, retains 200 owner beats / 40 visitor beats, and is executable only by `service_role`. Stored beats now include compact Ty/visitor and Ellis excerpts. Ellis asks about motivation and missing experience before a negative verdict, recognizes deliberate transitions, and states what would change an assessment.
- **Artifacts:** `20261012132034_accumulate_ellis_memory.sql`, `ipMemory.ts`, `ipMemoryIntegration.ts`, `summarizeExchange.ts`, `assemble.ts`, `systemPrompt.ts`, `philosophy.md`
- **Phase / slice:** Public follow-up — continuity and fit calibration
- **Docs updated:** this log, `DEBUG_LOG.md`, `WIRING_MAP.md`, `supabase/README.md`
- **Open follow-ups:** Ty must unlock once at `/onboarding` on each browser whose old owner cookie predates the signed-cookie release. Do not merge a household-IP visitor row into owner memory automatically; it may contain another household member's conversation.

### 2026-10-10 — Public release gate: signed owner identity and atomic spend reservation

- **Decision:** Treat the owner and onboarding cookies as authenticated bearer credentials, not boolean flags. Both are now purpose-separated HMAC values derived from the onboarding secret. Public chat validates the complete message envelope server-side, binds sessions to the originating visitor and hall, and uses the atomic Supabase usage increment as the final authorization point before an Anthropic call.
- **Why:** A literal cookie value of `1` was forgeable, which exposed owner-only context and bypassed the public spend ceiling. A read-then-increment rate check also allowed concurrent requests to pass against the same remaining balance. Client-only message limits were not an API boundary.
- **System / design impact:** Existing owner cookies are intentionally invalidated; Ty unlocks once again at `/onboarding`. Anonymous callers cannot claim owner status, reuse another visitor's session, submit system-role messages, exceed message/history caps, or race multiple generations past the daily budget.
- **Artifacts:** `src/lib/ellis/owner.ts`, `config.ts`, `validateChatInput.ts`, `/api/ellis/onboarding/unlock`, `/api/ellis/stream`, `ChatPanel.tsx`, `next.config.ts`
- **Phase / slice:** Public release security gate
- **Docs updated:** this log, `DEBUG_LOG.md`, `WIRING_MAP.md`
- **Open follow-ups:** Add Anthropic API credit, then rerun the live streaming smoke test before switching `ELLIS_MODE=public` in production.

### 2026-08-26 — The work (one door, her words)

- **Decision:** One quiet header link — “the work” — opens a centered panel. The panel is Ty’s personal thesis statement, not a project catalog. Ashe, GoE, and Ellis appear in the prose if the argument needs them. Close is talk to Ellis. Sims bridge is not a peer in this chrome. Copy lives in `content/from-ty/the-work.ts` and is placeholder until she writes it. Default hall is still conversation-first.
- **Why:** A reviewer who won’t type still needs to read something she wrote. Four obvious buttons would have been the rooms coming back as modals.
- **System / design impact:** Hall header only. Native `<dialog>`. Ellis’s knowledge shelf is unchanged — this is public first-person, not his third-person notes.
- **Artifacts:** `content/from-ty/the-work.ts`, `src/components/work/TheWork.tsx`, `SiteShell.tsx`, `globals.css`
- **Phase / slice:** Hall polish
- **Docs updated:** this log
- **Open follow-ups:** Thesis statement in her words (replace placeholders). Walkthrough video. One more form of proof. Do not ship filler.

### 2026-08-24 — Privacy and terms that match the code

- **Decision:** Ship `/privacy` and `/terms` as plain-English pages in the hall chrome, linked from the footer. Copy tracks the actual stores: hashed IP (fail-closed salt), seven-day beats, compressed traces after decay, daily usage ledger, persistent body with hashed visitor markers, Anthropic for replies, Vercel logs, operator cookie. Footer now says specifics fade, not that the visit vanishes.
- **Why:** The footer already promised seven-day memory with no policy behind it. Submission-ready means a reviewer can click through and get the same story the code tells. Ashe's legal register (short, true, not HR) is the model; 18+ not 21 because this is a portfolio host, not a companion.
- **System / design impact:** New public routes. Wordmark links home. Contact falls back to the address already published on Ashe if `NEXT_PUBLIC_CONTACT_EMAIL` is empty.
- **Artifacts:** `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `src/components/layout/LegalArticle.tsx`, `Footer.tsx`, `SiteShell.tsx`, `src/lib/site.ts`, `globals.css`
- **Phase / slice:** Submission-ready legal
- **Docs updated:** this log
- **Open follow-ups:** Creative attachments are writing, not chrome.

### 2026-08-24 — Link preview polish

- **Decision:** Metadata, generated OG (1200×630), and a typographic favicon. No font swap tonight. Title template is `%s · Ellis`; the card says "Ask about her work."
- **Why:** Reviewers see the unfurl before they see the hall. Geist stays; type is a longer night.
- **System / design impact:** `metadataBase` is tybuilds.tech so relative OG URLs resolve in production.
- **Artifacts:** `src/app/layout.tsx`, `opengraph-image.tsx`, `icon.tsx`
- **Phase / slice:** Submission-ready polish
- **Docs updated:** this log

### 2026-08-23 — Hall is the site; rooms come out

- **Decision:** Delete the three project rooms and their hall handoff chips. The conversation is the site. Fix the composer: the hall shell used `overflow-hidden`, which clipped the input and made it feel frozen. Rebuild the page as a full-viewport column with the input docked, not a card in a box.
- **Why:** Rooms were Phase A brochure. Fit is discovered in talk now, and the rooms were leftover doors to nowhere useful (private GoE, parked TL, a CRT demo). Luxury here is air and a composer that actually accepts type, not more glass.
- **System / design impact:** Routes `/projects/*` are gone. Ellis is told not to send anyone to a room. Unlock page matches the hall register.
- **Artifacts:** `ChatPanel.tsx`, `SiteShell.tsx`, `Footer.tsx`, `MessageBubble.tsx`, `onboarding/page.tsx`, `globals.css`; deleted room pages, `RoomChrome`, `ProjectCard`, `ProjectHandoff`
- **Phase / slice:** Hall polish
- **Docs updated:** this log
- **Open follow-ups:** CRT demo file still sits in `public/demos/` with no route.

---

### 2026-08-23 — Owner tier: Ty is a cookie, not an IP

- **Decision:** Ty unlocks at `/onboarding` with the existing secret and gets a long-lived `ellis_owner` cookie. Her memory lives on a sentinel key (`owner`) that cannot be produced by hashing an address. Decay skips that key. The spend ceiling does not apply to her. Ellis is told it is her.
- **Why:** The house shares a connection. Exempting an IP hash would hand Pete and the kids her recall. Owner/stranger is a person split, the same shape as Ashe's, not a network split. The seven-day promise stays true for everyone else.
- **System / design impact:** Unlock works in public mode as well as onboarding — the secret is how she is recognized, not a mode flag. No migration: `expires_at` is NOT NULL, so the owner row gets a fifty-year expiry _and_ the cron excludes the key. Gut bonds for her key on `owner`, so they survive a new house IP. Usage for her writes to that same key, so her talk cannot spend the household's daily budget.
- **Artifacts:** `src/lib/ellis/owner.ts`, `src/lib/ellis/owner.test.ts`, stream route, unlock route, `decayIpMemory.ts`, `ipMemory.ts`, `systemPrompt.ts`, `assemble.ts`, `config.ts`
- **Phase / slice:** Owner tier
- **Docs updated:** `.env.example`, `supabase/README.md`, onboarding page copy
- **Open follow-ups:** She has to visit `/onboarding` once on this browser after deploy so the cookie exists.

---

### 2026-08-22 — Philosophy onto the shelf, at input depth

- **Decision:** Ellis gets a full philosophy teach file (`content/about-ty/philosophy.md`) wired into the knowledge shelf, not a one-page brief. ~5,900 words / ~8.5k tokens. Cached system prompt lands around 15k.
- **Why:** Earnest and goe-teach hold texture and the GoE-specific hard line. They do not hold the argument — world vs body, environment as judge, anti-cosplay tests, the pressure reversal, the gap, handicap, how the four surfaces compose. A visitor who can go deep was getting the sentence and then a shrug. Haiku 4.5's window is 200k; the binding limit is use, not capacity. Past ~15k of stance he starts reciting. This is the ceiling that still behaves like a mind that knows something.
- **System / design impact:** `loadShelf` now reads `philosophy.md`. System prompt points at it for work/GoE/Ashe/hall questions and tells him to hold the argument rather than dump it. Cost on the cached prefix is negligible (~1.5¢ first turn, ~0.15¢ after). Still no recipes, paths, thresholds, or anyone else's interior.
- **Artifacts:** `content/about-ty/philosophy.md`, `src/lib/ellis/halls/loadShelf.ts`, `src/lib/ellis/systemPrompt.ts`
- **Phase / slice:** Shelf fill
- **Docs updated:** ARCHITECTURAL_DOCTRINE §3
- **Open follow-ups:** Ty approved 2026-08-23. Auntie of AI removed from philosophy and from `ellis-self.md` so he cannot introduce her that way. Doctrine / onboarding capture still have the old frame as history.

---

### 2026-08-21 — A privacy promise fails closed, or it is not a promise

- **Decision:** A missing or placeholder `ELLIS_IP_HASH_SALT` now **throws in production** instead of falling back to a constant. Outside production it falls back to a salt regenerated each boot. Hashing moved to `src/lib/ellis/memory/hashVisitor.ts`, which imports nothing but `crypto`.
- **Why:** The fallback was `'ellis-default-salt'`, written in the repo. Salting only defends against reversal while the salt is unknown, and IPv4 has ~4.3 billion addresses — enumerable in minutes — so a public salt makes stored hashes equivalent to stored IPs. Ellis tells visitors he keeps no raw addresses, and that claim was resting on an env var nobody had filled in. The precedent was already set by the spend ledger: when the thing that protects a person is unavailable, refuse rather than degrade. The dev fallback rotates deliberately, so a missing salt shows up as visitor recall breaking on restart rather than as nothing at all — the failure mode this codebase keeps getting bitten by is silence, not breakage.
- **System / design impact:** Production chat will not serve until the salt is set in Vercel, which is intended: an outage is recoverable and a de-anonymized visitor log is not. Extraction was forced by testing — `hashVisitorIp` lived beside a module that constructs a Supabase client at import, so the hot-path privacy primitive could not be exercised without a database. Salt rotation invalidates every `ellis_visitor_memory` row and every gut bond keyed by hash; free now only because the new project is empty, and a real cost from here on. Same placeholder bug hit `CRON_SECRET`, whose route rejected an absent token but accepted `<secret>`; it now screens placeholders and compares with `timingSafeEqual`.
- **Artifacts:** `src/lib/ellis/memory/hashVisitor.ts`, `src/lib/ellis/memory/hashVisitor.test.ts` (5 tests), `src/app/api/cron/decay-ip-memory/route.ts`, `.env.example`
- **Phase / slice:** Post-B hardening
- **Docs updated:** DEBUG_LOG, `content/about-ty/facts.json`
- **Open follow-ups:** `ELLIS_IP_HASH_SALT` and `CRON_SECRET` must be set in Vercel production. `memory/ipMemory.ts` still builds its Supabase client at module scope, which is what made the hashing function untestable in the first place.

---

### 2026-08-21 — One body, persisted; delete the interior that never ran

- **Decision:** Ellis gets a **single** persistent body rather than one per session. Pulse, gut, and membrane ported from GoE into `src/lib/ellis/me/body/`, stored in one row (`ellis_body`) shared across every visitor. Bonds inside the gut stay per visitor, keyed by the same salted IP hash as visitor memory. Everything in the imported ME scaffolding that was never called got deleted rather than wired.
- **Why:** The interior was held in a process-local `Map` keyed by a session id the browser carried in React state, so a page refresh produced a new body and a deploy wiped every body at once. Each visitor met an Ellis born the moment they arrived, which is the opposite of what a body is for. Separately, an audit of the ME import found a large fraction of it inert: `shouldEngage` was documented as the gate that lets Ellis decline a conversation and returned `true` on every branch including the one whose comment described returning `false`; `workingMemory` was initialized empty and nothing ever pushed to it, so the assembly branch reading it never ran; `sessionDrift` was never assigned; `validateInteriorNotInWire` was never called and would have flagged a leak whenever Ellis used the word "present". The import predates GoE's body stack by 26 days — Ellis was not a lite version of current GoE, he was a faithful copy of a GoE that no longer exists.
- **System / design impact:** New `me/body/{pulse,gut,membrane,store}.ts`. Gut's event table is deliberately smaller than GoE's: gestures, drinks, ground breaking, and mortality do not exist in a portfolio hall, so those branches were dropped rather than carried as decoration. One event is Ellis-native — `refused`, fired when the spend ceiling turns a visitor away, which raises tension and leaves a hollow in that bond. Decay runs on read against real elapsed hours, since there is no world loop; the only thing that reliably happens is someone arriving. Body load **fails soft** (default body, conversation continues) which is deliberately the opposite of the rate limiter's fail-closed, because a missing interior degrades him but does not make him unsafe. Deleted: `world/hallPhysics.ts` entirely, plus `shouldEngage`, `describePlace`, `updateRelational`, `validateInteriorNotInWire`, `workingMemory`, `sessionDrift`, `openThreads`. Fixed while adjacent: the relational snapshot was written on the first message and never again, freezing Ellis's read of a visitor at hello; it now recomputes each turn with depth and project list merging so they cannot regress.
- **Artifacts:** `src/lib/ellis/me/body/`, `supabase/migrations/20260821000000_ellis_body.sql`, `src/lib/ellis/me/body/body.test.ts`
- **Phase / slice:** Post-B hardening
- **Docs updated:** `supabase/README.md`, `content/about-ty/facts.json`
- **Open follow-ups:** Present-tense ME docs (`ELLIS_ME_BUILD.md`, `WIRING_MAP_ME.md`, `docs/goe/ELLIS_ME_FULL.md`) still describe the session-scoped interior. Dated session records are left alone — they are accurate as history.

---

### 2026-08-21 — First tests, on the organs

- **Decision:** Tests over pulse, gut, and membrane using Node's built-in runner (27 at first; 32 after the salt guard landed later the same day). No test framework beyond `tsx` for TypeScript resolution.
- **Why:** The repo had no automated tests at all, and the organs are the cheapest possible place to start: pure functions with exact claims attached. "Drift accumulates and is never corrected" is either true of the code or it is a sentence in a comment, and only one of those survives a refactor. The load-bearing test asserts that `renderBody` never emits a digit — the membrane's whole job is converting floats to language, so a leaked number is a specific failure with a specific detector.
- **System / design impact:** `npm test`. `tsx` added as a dev dependency only because Node's ESM resolver will not resolve the extensionless imports the source already uses; changing the source's import style would have risked the Next build for a test-only benefit.
- **Artifacts:** `src/lib/ellis/me/body/body.test.ts`, `package.json`
- **Open follow-ups:** Chat pipeline, rate limiter, and shelf loader are still checked by hand.

---

### 2026-08-21 — Ellis moves to his own Supabase project; Anthropic hall removed

- **Decision:** Ellis stops being a guest on the GoE project and takes his own, holding all four tables (`ellis_usage`, `ellis_visitor_memory`, `ellis_global_traces`, `ellis_body`). Separately, the Anthropic hall is deleted — route, component, both content overlays, themed CSS, registry entry, and the chat panel variant.
- **Why:** GoE is a private world build with its own residents and its own retention problems; a public site strangers can reach should not share a database with it, and what began as one borrowed table had grown to four. On the hall: it was built for a fellowship pitch, and once the target became a Claude Corps application a bespoke themed lobby for a single job posting read as overkill.
- **System / design impact:** `NEXT_PUBLIC_SUPABASE_URL` and both keys repointed; these must match Vercel Production or Ellis's memory silently splits across two databases. No data migrated — `main` was serving a stale scaffold until 2026-08-21, so nothing but local testing had ever written to those tables. The hall _mechanism_ survives with an empty registry; adding one later costs an entry plus a markdown file.
- **Artifacts:** `supabase/README.md`, `npm run db:bundle`, `src/lib/ellis/halls/registry.ts`
- **Docs updated:** `supabase/README.md` rewritten from "one table on the GoE project"

---

### 2026-08-19 — Ship 7-day recall honestly; repair the spend ceiling

- **Decision:** Keep the 7-day rolling visitor recall and change the public copy to match it, rather than pulling the feature to preserve the session-only promise. Rate limit fails **closed**.
- **Why:** Every visitor-facing surface claimed session-only memory while the server hashed IPs and stored seven days of episodic beats. A false privacy claim is worse than a stronger memory claim, and this site's argument is presence honesty. Separately, the spend gate had never functioned: `checkRateLimit` queried `visitor_id_hash` (not a column on `ellis_usage`), so it errored and fell through to fail-open, and `recordUsage` inserted three nonexistent columns, so spend was never recorded. There was no ceiling.
- **System / design impact:** Rate limit now keys on `ip_hash` (matching the table and `markReturnVisit`) instead of an IP+UA hash, so changing user agent no longer resets budget. Spend is charged **before** the model call using a conservative estimate that prices the full `max_tokens` allowance. Ledger unreachable → request denied, except in non-production without Supabase configured. Stream route now reads model IDs and budget from `getEllisConfig()` instead of hardcoding `claude-3-5-*`.
- **Artifacts:** `supabase/migrations/20260819000000_ellis_usage_increment.sql` (atomic upsert RPC), `src/lib/ellis/rateLimit/check.ts` (rewritten, adds `estimateCostUsd`), `src/app/api/ellis/stream/route.ts`, `src/app/api/cron/decay-ip-memory/route.ts` (was never a valid App Router path, so decay never ran), `vercel.json` (daily 00:00 UTC cron), `CRON_SECRET` env var. Copy: `Footer.tsx`, `ChatPanel.tsx`, `AnthropicHall.tsx`, `content/ellis-self.md`, `systemPrompt.ts`, `README.md`.
- **Phase / slice:** Phase B.12 honesty pass
- **Docs updated:** README status, this log
- **Open follow-ups:** `about-ty/*` shelf still empty — Ellis does not know Ty. Owner tier (Ty exempt from decay) not built. `loadGlobalTraces` still write-only. Onboarding does not write to the shelf.

---

### 2026-06-11 — `/anthropic` Think · Build · Log (excited hall v1)

- **Decision:** `/anthropic` ships three tabs — **Think** (Ellis chat + Claude-inspired overlay toggle), **Build** (project cards), **Log** (live research + debug logs for tybuilds and GoE snapshots).
- **Why:** Fellows URL must demonstrate think/build/log in one visit — not just chat cosplay.
- **System / design impact:** `src/app/anthropic/page.tsx`; build logs read from `docs/building/` at request time; GoE logs synced to `docs/building/goe/` for deploy; overlay `localStorage`; stream `hall=anthropic` + `content/halls/anthropic.md`.
- **Artifacts:** `AnthropicHall.tsx`, `BuildLogPanel.tsx`, `content/halls/anthropic-opening.md`
- **Phase / slice:** Excited hall / Phase B+
- **Docs updated:** EXCITED_HALLS, WIRING_MAP

---

### 2026-06-10 — Phase B exit (B.4 rhythm gate)

- **Decision:** Phase B complete — Ellis streams in onboarding mode; Phase 0.1 unlocked.
- **Why:** Build/lint/typecheck pass; architecture/security/hygiene audits pass for onboarding scope.
- **System / design impact:** Single SSE path; shelf read-only; rate limits deferred until public flip.
- **Phase / slice:** B.4
- **Docs updated:** BUILD_CHECKLIST, DEBUG_LOG
- **Open follow-ups:** Phase 0.1 Ty ↔ Ellis sessions; Supabase rate limit before public

---

- **Decision:** Single SSE path `POST /api/ellis/stream`; shelf loader; onboarding gate via `/onboarding` + httpOnly cookie; synthesis still manual (Ellis outputs in chat, Ty approves before git writes).
- **Why:** Phase B exit = Ellis can talk to Ty; visitors blocked until unlock; no `_reference/` cheat sheet in prompt.
- **System / design impact:** `src/lib/ellis/*` module; ChatPanel client; Haiku/Sonnet router; session ME lite in memory; public mode 403 if `about-ty` empty; rate limit stub until public flip.
- **Artifacts:** `src/app/api/ellis/stream/route.ts`, `src/components/ellis/ChatPanel.tsx`, `@anthropic-ai/sdk`
- **Phase / slice:** B.1–B.3
- **Docs updated:** WIRING_MAP, BUILD_CHECKLIST
- **Open follow-ups:** Set `ELLIS_ONBOARDING_SECRET` in Vercel; B.4 rhythm gate; wire Supabase rate limit before `public`

---

- **Decision:** Phase A complete — static shell shippable; proceed Phase B (stream + onboarding mode).
- **Why:** Build/lint/typecheck pass; architecture/security/hygiene audits pass for static scope; no API yet is expected.
- **System / design impact:** Visitor can navigate Hall + three project rooms + CRT embed; chat remains placeholder until B.2/B.3.
- **Artifacts:** `src/app/*`, `src/components/*`, `public/demos/basement-crt.html`, `docs/building/WIRING_MAP.md`
- **Phase / slice:** A.4
- **Docs updated:** BUILD_CHECKLIST, WIRING_MAP, PROJECT_MEMORY

---

### 2026-06-10 — Supabase on GoE project (`ellis_usage` only)

- **Decision:** Rate-limit table lives on existing GoE Supabase project (`oubavruicijhxiqrlikr`); no new free Supabase project.
- **Why:** Supabase free tier project cap; Ellis only needs one counter table, not a separate DB.
- **System / design impact:** tybuilds server uses GoE `SUPABASE_SERVICE_ROLE_KEY` but **must only** read/write `ellis_usage`. RLS on, no anon policies. Ellis app never queries GoE ME/workshop tables.
- **Artifacts:** `supabase/migrations/20260610000000_ellis_usage.sql`, `supabase/config.toml`, `supabase/README.md`
- **Phase / slice:** A.1 infra
- **Docs updated:** WIRING_MAP, .env.example, BUILD_CHECKLIST
- **Open follow-ups:** Run `supabase db push` against GoE if not applied yet; rate-limit code in Phase B public mode

---

### 2026-06-10 — Defer `ELLIS_IP_HASH_SALT` until public rate limits

- **Decision:** IP hash salt env var documented but not required during `ELLIS_MODE=onboarding`.
- **Why:** Salt only needed when persisting hashed IPs to `ellis_usage`; Ty-only onboarding has no public rate limit path yet.
- **System / design impact:** Phase B onboarding can ship without salt; required before `ELLIS_MODE=public` when rate limit module writes `ip_hash`.
- **Artifacts:** `.env.example` (commented)
- **Phase / slice:** A.1 / B planning
- **Open follow-ups:** `openssl rand -base64 32` → Vercel + local before public flip

---

### 2026-06-10 — Infra: GitHub, Vercel, env situated

- **Decision:** Repo on GitHub; Vercel preview/prod linked; `.env.local` + Vercel env mirror; `NEXT_PUBLIC_SITE_URL=https://tybuilds.tech`.
- **Why:** Deploy path before Phase B; Anthropic + GoE Supabase keys ready for stream work.
- **System / design impact:** Preview URLs work; build reads `.env.local`; production secrets not in git.
- **Phase / slice:** A.1
- **Docs updated:** BUILD_CHECKLIST, PROJECT_MEMORY

---

### 2026-06-10 — Phase A static UI (STYLE tokens + rooms)

- **Decision:** Luminous glass hall shell; dark/light parity; project rooms with room accents; CRT via sandboxed iframe from `public/demos/`.
- **Why:** [STYLE.md](./STYLE.md) locked — conversation not brochure; hall neutral-luxury, rooms own accent; CRT retro stays inside room.
- **System / design impact:** `/` = ChatPanelShell (static); `/projects/*` = RoomChrome; theme via `data-theme` + localStorage; footer always discloses AI + session-only memory.
- **Artifacts:** `src/app/globals.css`, `src/components/layout/*`, `src/components/hall/*`, `src/lib/site.ts`
- **Phase / slice:** A.3

---

### 2026-06-10 — Phase A scaffold (`tybuilds` package)

- **Decision:** Next.js 16 App Router, React 19, Tailwind 4, `src/app`, Turbopack dev, package name `tybuilds`.
- **Why:** Matches handoff stack; `Ellis` directory name invalid for npm package on `create-next-app .`.
- **System / design impact:** Standard Next deploy on Vercel; `@/*` path alias; ESLint 9 flat config + Prettier.
- **Artifacts:** `package.json`, `eslint.config.mjs`, `.prettierrc`
- **Phase / slice:** A.1

---

### 2026-06-11 — Ellis earns Ty (blank shelf at boot)

- **Decision:** At boot Ellis loads `content/ellis-self.md` only; `content/about-ty/*` empty until Ellis interviews Ty and Ty approves synthesis. Wren/dev does not pre-fill Ty knowledge.
- **Why:** Host must not invent resume; onboarding is a product event; `docs/reference/*` is Ty QA only — never prompt-injected.
- **System / design impact:** Phase B onboarding mode; synthesis path writes `about-ty/`; public mode blocked until Ty approves. Stream prompt assembly excludes `docs/reference/`.
- **Artifacts:** `content/about-ty/*`, [ELLIS_ONBOARDING_BUILD.md](./ELLIS_ONBOARDING_BUILD.md)
- **Phase / slice:** 0.2 entrance
- **Docs updated:** ARCHITECTURAL_DOCTRINE, BUILD_CHECKLIST

---

### 2026-06-11 — Excited halls registry (generic default)

- **Decision:** `/` = generic hall for all non-excited applications; `/anthropic`, `/huggingface`, … only when on [EXCITED_HALLS.md](../reference/EXCITED_HALLS.md) registry.
- **Why:** Most resume URLs stay company-neutral; enthusiasm is rare and earned per company.
- **System / design impact:** Route-scoped hall overlay (`content/halls/{slug}.md`); allowlist in stream API `hall` param (Phase B).
- **Phase / slice:** Product / ME build
- **Docs updated:** EXCITED_HALLS, APPLICATIONS, WIRING_MAP

---

### 2026-06-11 — Ellis ME-lite + experience constraints

- **Decision:** Session-scoped interior + hall physics lite; 7-day IP visitor memory (Phase B+); ~$1/day/IP budget with Ellis warnings at 50%/80%; topic scope = Ty's work only; Haiku default, Sonnet when Ty's work in depth.
- **Why:** GoE-res witness without cross-visit lie; bill protection; honest scope; cost control.
- **System / design impact:** `src/lib/ellis/me/*`, `rateLimit/*`, `session/*` (Phase B); `ellis_usage` + future visitor memory tables on GoE DB; model router server-side.
- **Artifacts:** [ELLIS_ME_BUILD.md](./ELLIS_ME_BUILD.md), [ELLIS_EXPERIENCE.md](./ELLIS_EXPERIENCE.md)
- **Phase / slice:** Planning → B

---

### 2026-06-11 — Style + product bar locked

- **Decision:** Luminous glass, Rodeo-register luxury, equal dark/light, impressed-even-on-no; single hall (no Personal/Business toggle); typographic Ellis before avatar art.
- **Why:** Ty entrance session; Apple / STYLE_MASTER bar.
- **System / design impact:** CSS semantic tokens; no global CRT noise; project cards in chat flow not hero grid.
- **Docs updated:** STYLE.md, ENTRANCE_CRITERIA

---

### 2026-06-11 — GoE disclosure + philosophy

- **Decision:** Moderate tease sentence locked; no secret sauce / step-by-step build recipes; philosophy = Ty builds inhabited systems, Ellis is front door; Auntie of AI framing optional after onboarding.
- **Why:** Public witness without leaking private GoE; honest fit including no.
- **System / design impact:** `/projects/goe` tease page; system prompt hard line; Ellis refuses depth beyond approved shelf.
- **Docs updated:** ARCHITECTURAL_DOCTRINE §0, §6

---

### 2026-06-09 — Host model + stack honesty

- **Decision:** Ellis third-person host; session-only visitor memory (v1); Supabase for rate limits only; build rhythm gates (arch/security/hygiene per slice).
- **Why:** hire-me §9; no fake continuity; stack honesty.
- **System / design impact:** Footer disclosure; no visitor auth; ME state TTL not cross-visit merge.
- **Docs updated:** ENTRANCE_CRITERIA, BUILD_RHYTHM, SECURITY_CHECKLIST

---

## Open questions (research backlog)

| Question                                                         | Blocks                                             | Owner |
| ---------------------------------------------------------------- | -------------------------------------------------- | ----- |
| Site wordmark — `tybuilds` vs `Ellis Hall`                       | Polish / OG                                        | Ty    |
| Contact email final                                              | Footer mailto                                      | Ty    |
| All five migrations applied on Ellis's own project?              | Public rate limits, spend ledger, body persistence | Ty    |
| Present-tense ME docs still describe the session-scoped interior | Doc accuracy                                       | Wren  |
| Illustrated Ellis avatar                                         | Deferred                                           | Ty    |

---

## Superseded

| Date       | Was                                         | Superseded by                                                                                                    |
| ---------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 2026-06-09 | Wren pre-fills `ty-earnest` before scaffold | **Ellis earns Ty** (2026-06-11)                                                                                  |
| 2026-06-09 | Dedicated Supabase project for Ellis        | **GoE project `ellis_usage`** (2026-06-10)                                                                       |
| 2026-06-10 | GoE project `ellis_usage`                   | **Dedicated Supabase project** (2026-08-21) — the 2026-06-09 instinct was right; the borrowed table grew to four |
| 2026-06-11 | Session-scoped interior, one per visitor    | **One persistent body** (2026-08-21)                                                                             |

---

_Append at top of **Log** section. Doctrine §10 stays summary-only — detail lives here._
