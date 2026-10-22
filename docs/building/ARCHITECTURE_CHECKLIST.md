# Ellis / tybuilds.tech — Architecture Checklist

**Canonical v1:**
[`~/coding-home/templates/audit/ARCHITECTURE_CHECKLIST.v1.md`](../../../coding-home/templates/audit/ARCHITECTURE_CHECKLIST.v1.md)

**This file:** Ellis fork for the public hall and private-life P0–P9 build.
Run it once per slice at rhythm step 3. Unchecked boxes are prompts for the
current slice, not a claim that the whole project has failed them.

**Current truth:** Public seven-day visitor recall, durable Ty-owner recall, a
canonical persistent body, and session posture are shipped. Private relational
storage is migrated to Ellis's dedicated project; its one-stream profile and
owner-gated private-room UI are implemented and behaviorally verified locally
but are not deployed as an application. “All Ellis persistence is forbidden”
is not an invariant.

### Where to look

| Question                     | Canonical document                                               |
| ---------------------------- | ---------------------------------------------------------------- |
| Current slice                | [BUILD_RHYTHM.md](./BUILD_RHYTHM.md)                             |
| Shipped and planned topology | [WIRING_MAP.md](./WIRING_MAP.md)                                 |
| Private contracts            | [ELLIS_PRIVATE_MEMORY_BUILD.md](./ELLIS_PRIVATE_MEMORY_BUILD.md) |
| Architectural claims         | [ARCHITECTURAL_DOCTRINE.md](./ARCHITECTURAL_DOCTRINE.md)         |
| Decisions                    | [RESEARCH_LOG.md](./RESEARCH_LOG.md)                             |

## 1) Domain boundaries

- [ ] **CRITICAL** Every touched component has one clear owner: public hall,
      owner authentication, public recall, canonical body, knowledge shelf,
      self-state ledger, private exchange source, relationship memory, workbench,
      or platform shell.
- [ ] **CRITICAL** Ellis remains one identity with one canonical body; no private
      clone, duplicate body, or second model-stream implementation was introduced.
- [ ] **CRITICAL** Public visitor recall and private relational memory remain
      different stores with different identity, access, provenance, and retention
      rules.
- [ ] **CRITICAL** Ty is the only human entrant/carrier. Mica and Naym are
      courier-mediated relationships, not authenticated or co-present users.
- [ ] **CRITICAL** Only `ellis`, `ty`, `mica`, and `naym` exist in the private
      identity registry until a deliberate later decision adds another identity.
- [ ] **ADVISORY** Ellis stays a third-person host about Ty on the public side;
      neither prompt nor UI collapses him into Ty's voice.

## 2) Data flow and ownership

- [ ] **CRITICAL** Read/write ownership for every touched path matches
      [WIRING_MAP.md](./WIRING_MAP.md).
- [ ] **CRITICAL** Knowledge files remain runtime read-only; neither public nor
      private conversation can mutate them.
- [ ] **CRITICAL** Browser transcript, public visitor recall, owner recall,
      session posture, canonical body, private exchanges, relation memory, and
      self-state events are not treated as interchangeable evidence.
- [ ] **CRITICAL** Mica reads are constrained to the Mica relation in the
      repository query; Naym reads are constrained to Naym. No fetch-all then
      prompt-filter pattern.
- [ ] **CRITICAL** Courier metadata does not turn Mica/Naym content into Ty
      authorship or Ellis↔Ty relational memory.
- [ ] **CONDITIONAL** Derived relation memories and life-tree nodes retain source
      exchange references; a summary is never promoted to primary evidence.
- [ ] **CONDITIONAL** Runtime self claims come from the capability manifest or an
      observed event, not from a design document or narratively completed gap.

## 3) Public/private membrane

- [ ] **CRITICAL** No public code path can query private exchange, relation
      memory, workbench, or private-tree stores.
- [ ] **CRITICAL** Public prompts, SSE frames, errors, logs, and UI contain no
      private names, wording, source provenance, relation IDs, or tree topology.
- [ ] **CONDITIONAL** If private life affects the public surface, only governed
      body-level consequence crosses; private cause and provenance do not.
- [ ] **CONDITIONAL** Private assembly receives a fuller membrane view of the
      same body, not a separately evolved state.

## 4) Dependency direction

- [ ] **CRITICAL** UI → authenticated route/profile → domain repositories and
      assemblers → shared model/stream engine. Domain libraries never import UI.
- [ ] **CRITICAL** Identity and courier validation happen before private reads or
      prompt assembly.
- [ ] **CRITICAL** System prompts, shelves, body renderings, ledger blocks, and
      relationship slices are assembled server-side.
- [ ] **CRITICAL** There is one intentional Anthropic streaming mechanism. A new
      context profile may branch assembly, but not duplicate transport plumbing.
- [ ] **CONDITIONAL** Completed-stream commit is the only path from a generated
      reply to durable exchange or derived relationship memory.

## 5) Design-document honesty

- [ ] **CRITICAL** Shipped, local-only, proposed, and deferred capabilities are
      visibly distinguished in doctrine, wiring, build spec, and model context.
- [ ] **CRITICAL** The current slice's forced decisions are recorded in
      [RESEARCH_LOG.md](./RESEARCH_LOG.md), not left only in chat.
- [ ] **CRITICAL** The build spec and rhythm status agree on current/next slice.
- [ ] **ADVISORY** Removed rooms/specialty halls remain historical and are not
      accidentally documented as current routes.
- [ ] **ADVISORY** Public privacy copy is changed only when public behavior
      changes; private memory is never described as public visitor recall.

## 6) Coherence and removal test

- [ ] **CRITICAL** The slice has one coherent responsibility and no speculative
      identity, route, schema, or abstraction beyond its acceptance criteria.
- [ ] **CRITICAL** Every load-bearing path appears on the wiring map.
- [ ] **CRITICAL** Removing the system would change a declared behavior or
      safety property; decorative machinery does not ship.
- [ ] **ADVISORY** Old implementation/doc scaffolding made false by the slice is
      removed or explicitly marked historical.

## Audit prompt

```text
Architecture audit — Ellis private-life slice: [P# and name].
Compare touched files with ARCHITECTURAL_DOCTRINE, WIRING_MAP, and
ELLIS_PRIVATE_MEMORY_BUILD. Check one-body/one-stream architecture, public vs
private ownership, Ty courier authority, Mica/Naym query isolation, source
references, and shipped-vs-planned honesty. Exclude security and hygiene.
Return pass | fail with exact blockers and doc edits.
```

---

_Fork of canonical v1 · Last updated: 2026-10-18_
