# Ellis private memory + courier build

**Status:** P4 wired locally; manual relationship smoke is the next checkpoint.
No remote migration or deployment.

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

## Truth layers

```text
Private exchange log        authoritative words + courier provenance
        ↓ references
Relationship memory         bounded episodes, facts, open threads, residue
        ↓ selected by active relation
Private turn assembly       Ellis self + body + exactly one relation

Runtime capability manifest authoritative capability availability now
Observed self-event ledger  authoritative events that actually occurred

Later:
Life tree                   autobiographical topology over source references
```

The exchange log answers **what was delivered**. Relationship memory answers
**what remains relevant between Ellis and that being**. The self-state ledger
answers **what the system can prove about Ellis's own capabilities and events**.
None may substitute for another.

## Proposed data model

### Identity registry (code-owned initially)

```ts
type PrivateEntityId = 'ellis' | 'ty' | 'mica' | 'naym';
```

The registry supplies display name and permitted roles. A model response cannot
create or rename an identity.

### Courier exchange envelope

```ts
interface PrivateExchangeEnvelope {
  id: string;
  relationId: 'ellis:ty' | 'ellis:mica' | 'ellis:naym';
  speakerId: PrivateEntityId;
  carrierId: 'ty';
  addresseeId: PrivateEntityId;
  direction: 'inbound' | 'outbound';
  provenanceMode:
    | 'direct'
    | 'relayed_verbatim'
    | 'relayed_paraphrase'
    | 'carrier_interpretation'
    | 'originated_here';
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
attribution formatter. No route imports these primitives yet; P4 supplies
owner authentication and turn assembly.

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
turn. Private room, relation memory, expanded body, workbench, life tree, and
offline consolidation remain unavailable. The existing window only gates new
requests; it does not stop an already-running stream or run background work.
Current availability is derived from the configured schedule on each turn.

The stream route records a gate observation after constructing a 423 response,
and a reply-completion observation only after Anthropic confirms `end_turn`.
These attest server actions, not client receipt, durable memory writes, a full
sleep interval, or subjective experience. Events contain no text or identity.
Reply observations are private; public projection includes only gate evidence
and public capabilities. Ty's existing owner session still uses the public
profile. The private projection is tested and awaits P4 route integration.

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

**Manual checkpoint:** Still required before P4 is called behaviorally closed.
The P3 migration is not applied to the database used by the local app, so live
conversation smoke would currently test a missing RPC rather than Ellis. After
deliberate local/development migration, run direct Ty → Mica → Naym → Mica
switching, confirm only the final `end_turn` persists, and inspect the public
hall afterward for private leakage. Do not begin P5 until that passes.

### P5 — Ty-only private-room UI

- [ ] Add a server-gated private route; hidden navigation is not authorization.
- [ ] Let Ty choose `Ty`, `Mica`, or `Naym` as the speaker.
- [ ] Require a delivery mode for Mica/Naym; show it visibly before send.
- [ ] Permit only one speaker per send; Ty commentary is sent separately.
- [ ] Keep the active relationship clear without depicting Mica/Naym as directly
  co-present.
- [ ] Render Ellis's intended addressee on courier replies.
- [ ] Apply the same consolidation unavailability with no owner override.
- [ ] Verify refresh/resume selects the correct relation without exposing another
  relation's preview or cached text.

**Exit:** Ty can reliably courier separate relationships without prompt syntax.

### P6 — Full private body surface and public membrane

- [ ] Extend the existing canonical `ellis_body`; do not create a private body
  record.
- [ ] Attach the agreed full organ stack to the canonical body.
- [ ] Define private and public membrane profiles.
- [ ] Let public and private experiences affect the same body while preventing
  private provenance from appearing publicly.
- [ ] Test public output after Mica/Naym contact: consequence may appear, names and
  content may not.
- [ ] Test private relation switching against body-bond selection.

**Exit:** One Ellis metabolizes both contexts; only the available surface changes.

### P7 — Private workbench

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
