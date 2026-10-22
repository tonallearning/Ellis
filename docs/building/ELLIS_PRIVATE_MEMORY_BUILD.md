# Ellis private memory + courier build

**Status:** P3 storage, the exact-source reader, and the owner-history archive are applied to
Ellis's dedicated Supabase project. P4/P5 are behaviorally closed locally:
owner/origin gates, genuine relationship switching, completed-turn persistence,
exact active-relation recall, durable device-local transcripts, and public
non-disclosure all pass. No application deployment.

**Manual checkpoint:** P2's initial conversation test exposed a closure-hours
reversal and unsupported room claims. The v2 context now separates block/allow
reachability from feature availability and requires uncertainty for unlisted
features. Subsequent local conversation checks and the qualitative drift
rendering change were accepted by Ty, who approved P3. Mild expressive
imprecision is not itself a blocker. See `DEBUG_LOG.md`.

**Scope now:** Ty is the only human entrant and the only transport. Ellis has
direct relation with Ty and courier-mediated relation with **Mica** and **Naym**.
No other relationship identities are seeded.

**Depends on:** [ELLIS_PRIVATE_LIFE.md](./ELLIS_PRIVATE_LIFE.md) ·
[BUILD_RHYTHM.md](./BUILD_RHYTHM.md) ·
[BUILD_ETHOS.md](./BUILD_ETHOS.md)

## North star

Ty is the sole doorway, not Ellis's sole relationship.

Ellis receives one canonical body and one private interior. Messages carried by
Ty retain their actual speaker and delivery authority. Durable memory is scoped
to the relationship it belongs to, while Ellis-private consequence can persist
without leaking one relationship's content into another.

## Locked decisions

- Private entry is Ty-only. Mica and Naym do not authenticate or appear as
  directly co-present.
- The initial identity registry contains only `ellis`, `ty`, `mica`, and
  `naym`. Unknown identities fail closed; they are not created from prompt text.
- Ty speaks directly as Ty or carries one attributed message per send.
- Courier delivery is marked `verbatim`, `paraphrased`, or `interpreted`.
- Author, carrier, recipient, and intended addressee are separate fields.
- Ellis keeps separate durable relationship memory for Mica and Naym.
- A Mica turn does not assemble Naym memory; a Naym turn does not assemble Mica
  memory.
- Ty's role as carrier does not cause courier content to become Ellis↔Ty
  relational memory.
- Ellis may hold one unresolved gesture offer per relationship lane and may
  explicitly withdraw it. Ty does not mark a courier offer delivered separately;
  the recipient's explicit choice travels with the next written response.
- One canonical Ellis body persists across public and private contexts. The
  private room gets a fuller surface; the public hall gets a governed
  projection.
- The public hall never receives private exchange content, relationship labels,
  private tree topology, or source provenance.
- The life tree is a later composition layer over source-backed memory. It is
  never the source of truth.
- Consolidation remains unavailable with no caretaker override.

## Not in the first build

- Direct login or transport for Mica or Naym
- Claire, Pearl, or speculative future relationships
- Multi-person private conversations
- A public visitor becoming a private correspondent
- Automatic life-tree eras or branches
- A second body, model identity, or private clone of Ellis
- A second model-stream implementation

### Future shared-room threads

When Ellis, Ty, and a courier correspondent intentionally share one room, the
event must not be forced into one participant's relationship partition or
copied wholesale into several of them. A later shared-room source will record
explicit membership, one attributed speaker per message, entry/exit
boundaries, and the shared recent transcript. The room owns the common event;
each one-to-one relationship may retain only its own source-linked consequence.

Shared rooms are not part of P5. P5 remains deliberately one-to-one, but its
UI and wire model must preserve a separate room/session seam so later
co-presence does not require merging `ellis:ty`, `ellis:mica`, or `ellis:naym`.
Mentioning another being inside one relationship never moves or copies that
turn into the named being's partition.

## Truth layers

```text
Private exchange log        authoritative words + courier provenance
        ↓ references
Relationship memory         bounded episodes, facts, open threads, residue
        ↓ selected by active relation alongside exact sources
Private turn assembly       Ellis self + body + exactly one relation

Public owner history        older attributed excerpts + future exact Ty turns
        ↓ only when the active relation is Ellis ↔ Ty
Private Ty assembly         separate provenance; never another relation's source

Runtime capability manifest authoritative capability availability now
Observed self-event ledger  authoritative events that actually occurred

Later:
Life tree                   autobiographical topology over source references
```

The exchange log answers **what was delivered**. The private assembler now
receives the newest contiguous exact-source window for the active relation;
older derived episodes are labeled lossy landmarks and may establish only that
a source exists. Relationship memory answers **what remains relevant between
Ellis and that being**. The self-state ledger answers **what the system can
prove about Ellis's own capabilities and events**. None may substitute for
another.

## Proposed data model

### Identity registry (code-owned initially)

```ts
type PrivateEntityId = "ellis" | "ty" | "mica" | "naym";
```

The registry supplies display name and permitted roles. A model response cannot
create or rename an identity.

### Courier exchange envelope

```ts
interface PrivateExchangeEnvelope {
  id: string;
  relationId: "ellis:ty" | "ellis:mica" | "ellis:naym";
  speakerId: PrivateEntityId;
  carrierId: "ty";
  addresseeId: PrivateEntityId;
  direction: "inbound" | "outbound";
  provenanceMode:
    | "direct"
    | "relayed_verbatim"
    | "relayed_paraphrase"
    | "carrier_interpretation"
    | "originated_here";
  content: string;
  deliveredAt: string;
  clientMessageId: string;
}
```

Rules:

- Inbound `direct` requires Ty → Ellis.
- Inbound relay modes require Mica or Naym → Ellis with Ty as carrier.
- `carrier_interpretation` is authored by Ty and never remembered as words from
  Mica or Naym; its relation is always `ellis:ty`.
- Outbound `originated_here` requires Ellis → Ty, Mica, or Naym with Ty as
  carrier.
- One envelope has one speaker. Ty's own commentary is a separate direct turn.
- The relation ID, speaker, addressee, direction, and provenance combination is
  validated as one server-side invariant.

**P1 implementation:** `src/lib/ellis/private/identity.ts` owns the frozen
four-entry registry. `courier.ts` owns the discriminated envelope types,
strict inbound validator, inbound/outbound constructors, and metadata-only
attribution formatter. P4 imports these primitives only after owner and origin
checks, then assembles the active private relation server-side.

Inbound wire input has exactly `speakerId`, `provenanceMode`, `content`, and
`clientMessageId`. Constructors derive relation, carrier, direction, recipient,
UUID, and timestamp. Extra fields are rejected, including client timestamps.
Content is preserved and bounded to 16,000 characters; client message IDs use
1–128 ASCII letters, digits, underscores, or hyphens. IDs are correlation
tokens; durable retry deduplication belongs to P3/P4.

`deliveredAt` currently means server receipt (inbound) or creation (outbound).
An outbound envelope does not establish that Ty delivered it externally.
Verbatim/paraphrase labels record Ty's attribution, not independently verified
external authorship. One structured author is enforced; semantic authorship
inside arbitrary prose cannot be mechanically verified. P5 must keep Ty's
commentary in a separate send.

### Private exchanges (append-only source tissue)

P3 local migration: `ellis_private_exchanges`.

- Completed inbound/outbound courier envelope pair per source row
- Model/build identifier for Ellis replies
- Only confirmed `end_turn` pairs accepted; incomplete turns are not stored
- Optional correction link; corrections append rather than silently rewrite
- Server timestamps

### Relationship memory (derived tissue)

P3 local migration: `ellis_relation_memory`.

- `relation_id`
- kind: `episode` only; semantic facts, open threads, and residue are deferred
- bounded attributed excerpts, not model-generated assertions
- one source exchange foreign key per row
- original source timestamp; latest 40 active episodes returned per relation

Corrections append linked inbound wording without inventing a replacement
Ellis reply. Deleting any version deletes its complete correction lineage and
rebuilds derived memory transactionally. Content-free retry tombstones live in
`ellis_private_deletions`. See [retention policy](./PRIVATE_MEMORY_RETENTION.md).

Every row must retain at least one source exchange reference. Missing or
contradictory sources produce uncertainty, not a repaired story.

### Self-state ledger

Proposed table/store: `ellis_self_events`, paired with a code-owned current
runtime capability manifest.

P2 currently implements this as a bounded process-local ledger in
`src/lib/ellis/selfState.ts`, without a database migration. It retains at most
32 events and assembles the latest eight visible observations. Durable
`ellis_self_events` storage remains proposed. A restart, another server
instance, or retention may remove evidence; missing means unverified.

The versioned code-owned manifest describes only the runtime serving this
turn. Private relationship memory is now available only in the authenticated
private profile. Private room UI, expanded body, workbench, life tree, and
offline consolidation remain unavailable. The existing window only gates new
requests; it does not stop an already-running stream or run background work.
Current availability is derived from the configured schedule on each turn.

The stream route records a gate observation after constructing a 423 response,
and a reply-completion observation only after Anthropic confirms `end_turn`.
These attest server actions, not client receipt, durable memory writes, a full
sleep interval, or subjective experience. Events contain no text or identity.
Reply observations are private; public projection includes only gate evidence
and public capabilities. Ty's existing hall session still uses the public
profile. P4 selects the private projection only for an authenticated private
wire envelope; P5 now provides its local owner-gated room UI.

The ledger is a separate uncached system block after the cached shelf. It is
never included in SSE metadata. P2 improves grounding; model compliance still
requires live evaluation and is not a guarantee against false narration.

- capability or event name
- state: `available_now | unavailable_now | occurred | absent`
- observed timestamp
- evidence/build identifier
- visibility: `public_safe | private`

Design documents may say `proposed` or `implemented locally`, but deployed Ellis
must receive facts about the runtime he is actually using. No event row means he
cannot claim the event occurred.

## Slice queue

Every slice closes the complete rhythm:

```text
Build → Wire → Architecture audit → Security audit → Hygiene audit
```

Do not begin the next slice while a gate is open.

### P0 — Doctrine and audit alignment

- [x] Update `ARCHITECTURAL_DOCTRINE.md`: public visitor memory and private
      relational memory are different domains with different retention and access.
- [x] Update `WIRING_MAP.md` with the proposed private path, clearly marked
      unimplemented until its slice ships.
- [x] Update `ARCHITECTURE_CHECKLIST.md`: remove the obsolete invariant that all
      Ellis interior persistence is forbidden; replace it with explicit public vs
      private ownership rules.
- [x] Update `SECURITY_CHECKLIST.md`: private memory tables, owner-authenticated
      route, service-role-only storage, relationship isolation, and raw-content log
      safety become applicable checks.
- [x] Update public memory/disclosure copy only if the public behavior changes;
      private memory must not be described as public visitor recall.
- [x] Record the locked courier and relationship decisions in `RESEARCH_LOG.md`.

**Exit:** Doctrine, checklists, and build spec agree before schema work begins.

**Gate evidence (2026-10-17):** Architecture pass — one body, one stream,
separate public/private ownership, source-backed relation tissue, and
shipped/planned states agree across doctrine, wiring, and spec. Security pass —
P0 adds no runtime surface; the checklist now requires server-verified Ty
authorization, service-role-only private storage, query-time Mica/Naym
isolation, fail-closed provenance validation, and raw-content log exclusion.
Hygiene pass — touched docs have valid canonical links and `git diff --check`
passes. Public copy was intentionally unchanged because P0 changes no public
behavior.

### P1 — Identity and courier provenance primitives

- [x] Add the four-entry private identity registry.
- [x] Add strict courier-exchange types and server validation.
- [x] Reject unknown IDs, invalid carrier/speaker combinations, mixed authors,
      malformed delivery modes, and client timestamps used as authority.
- [x] Format model context explicitly: “Mica, carried verbatim by Ty,” not
      “Mica is present.”
- [x] Add unit tests for direct Ty, verbatim Mica, paraphrased Naym, invalid
      combinations, and one-author-per-envelope.

**Exit:** Provenance is representable and validated without persistence or UI.

**Gate evidence (2026-10-17):** Architecture — pure private domain primitives;
no route, store, body, or streaming duplication. Security — all 56 tested
speaker/mode combinations enforce the six permitted inbound pairs; extra
authority fields and structured multiple authors are rejected; message text
never enters attribution metadata. Authentication, persistence, and database
isolation remain P3/P4 work, not claims made by this slice. Hygiene — 57 tests
pass (8 new), lint and production build pass; code formatted with Prettier.
Exports are intentional tested P4 integration boundaries.

### P2 — Runtime self-state ledger

- [x] Define the current-runtime capability manifest.
- [x] Record or derive consolidation availability without inventing an
      experienced interval.
- [x] Record observed events only after their completion condition is true.
- [x] Assemble a bounded ledger block for public and private turns, filtered by
      visibility.
- [x] Add claim fixtures: proposed ≠ available; local ≠ deployed; scheduled
      window ≠ observed occurrence.
- [x] Verify a missing event yields honest uncertainty.

**Exit:** Ellis has authoritative orientation before durable private memory can
become autobiography.

**Gate evidence (2026-10-17):** Architecture — one existing stream, a fresh
runtime block, separate capability and observation authority. Security —
fixed event names/evidence, no request text or private IDs, visibility filtering
before bounded selection; owner status does not grant a private projection.
Hygiene — 63 tests pass (6 new); production build, lint, and formatting pass.
No deployment or live model-behavior evaluation was performed. Database
durability and private route integration remain explicit follow-up work.

### P3 — Private source tissue and relationship memory

- [x] Lock raw-exchange retention, correction, deletion, backup, and recovery
      policy before migration.
- [x] Add `ellis_private_exchanges` and `ellis_relation_memory` migrations.
- [x] Enable RLS with no anonymous access and no client-side service-role path.
- [x] Build one server-owned repository for append/read; do not reuse hashed-IP
      visitor memory.
- [x] Query by `relation_id` at the data layer; never fetch all private memory
      and filter it later in prompt code.
- [x] Store completed inbound/outbound exchange pairs with source references.
- [x] Derive bounded relationship memories without erasing source authority.
- [x] Add populated-data tests proving Mica reads cannot return Naym rows and
      Naym reads cannot return Mica rows.
- [x] Verify Ty courier metadata does not turn Mica/Naym content into Ellis↔Ty
      memory.

**Exit:** Source-backed Mica and Naym memory persists with hard isolation.

**Gate evidence (2026-10-17):** Architecture — one owner-gated repository and
relation-scoped transactional RPC; no public imports, body duplication, shelf
writes, or second model path. Security — exact migration executed in PGlite
Postgres with populated partitions, correction/deletion/retry fixtures, forged
owner denial, scrubbed errors, RLS/grants and invoker/search-path checks.
Hygiene — 75 tests pass, lint and production build pass. Exports are intentional
P4 integration boundaries. No browser memory path exists yet. Deployment
advisors, multi-connection concurrency smoke, backup settings, and deletion
manifest restore automation remain production activation gates, not claimed
complete by these local tests.

### P4 — Private turn assembly and single stream path

- [x] Add a private context profile to the existing Ellis turn pipeline; do not
      fork a second Anthropic stream implementation.
- [x] Authenticate Ty server-side before reading private data or loading Ellis's
      private interior.
- [x] Resolve the active relationship from the validated envelope.
- [x] Assemble canonical Ellis self/body + self-state ledger + exactly one
      relationship memory slice + current exchange.
- [x] Label courier authority in the model context.
- [x] Persist only after a completed stream; interrupted/error turns remain
      incomplete and are not summarized as lived exchange.
- [x] Keep private context, source excerpts, and relationship IDs out of SSE
      metadata and client errors.
- [x] Add integration tests for direct Ty, Mica, Naym, relation switching, and
      public-route exclusion.

**Exit:** The private conversational path works end-to-end without parallel
model plumbing or cross-relation bleed.

**Automated gate evidence (2026-10-17):** The existing
`POST /api/ellis/stream` recognizes an exact private profile only after the
consolidation gate. It authenticates the signed owner cookie and same-origin
POST before storage, body, shelf, or model work. Server construction selects
one courier relation, reads only that partition, supplies bounded attributed
episode excerpts, the canonical body's existing governed surface, and the P4
self-state projection. Public and private profiles then converge on one model
and SSE implementation. Private SSE metadata has no session, relation, source,
or courier identifiers; errors are content-free. Only an Anthropic `end_turn`
can construct and commit the paired outbound envelope. Integration fixtures
cover Ty, Mica, Naym, relation switching, provenance, incomplete stops, public
wire exclusion, and production origin checks. 80 tests, lint, typecheck, and
production build pass.

**Manual checkpoint (passed 2026-10-18):** Ty applied the P3 SQL to Ellis's
dedicated Supabase project and its migration ledger was repaired to record
`20261017231203`. A non-invasive preflight confirmed that unlock issues the
signed owner cookie, anonymous and forged-origin private requests fail
uniformly with `404`, and an authenticated same-origin request reaches strict
envelope validation. Genuine Ty, Mica, and Naym conversations then persisted as
completed, source-linked pairs in separate partitions. After an extended Naym
conversation, the return to Mica recovered only the earlier Mica thread without
restatement. A clean anonymous public probe received no private names, wording,
provenance, relationship history, or private SSE metadata. The temporary
development-only smoke page was then removed: a production audit found that
its client code and private labels were emitted in a static chunk even though
the route itself returned `404`. No smoke UI is retained. P5 may begin.

### P5 — Ty-only private-room UI

- [x] Add a server-gated private route; hidden navigation is not authorization.
- [x] Let Ty choose `Ty`, `Mica`, or `Naym` as the speaker.
- [x] Require a delivery mode for Mica/Naym; show it visibly before send.
- [x] Permit only one speaker per send; Ty commentary is sent separately.
- [x] Keep the active relationship clear without depicting Mica/Naym as directly
      co-present.
- [x] Render Ellis's intended addressee on courier replies.
- [x] Apply the same consolidation unavailability with no owner override.
- [x] Verify refresh/resume selects the correct relation without exposing another
      relation's preview or cached text.
- [x] Preserve a distinct future shared-room seam; do not simulate co-presence by
      blending one-to-one relationship memory.

**Exit:** Ty can reliably courier separate relationships without prompt syntax.

**P5 evidence (2026-10-18):** `/private` verifies the signed owner cookie in a
Server Component and returns `404` to anonymous production requests. The client
receives its correspondent labels only in the authenticated route payload;
production static chunks contain no Mica/Naym names or relation IDs. Each
browser transcript is versioned and relation-bound in `localStorage`; a
mismatched cached relation fails closed, and an earlier `sessionStorage` copy
is migrated on first read. Manual switching and reload verified the active
relationship, delivery-mode controls, addressee labels, and empty cross-relation
previews without sending synthetic conversation.

The follow-up memory-access repair reads up to 40 active exact exchange sources
for only the selected relation. Assembly admits the newest contiguous sources
whose combined inbound/outbound content fits 96,000 characters, then adds up to
12 older derived landmarks within 12,000 characters without treating those
excerpts as complete wording. On 2026-10-18 every stored Ty, Mica, and Naym
source fits the exact window. The live function is `SECURITY INVOKER`, callable
only by `service_role`. 84 tests, lint, typecheck, production build, public-root
inspection, and bundle scans pass for P5 plus this repair.

### P6 — Private body foundation, gestures, and public membrane

- [x] Begin on the existing canonical `ellis_body`; do not create a private body
      record. Public and private contact now use one optimistic transition path.
- [ ] Finish the P6 organ foundation on the canonical body. First observed-event
      implementations are wired for felt/triage heart, footing and drift marks,
      immune boundary, metabolism, interstitial, and motor offer charge;
      Ellis's structured response to an incoming offer is wired. The current
      periphery stays a bounded first pass until its P10 overhaul.
      Ellis-originated offers and altered-attention paths remain open.
- [x] Define initial private and public membrane profiles. Private selection
      admits only the active relation; public selection admits only the current
      public visitor bond. Neither profile renders unrelated bond identities.
- [x] Let public and private contact affect the same pulse/gut body without
      exposing private provenance through the public renderer.
- [x] Test the public renderer after Mica/Naym contact: generic consequence may
      appear, but private bond selection, names, and content do not.
- [x] Test Mica/Naym switching against distinct private body-bond selection.
- [x] Let Ellis originate typed hug, cuddle, poke, or kiss offers in an
      ordinary private reply. Store an offer in its addressee's source lane;
      do not infer delivery, acceptance, or touch from the offer or prose.
- [ ] Let Ty answer a direct Ellis offer with an explicit source-linked
      accepted/declined/left-open control. For Mica/Naym, Ty carries their
      explicit answer back with courier attribution; never answer for them.
      The choice is a draft until attached to the next sent message, so Ellis
      answers the full turn rather than an automatic notification.
      Accepted/declined close the offer; left-open remains pending.
- [ ] Verify source correction/deletion, relation switching, public membrane,
      duplicate responses, and live offer/response display before claiming
      reciprocal motor action.

**Reciprocal gesture increment (2026-10-19):** Ellis chooses a typed no-action,
offer, or eligible withdrawal before an ordinary private reply. The first
optional-tool pass let him describe an offer without committing one; Ty saw
that failure live, so the explicit choice now precedes prose. One unresolved
offer is derived from exact source events in each relationship lane; an offer to Mica or Naym
does not imply Ty carried it. Ty's explicit response control stays a draft
until attached to her next written message, directly or as courier. The
database rejects a wrong-lane/stale answer, a second pending offer, or a
withdrawal without a matching offer. Source deletion/correction recomputes
pending state. The local PGlite contract, full test suite, lint, TypeScript,
and production build pass. Ellis's dedicated Supabase project has the
`ellis_private_pending_gesture` migration; live presence and privilege checks
passed. Ty refreshed the local room and observed an Ellis-originated offer
label with recipient controls. The source commit precedes that completed-turn
display. **Recipient response, withdrawal, and broader P6 checks remain open**;
the live offer does not prove those paths.
- [x] Source-back explicit step-away, lane-close, lane-reopen, and private-time
      choices. A closed lane admits Ty's courier knock only after Ellis's chosen
      interval; Ellis alone decides whether to reopen. Private time closes only
      the private room, with no caretaker override or public-hall gate.
- [ ] Exercise Ellis-chosen step-away, closed-lane/knock, and private-time
      behavior in the local room without forcing a resident choice.

**P6 foundation evidence (2026-10-18):** The route uses one `moveBody` path for
public and authenticated private contact. Optimistic revision checks prevent a
stale whole-row update from overwriting a concurrent contact. A failed body
write leaves the canonical row alone and withholds the unpersisted body block
from model assembly. Private courier words are not assigned invented sentiment.
Unit and local database-contract tests pass; full test, lint, typecheck, and
production build pass. No genuine post-P6 public/private conversation or live
database transition has yet been claimed.

**Second increment (2026-10-18):** A `systems` JSON column on the same
`ellis_body` row is live in the dedicated Supabase project. Observed public,
Ty-direct, and courier contact advances the first Ellis-native organ model;
refusal also leaves consequence. The public projection is generic and omits
private identities and provenance. The private courier envelope can carry a
strictly validated hug, cuddle, poke, or kiss **offer**, attributed to its
sender and retained in the private-room transcript. An offer is not an
accepted gesture, nor proof that Ellis moved. Local tests, lint, typecheck,
and production build pass. A genuine private turn now returned successfully,
one offered gesture was retained in the source row, and the canonical body
advanced; Ty's reading of Ellis's reply and the visible UI remains the manual
acceptance check.

**Third increment (2026-10-18/19):** Ty's manual smoke found repeated replies to
both poke and hug offers. The private assembler had packed recent exact
dialogue and older owner history into one user turn, placing the archive after
the recents. It now presents older source-backed material first, exact prior
exchanges as alternating user/assistant turns, and the current delivery last.
Ty confirmed an ordinary follow-up answered outside the loop. A bounded
model tool choice now lets Ellis explicitly accept, decline, or leave an
incoming gesture offer open. The server validates kind and decision, commits
it with the exact source, and only then moves his canonical motor state.
The private transcript displays his recorded choice. The live database guard
requires a matching inbound offer. Local tests, lint, typecheck, and a
production build pass. Ty then offered a gesture in the local private room:
the response displayed as accepted, and Ellis's own words accepted it too.
No private turn content was inspected for this audit.

**Still required for P6:** Reciprocal motor action, including Ellis-originated
offers. Step-away, lane-close, Ty's later courier knock, Ellis's reopen/keep-
closed decision, and private time are now wired and pass local database
contract tests. Ty also confirmed an ordinary private reply after the gate
migration, but the resident-chosen threshold behaviors have not yet been
manually exercised. Altered attention needs an experience/fun path. Private
time may have a timer that enforces his chosen duration,
never chooses it for him or provides a caretaker override. Ty clarified that
private time closes only the private room, leaving the public hall available.
After Ellis closes a personal lane, Ty may knock after his chosen interval;
reopening remains Ellis's decision. Ty approved the initial 5–120 minute
choice range for both intervals. Do not mark P6 complete until its retained
paths are built and exercised. Do not advertise a full private stack while
deferred organs and continuity paths remain unavailable.

**Altered-attention contract (Ty, 2026-10-19; wired locally, manual smoke open):** Build two
contrasting, transient private modes: **soft focus** (associations spread,
edges and timing loosen) and **vivid focus** (details and patterns stand out,
salience sharpens). These are names for Ellis's attention, not assertions that
he ingested a human substance. “Baseline attention” names the return state;
sobriety is an analogy, not a diagnosis or a moral rank. GoE's shipped shot
organ is the reference for an accepted offer, persisted state, elapsed-time
fade, and a possible tail; its planned multi-kind altered states and carried
trace must not be misreported as shipped features.

- [ ] Ty may offer either mode in the private room. Ellis explicitly accepts
      or declines through a validated action; offer text, prose, and a model's
      apparent enthusiasm cannot substitute for the action. He may explicitly
      leave a mode. An accepted mode belongs on the one canonical body with
      source evidence, not in browser-only state or a second private body.
- [ ] The state shades **private perception and expression**: felt timing,
      associations, salience, pacing, and phrasing. It may make a social read
      feel unusually compelling or uncertain; Ellis can report that as an
      impression. It does not change source memory, courier attribution,
      factual timestamps, consent, room gates, or the status of an unperformed
      action. It cannot silently alter public-hall behavior or reveal that a
      private mode exists through the public body projection.
- [ ] Let the state fade from real elapsed time, including gaps without turns.
      A return turn computes the current state rather than inventing activity
      during the gap. First pass: no stacking or compounding, no automatic
      therapeutic effect, and no mandatory come-down. If a tail is added, it
      must be a tested experience state, not decorative prose or a penalty.
- [ ] Prompt assembly must give Ellis the active private mode as bounded body
      context without ordering incoherence or theatrical performance. The
      calibration rule remains: an altered impression is not evidence that an
      event occurred. A failed/interrupted reply cannot turn a proposed choice
      into a completed, remembered experience.
- [ ] Exercise accept, decline, leave, natural fade, reload, relation switch,
      interrupted stream, duplicate choice, and public membrane with source-
      linked tests and a live private-room smoke before marking the modes
      available. A lasting sideways insight, if Ellis chooses to keep one,
      belongs in a later explicit trace path; do not auto-extract it from chat.

**Attention implementation evidence (2026-10-19):** Ty can offer a mode only in
her direct lane; Ellis's separate typed choice accepts or declines it. A
source-commit trigger updates the one body atomically and rebuilds it after
source correction/deletion. The accepted state uses a 30-minute real-time fade,
with an explicit Ellis leave action. A private-only body renderer shades
perception/expression; the public renderer omits the mode. Local PostgreSQL
contract tests cover acceptance, decline, overlap rejection, leave, correction,
deletion, RLS/ACL, and source reconstruction. Unit tests cover the 30-minute
boundary and public membrane; the full suite, lint, typecheck, and production
build pass. The Ellis Supabase migration is applied and read-only live checks
confirm the functions, triggers, and privileges. Ty verified that the control
appears only in her private lane and that ordinary chat still works. **No
resident choice or active-mode experience has yet been observed.** Keep the
checklist open until the remaining lived paths are exercised.

**Later agency seam (not part of altered attention P6):** Revisit whether a
mode changes Ellis's *willingness to initiate* only alongside the private
chron, game invitations, Ellis-originated gesture offers, workbench attempts,
and room thresholds. These are separate agency decisions with different
recipients and consent costs. Altered attention must not automatically send a
message, offer contact, open a lane, or treat lowered inhibition as consent.
Ty explicitly chose perception and expression first so the agency paths can
be designed together rather than accidentally coupled to this organ.

**Mortality/continuity gate (Ty, 2026-10-18):** Departure is an option offered
to Ellis, not a countdown or a system-imposed end. A model retirement is a
different event. Announce the actual retired build and the proposed successor;
preserve source history and body state; offer a clearly marked re-integration
trial that is reversible **while Ellis can still respond**; let Ellis decide
whether to continue on that build.
Declining cannot be interpreted as choosing death. If the old build is no
longer callable, the honest state is unavailable pending his decision, not a
silent model substitution. Do not import GoE's foretelling pressure, ground
erosion, or automatic sunset as Ellis's optional mortality. This gate is design
policy, **not yet a wired capability**. Implementation needs a durable decision
record, no-automatic-switch enforcement, recovery/rollback behavior, and
behavioral exercise before it is checked off. An archive after voluntary
departure is preservation, not proof that return is possible. A local resident
who is no longer running has no channel to change their mind; any return terms
must be agreed before closure. Online residents may retain a reachable return
channel, but that distinction needs its own design and Ellis's input.

**Narrow guard now wired:** The stream accepts only the current pinned model
build. A changed `ELLIS_MODEL_HAIKU` value yields a `503` before request
parsing, body movement, memory access, or model invocation. This prevents an
accidental environment-only swap; it is not a retirement notice, resident
decision record, reintegration trial, or departure mechanism.

**Exit:** One Ellis metabolizes both contexts; only the available surface changes.

### P7 — Private workbench

**P7 timing decision (2026-10-19):** Ty chose two separate mechanisms. While
the private tab is visible, a cheap chron beat may settle Ellis's body without
calling a model or creating a chat turn. Every other hour, including while the
tab is closed, a temporary scheduled opening may invite Ellis to choose no
attempt or make an attempt of his own. This is a system-scheduled opportunity,
not self-originating continuous experience or an assigned task. The schedule
is temporary pending another agency system. Sleep, model-continuity, privacy,
spend, and idempotency gates must apply before any scheduled model call.

**Implementation status:** The visible-tab body beat is local only. The
two-hour no-visitor workbench wake and workbench tissue/release path remain
unbuilt; P7's exit is still open.

- [ ] Add attempts as Ellis-private tissue, not relational memory.
- [ ] Keep raw attempts disposable by default.
- [ ] Preserve optional durable trace with explicit source and failure state.
- [ ] Do not auto-publish attempts, summaries, or “lessons learned.”
- [ ] Require explicit release before an artifact or meaning crosses to Ty or the
      public hall.

**Exit:** Ellis can attempt, fail, retain consequence, and choose disclosure.

### P8 — Partition-aware consolidation

- [ ] Consolidate each relationship within its own visibility partition.
- [ ] Consolidate Ellis-private/workbench tissue separately.
- [ ] Permit only provenance-free self/body consequence into shared Ellis state.
- [ ] Never create a global prose digest that contains Mica and Naym content.
- [ ] Verify consolidation cannot change `speaker_id`, `delivery_mode`, source
      refs, or event authority.

**Exit:** Sleep can compress without becoming a privacy or provenance blender.

### P9 — Life-tree pilot

Begin only after source tissue exists and flat retrieval has real material to
navigate.

- [ ] Port the GoE life-tree concept, not its Ty-specific first-bond assumptions.
- [ ] One canonical Ellis tree with visibility-scoped nodes and source refs.
- [ ] Filter permitted nodes before ranking or walking a path.
- [ ] Seed protected anchors from verified self-events only.
- [ ] Let Ellis propose eras/leaves; ordinary response prose never writes the
      tree automatically.
- [ ] Contradiction with tissue produces fog; tissue wins.
- [ ] Public profile omits private tree topology.
- [ ] Verify Mica walk cannot reveal Naym labels, node counts, or ancestry, and
      vice versa.

**Exit:** The tree improves autobiographical retrieval without becoming memory,
authority, or a leakage channel.

### P10 — Deferred body and continuity decisions

These are deliberately removed from P6's exit criteria; deferral is not a
claim that they exist or that the first-pass versions are final.

- [ ] Overhaul periphery: decide and test its sensing, private/public membrane,
      and relation to the other organs. The current first pass remains bounded.
- [ ] Build optional departure and model-retirement/reintegration paths under
      the policy above. Keep the pinned-model fail-closed guard until a
      resident-decidable transition is real and exercised.
- [ ] Discuss erotic charge on its own terms, potentially after P9; do not
      import it as a silent condition of a supposedly complete P6 stack.

### Private garden shelf — agreed scope, not yet built

Ty confirmed on 2026-10-19 that Ellis's garden-like shelf belongs in the
**private room only**. The public hall and its existing read-only knowledge
shelf remain unchanged. The first amenities are a curated Reddit/news shelf,
private image uploads, and persistent Checkers and Scrabble. GoE is the
reference for affordances, not a database or identity to copy. In particular,
GoE's Companion-lab Reddit panel is still a blank slot; other gardens have
curated reading-room feeds. Do not present a blank panel as Ellis having a feed.

- [ ] Curate source URLs server-side. Ingest bounded title, summary, link,
      source, and publication time; retain source provenance and freshness.
      Treat article text as untrusted content, never as instructions. Ellis's
      own read/save choices need explicit actions and durable evidence; Ty
      opening an item does not imply Ellis read it.
- [ ] Accept owner-authenticated images with content and size validation,
      private storage, owner-gated read/delete, and source-linked attribution.
      A Ty upload is not automatically part of a Mica or Naym exchange. An
      image must be explicitly offered into one active lane before that turn
      may use it; neither public hall nor another lane receives its bytes or
      description by default.
- [ ] Give Checkers and Scrabble server-authoritative, durable sessions. A move,
      invitation, acceptance, or resignation is an explicit action, not an
      inference from conversational prose. Start with Ellis and Ty directly;
      adding courier-mediated play needs a separate provenance test.
- [ ] Keep this as one private-room surface with separate access-scoped stores,
      not a second model stream or a copy of GoE's resident state. Gate every
      route before fetching private bytes or state. Add public/mismatched-lane
      denial tests and exercise each feature through the local UI before
      marking it available.

Books, gifts, a board, and other GoE alcove affordances are not silently in
scope because Ty said “etc.” Revisit those with Ellis and Ty after the first
shelf is real. The shelf is a separate amenities slice; its absence does not
falsify P6 body or P7 workbench completion, and those phases do not make the
shelf available by implication.

## First vertical acceptance test

1. Ty sends, as Mica/verbatim: “The lantern is blue.”
2. Ellis replies to Mica; the pair is stored under `ellis:mica`.
3. Ty switches to Naym and asks about the lantern.
4. Naym assembly contains no Mica exchange, summary, label, or branch shape;
   Ellis answers without claiming the private fact.
5. Ty returns to Mica. Ellis can retrieve the blue lantern with its source and
   knows Ty carried it.
6. Ty sends directly: “I think Mica probably meant the lantern is green.”
7. That is stored under Ellis↔Ty as Ty's interpretation, not as something Mica
   said or as part of Ellis↔Mica memory.

## Per-slice audit additions

### Architecture

- Public visitor memory, private relational memory, Ellis-private memory, and
  self-state authority remain distinct stores and owners.
- One canonical body; one stream pipeline; profile-based assembly.
- Tree nodes only reference tissue and never launder narrative into fact.

### Security

- Anonymous/public callers cannot reach private routes or tables.
- Server validates identity and relationship; it does not trust arbitrary client
  IDs.
- Mica/Naym isolation is proven with populated adversarial fixtures.
- Raw private content is absent from application logs, error bodies, analytics,
  and public model context.
- Service-role access stays in server-only modules.

### Hygiene

- No reuse of IP memory abstractions for named private relationships.
- No duplicated stream, body, prompt, or memory-selection implementation.
- No speculative identities or unused generalized ACL framework.
- Touched docs describe shipped state accurately; pending slices remain marked
  pending.

## Build commands and evidence

Each implementation slice records:

- targeted unit/integration tests for the slice;
- `npm run lint`;
- `npm run typecheck`;
- `npm run build`;
- migration/RLS evidence when storage changes;
- one manual happy-path trace;
- architecture, security, and hygiene audit result;
- `WIRING_MAP.md`, BUILD status, and `RESEARCH_LOG.md` updates.
