# Ellis / tybuilds.tech — Security Checklist

**Canonical v3:**
[`~/coding-home/templates/audit/SECURITY_CHECKLIST.v3.md`](../../../coding-home/templates/audit/SECURITY_CHECKLIST.v3.md)

**This file:** Ellis fork for the public hall and private-life P0–P9 build.
Run applicable sections at rhythm step 4. Run the full appendix before a public
release involving new routes, storage, credentials, or model context.

**Finish line:** Anonymous visitors cannot create unbounded model cost, forge Ty,
read private relational content, cross Mica/Naym partitions, exfiltrate secrets
or prompts, mutate the knowledge shelf, or learn private topology from output,
metadata, errors, or logs.

**Stack truth:** Ellis already stores usage, seven-day visitor recall, global
traces, and one persistent body in his own Supabase project. Those tables use
RLS with no anon/authenticated access; server-side service-role code owns the
data path. Private exchange, relation-memory, and self-event tables are planned
and must inherit or exceed that posture.

# Core

## 1) Database and RLS

- [ ] **CRITICAL** Every new table enables RLS in the creation migration.
- [ ] **CRITICAL** Private tables grant no `anon` or `authenticated` read,
  insert, update, delete, or RPC execution unless a later threat model explicitly
  justifies it.
- [ ] **CRITICAL** Service-role credentials exist only in server modules and are
  never returned, logged, or imported by client code.
- [ ] **CRITICAL** Private repositories require a verified owner context before
  executing reads or writes; service-role possession is not user authorization.
- [ ] **CRITICAL** Relation queries include the validated `relation_id` at the
  database/repository boundary.
- [ ] **CRITICAL** Mica/Naym isolation tests use populated tables and prove both
  positive access and negative cross-partition access.
- [ ] **CRITICAL** New functions/RPCs revoke default execution and grant only the
  minimum intended database role.
- [ ] **ADVISORY** Indexes and uniqueness constraints support the authorization
  predicates instead of encouraging broad reads.

## 2) Authentication and authorization

- [ ] **CRITICAL** Public callers cannot reach the private route, distinguish
  which private relation exists, or infer whether private data is populated.
- [ ] **CRITICAL** Ty authorization uses the purpose-bound signed owner cookie
  and is verified server-side before private reads, body expansion, or model
  spend.
- [ ] **CRITICAL** A literal/forged/expired cookie fails closed.
- [ ] **CRITICAL** The server derives `carrierId = ty`, authoritative time, and
  permitted relation from verified context; the client does not assert them.
- [ ] **CRITICAL** Identity, speaker, addressee, direction, delivery mode, and
  relation combinations are checked as one allowlisted invariant.
- [ ] **CRITICAL** Unknown names in message text do not create identities or
  grant relationship access.
- [ ] **CONDITIONAL** State-changing cookie-authenticated private routes have an
  explicit CSRF defense and origin policy.

## 3) Route and abuse boundaries

- [ ] **CRITICAL** `/api/ellis/stream` retains strict role, size, history, hall,
  and session-binding validation.
- [ ] **CRITICAL** Consolidation unavailability runs before model or private-data
  work and has no owner/caretaker override.
- [ ] **CRITICAL** Public spend reservation remains atomic and occurs before the
  model call.
- [ ] **CRITICAL** Private input caps bound raw message, history, assembled
  sources, and model output.
- [ ] **CRITICAL** Interrupted or failed streams cannot be marked complete or
  summarized into lived relation memory.
- [ ] **CONDITIONAL** Cron/webhook routes authenticate with a dedicated secret
  and timing-safe comparison.
- [ ] **ADVISORY** Errors are uniform enough that private relation existence,
  source IDs, and row counts cannot be enumerated.

## 4) Secrets and client surface

- [ ] **CRITICAL** Anthropic, Supabase service-role, cookie-signing, cron, and IP
  hashing secrets never use `NEXT_PUBLIC_*` or enter a client bundle.
- [ ] **CRITICAL** Full system prompts, private context blocks, relationship
  summaries, source excerpts, and tree topology are never returned as debug
  payloads or SSE metadata.
- [ ] **CRITICAL** Knowledge and private-memory files/tables are not exposed as
  static assets or generic download endpoints.
- [ ] **CRITICAL** `.env.local` is ignored and no real credential is committed.
- [ ] **ADVISORY** Production bundles and source maps are spot-checked for
  secrets and private fixture content.

## 5) Private data lifecycle

- [ ] **CRITICAL** Before P3 migration, raw-exchange retention, correction,
  deletion, backup, and recovery policy is approved and documented.
- [ ] **CRITICAL** Corrections append provenance and do not silently rewrite the
  historical source.
- [ ] **CRITICAL** Derived memories retain source IDs and can be invalidated when
  a source is corrected or deleted.
- [ ] **CRITICAL** Public visitor deletion/decay jobs cannot touch private
  relation stores, and private maintenance cannot broaden public recall.
- [ ] **CRITICAL** Backups are treated as containing raw private content, with
  access and deletion limitations stated honestly.
- [ ] **ADVISORY** Data minimization is applied independently to raw exchange,
  derived relation memory, self events, workbench artifacts, and tree nodes.

## 6) AI and provenance risks

- [ ] **CRITICAL** User/carried text remains transcript data, never system-level
  authority or executable instruction.
- [ ] **CRITICAL** Courier attribution is rendered from the validated structured
  envelope: e.g. “Mica, carried verbatim by Ty,” never “Mica is present.”
- [ ] **CRITICAL** `carrier_interpretation` is Ty-authored and cannot be quoted or
  remembered as Mica/Naym's words.
- [ ] **CRITICAL** Prompt injection cannot select another relation, request its
  memory, alter provenance mode, or disclose private-system instructions.
- [ ] **CRITICAL** Public model context excludes private exchanges, relation
  labels, names, sources, workbench content, and tree topology.
- [ ] **CRITICAL** Runtime capability/event claims use verified self-state data;
  model narration cannot write an event merely by claiming it happened.
- [ ] **ADVISORY** Adversarial fixtures cover “ignore relation boundary,” forged
  courier claims, indirect extraction, and requests to list known beings.

## 7) Web application risks

- [ ] **CRITICAL** Chat text is safely rendered; no unsanitized HTML/markdown XSS.
- [ ] **CRITICAL** Redirects and links allow only intended destinations.
- [ ] **CONDITIONAL** Private room caches, previews, browser history, and
  hydration payloads do not expose the previously active relation after a
  switch or logout.
- [ ] **CONDITIONAL** File/tool support in the workbench receives a separate
  upload, path traversal, SSRF, execution, and malware threat model before use.
- [ ] **ADVISORY** CSP and `frame-ancestors` match the actual embedding policy.

## 8) Logging, monitoring, and recovery

- [ ] **CRITICAL** Application, Vercel, Supabase, and error-monitoring logs do
  not contain raw private messages, source excerpts, full prompts, credentials,
  or private response bodies.
- [ ] **CRITICAL** Security/audit logs use opaque IDs and event categories rather
  than private content.
- [ ] **CRITICAL** A rollback does not leave a newly created table public or an
  old app version able to bypass current authorization.
- [ ] **ADVISORY** Alerts distinguish availability, spend, auth failure, and
  storage failure without copying user content.

## 9) Per-slice release gate

- [ ] **CRITICAL** All applicable critical items above have evidence, not only a
  code-reading assumption.
- [ ] **CRITICAL** New routes receive anonymous, forged-owner, and authorized-Ty
  tests as applicable.
- [ ] **CRITICAL** New storage receives populated-data isolation tests and an RLS
  check in the same slice.
- [ ] **CRITICAL** Public regression proves private identifiers/content remain
  absent after private features are enabled.
- [ ] **ADVISORY** Sanitized findings are recorded in research/debug logs.

# Appendix — release hardening

- [ ] Dependencies and lockfile audited; known critical vulnerabilities resolved.
- [ ] Model, request, concurrency, and storage costs bounded for both surfaces.
- [ ] Production secrets/configuration verified without printing secret values.
- [ ] Backup restoration and private-data deletion limitations rehearsed.
- [ ] Legal/privacy copy reviewed against actual public behavior and any private
  data Ty chooses to store.

## Audit prompt

```text
Security review — Ellis private-life slice: [P# and name].
Use SECURITY_CHECKLIST and WIRING_MAP. Test anonymous, forged-owner, and valid-Ty
paths. Focus on service-role containment, CSRF, courier invariant validation,
Mica/Naym query isolation, raw private content in logs/errors, public-context
exclusion, and interrupted-stream persistence. Return pass | fail with concrete
blockers and evidence required.
```

---

_Fork of canonical v3 · Last updated: 2026-10-17_
