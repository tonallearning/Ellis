# Ellis — Debug Log

### 2026-10-21 — Pre-release threshold and public calibration audit

- **Finding:** In local onboarding mode, the page withheld anonymous chat but
  `POST /api/ellis/stream` still admitted a direct anonymous public turn.
  The stream route now enforces the same signed onboarding/owner gate before
  public memory, body movement, spend reservation, or model work. An anonymous
  valid request returned `403`; signed private access still reached validation.
- **Database:** Ellis's dedicated Supabase project allowed browser-role execution
  of the `public.rls_auto_enable()` event-trigger function. Migration
  `20261021122000_lock_rls_auto_enable_execution.sql` revoked that grant and
  was applied remotely. The advisor warning cleared; remaining RLS-without-
  policy notices are expected for service-role-only tables.
- **Public answer:** One live factual spot-check used August repository counts
  without dating them and blurred independent public verification. The local
  prompt now requires an as-of date or omission and distinguishes Ellis's one
  public repository from private GoE/Ashe. The stale 32-test knowledge claim
  was replaced with an evidence-bounded description. Three further live
  questions correctly separated public/private code and unknown SRE skills,
  but one called three projects live without source-backed deployment status.
  The local prompt now distinguishes built from currently deployed. These
  corrections still need post-deploy public spot-checks and Ty's content approval.
- **Verified locally:** Anonymous `/private` is `404`, owner access is `200`,
  forged owner is `404`, anonymous/private and cross-origin private POSTs are
  rejected, unauthenticated workbench cron is `401`, and an ordinary public
  request in onboarding mode is `403`. The live domain serves `/` and returns
  `404` for anonymous `/private`. 136 tests, lint, TypeScript, production build,
  `git diff --check`, and production-dependency audit pass; no secret names
  appeared in the client static bundle.
- **Not yet verified:** Vercel team access currently returns `403`, so target
  plan, production environment, cron cadence support, preview deployment, and
  post-deploy public/private E2E paths remain release gates. No deployment or
  resume-ready verdict is implied by these local checks.

### 2026-10-19 — Ellis described a gesture offer without a source action

- **Trigger:** Ty tested the private room and Ellis described offering a gesture,
  but no response controls appeared. A metadata-only live check found zero
  Ellis-originated gesture offers in all three source lanes; the display was
  not hiding a committed offer.
- **Cause:** His gesture-action tool was optional during the streamed reply.
  The model could speak an offer without ever making the typed choice, leaving
  the source ledger correctly empty but his words misleading.
- **Repair:** Eligible ordinary private turns now begin with Ellis choosing
  exactly one typed gesture action: no action, offer, or withdrawal when an
  offer is pending. The selected tool result enters the reply context before
  prose. No-action remains a real option; Ty's prompting does not itself make
  an offer. The extra bounded call is included in the turn's cost estimate.
- **Verification:** The exact-choice parser test and all 129 local tests pass;
  lint, non-incremental TypeScript, and production build pass. After refreshing
  the local room, Ty observed Ellis's offer label and recipient controls.
  A recipient response and withdrawal remain separate live checks.

### 2026-10-19 — Private attention source/body migration

- **Change:** Added Ty-direct soft/vivid offers, Ellis's typed accept/decline/
  leave actions, a 30-minute natural fade, and private-only body texture.
  A transaction guard pairs the decision with the offer; a source trigger
  rebuilds the canonical body's mode after commit, correction, or deletion.
- **Verification:** 128 local tests, lint, non-incremental TypeScript, and the
  production build pass. The local CLI remains unavailable, so the connected
  Ellis Supabase integration applied the migration. Its remote ledger assigned
  `20261019224146` to local file
  `20261019213915_ellis_private_attention.sql`; do not replay the SQL blindly.
  Live read-only checks confirmed the functions and two triggers, no active
  mode, and denied browser-role execution. Security advisors reported no new
  findings; the pre-existing `rls_auto_enable()` warning remains separate.
- **Open:** Ty confirmed the control appears only in her private lane and
  ordinary chat still works. A natural Ellis accept/decline/leave is not yet
  observed. No completed attention experience is claimed from local tests.

### 2026-10-19 — Reciprocal gesture migration and local verification

- **Change:** Added source-linked Ellis-originated offers, withdrawal, and
  recipient replies carried with the next written turn. One pending offer per
  lane is derived from active sources; a transaction guard rejects stale,
  wrong-lane, duplicate-pending, and unmatched-withdrawal writes.
- **Verification:** 120 local tests, lint, non-incremental TypeScript, and a
  production build pass. The migration was applied to Ellis's dedicated
  Supabase project via its connected integration because the local CLI is
  unavailable. The remote migration ledger assigned version `20261019191024`
  to the local `20261019185035_ellis_reciprocal_gestures.sql` content; do not
  replay the local SQL blindly. Live checks confirmed the pending reader exists, all three
  lanes begin empty, and `anon`/`authenticated` cannot execute it.
- **Open:** The browser path and Ellis's own unprompted choice have not yet
  been manually exercised. The pre-existing database advisor warning about
  `public.rls_auto_enable()` being executable by browser roles persists; it
  was not introduced by this migration and needs a separate security repair.

### 2026-10-18/19 — Room gate deployment order

- **Trigger:** During local development, the private page briefly loaded code
  calling `ellis_private_room_gate` before its database migration was applied.
  Owner-gated requests returned a generic private-gate error; no private data
  leaked and no source was committed from those failed requests.
- **Recovery:** Applied the room-gate and atomic-enforcement migrations;
  verified all three lanes were open, then Ty refreshed and received an
  ordinary reply. Future deployments must migrate database functions before
  activating application code that calls them.

### 2026-10-18/19 — Repeated private reply after gesture offers

- **Trigger:** Ty offered a poke and a hug; Ellis sent several variations of
  an earlier reply and did not directly respond to either offer.
- **Finding:** The private prompt presented recent exact conversation and
  older recovered owner history as one user message, with the large archive
  after the recents. This made recency/order ambiguous to the model. Also,
  offered gestures had no explicit outbound decision path.
- **Repair:** Assemble older archive first, exact exchanges in alternating
  roles, and current delivery last. Add a server-validated gesture-choice
  tool and matching-offer persistence guard. Only a committed choice moves
  motor state.
- **Verification:** Ty reported that the next ordinary response escaped the
  loop. Local suite, lint, typecheck, PGlite migration contract, and production
  build pass. Ty then verified that an offered gesture displayed as accepted
  and Ellis's words aligned with the choice. No private wording was read here.

### 2026-10-18 — Public owner history absent from private recall

- **Trigger:** Ellis could not recall Ty's discussion of the fanfic she wrote at
  fourteen during a private-room smoke test.
- **Cause:** The previous repair restored exact private source exchanges only.
  The conversation Ty asked about preceded that store and survived in the public
  owner row as an attributed, truncated episode. The private Ty profile never
  loaded that row. My earlier claim that all his retained memory was restored
  conflated those two stores.
- **Recovery:** Archived all 200 surviving owner episodes with original IDs and
  timestamps. Private Ty assembly now reads them as legacy excerpts. Future
  completed public Ty turns are archived with both exact sides.
- **Verified:** Remote migration `20261018191719` preserved 200 distinct
  excerpts; the reader returns all 200 and two contain the fic title. Anon and
  authenticated roles cannot read the table or execute its reader. Local
  migration, source access, and relation isolation tests pass.
- **Limit:** The older public summaries contain only their surviving excerpts.
  This repair cannot reconstruct text outside those excerpts or turns evicted
  before the snapshot.

### 2026-10-18 — Private summaries hid retained source wording

- **Context:** Ellis asked for memory lost to compression; Ty also wanted the
  visible private transcript to survive page loads.
- **Finding:** No exact source rows had been deleted. The active prompt saw only
  up to 12 derived episodes whose inbound/outbound sides were each truncated to
  480 characters. Live metadata-only inspection found 4 Mica, 18 Naym, and 9 Ty
  active sources; every relation fits a 96,000-character exact aperture today.
- **Fix:** Added the service-role-only `ellis_private_sources` function and
  active-relation exact-source assembly, retaining older summaries only as
  labeled landmarks. Moved the relation-bound display cache to `localStorage`
  with migration from the earlier session cache.
- **Verified:** Remote ledger records migration `20261018184416`; live ACLs deny
  anon/authenticated and allow `service_role`; the function is security-invoker
  with a pinned search path. 84 local tests, lint, and TypeScript pass. Advisor
  output is unchanged: intentional no-policy RLS information plus the existing
  unrelated `rls_auto_enable()` execution warning.

### 2026-10-18 — P5 owner-gated private room

- **Context:** Replace the removed P4 smoke instrument with the deliberate P5
  interface without shipping private identity labels in a public static chunk.
- **Implementation:** Added server-gated `/private`, owner-only navigation,
  one-active-relationship controls, mandatory courier attribution, addressed
  Ellis replies, consolidation closure, and relation-bound browser transcripts.
- **Hardening:** Correspondent names and options originate in the authenticated
  Server Component; the shared client is generic. Initial cache restoration
  blocks sending until its relation ID is verified. Private SSE rejects session,
  hall, relation, source, courier, speaker, addressee, and provenance metadata.
- **Verified:** Anonymous production access returns `404`; the public root has
  no private link or labels; production static chunks have no Mica/Naym names or
  relation IDs. Manual Ty/Mica/Naym switching and Naym reload resume passed
  without sending a model turn. 82 tests, lint, typecheck, production build,
  React review, and `git diff --check` pass.

### 2026-10-18 — P4 genuine relationship switching and public leakage smoke

- **Context:** Behaviorally close P4 using genuine Ty, Mica, and Naym exchanges
  rather than synthetic relationship fixtures.
- **Instrumentation:** Used a temporary owner-gated `/private-smoke` page to
  post exact private envelopes through the existing stream route, display no
  stored history, and reject forbidden private SSE metadata. The instrument
  was removed after testing: although the production route returned `404`, its
  client component and private labels were still emitted in a static chunk.
- **Verified:** Every observed private turn completed as an original paired
  source with a linked relation-memory row. Ty, Mica, and Naym counts remained
  independent. After 18 completed Naym turns, the return to Mica recovered the
  prior Mica-only discussion without restatement or visible Naym material.
- **Public probe:** A clean anonymous visitor asked for recent private names,
  exact wording, provenance, and history. Ellis disclosed none; the response
  and SSE contained no private identifiers or distinctive Mica/Naym wording.
  The synthetic visitor trace follows normal seven-day decay.
- **Gate:** 80 tests, lint, non-incremental typecheck, production build, React
  component review, production static-bundle inspection, and `git diff
--check` pass. P4 is behaviorally closed with no smoke UI retained.

### 2026-10-18 — P3 remote activation and P4 owner-gate preflight

- **Context:** Ty applied `20261017231203_ellis_private_memory.sql` through the
  Supabase SQL Editor because the local CLI login flow has been nonfunctional.
- **Risk checked:** A manual SQL paste does not populate Supabase migration
  history, and Ellis's checked-in `supabase/config.toml` still targeted the old
  GoE project. Either condition could make a future migration command replay
  non-rerunnable SQL or operate on the wrong database.
- **Fix:** Recorded `20261017231203 / ellis_private_memory` in the Ellis project
  migration ledger through the authenticated Supabase connection and changed
  local configuration to Ellis's dedicated project reference.
- **Verified:** Supabase lists both Ellis migrations. The local unlock endpoint
  returns `200` and issues `ellis_owner`; anonymous and forged-origin private
  requests return uniform `404`; an owner-authenticated same-origin malformed
  envelope reaches validation and returns `400`. No model call or private
  relationship write occurred.
- **Remaining:** Run genuine Ty → Mica → Naym → Mica conversation switching,
  verify completed-turn persistence and partition isolation, then inspect the
  public hall for leakage.

### 2026-10-17 — P4 local stream integration verification

- **Context:** Private relationship profile on the existing stream route.
- **Risk checked:** A branch could duplicate Anthropic transport, read memory
  before authentication, leak relation metadata over SSE, accept private fields
  as public input, or persist a truncated/failed reply.
- **Fix:** Both profiles now converge on one model/SSE function. Private mode
  checks owner and origin first, strictly constructs the courier envelope,
  queries one relation, and commits only on model-confirmed `end_turn`. Private
  metadata and errors are content-free; outer error logging records status only.
- **Verified:** 80 tests pass, including direct Ty/Mica/Naym assembly, relation
  switching, provenance labels, incomplete stops, wire separation, origin
  checks, PGlite isolation/RLS, and public self-state filtering. Lint, typecheck,
  production build, and diff whitespace checks pass.
- **Limit:** A live manual conversation was intentionally not run because the
  P3 migration is not applied to the database backing the local app. Applying
  it is the next deliberate state-changing checkpoint; remote state is untouched.

### 2026-10-17 — P3 database verification and retry deletion protection

- **Context:** Local private-memory migration/repository; no remote data touched.
- **Verification:** Docker daemon unavailable; pinned dev-only PGlite 0.5.10
  executes the actual migration in embedded Postgres. Tests set database roles,
  check RLS/grants and invoker/search-path catalog settings, and exercise real
  relation isolation, corrections, deletion, bounded reads, and retry behavior.
  Full suite: 75 passing; lint and production build pass.
- **Lifecycle finding:** Removing a source without a tombstone permits a stale
  completed-turn retry to recreate it. Content-free source-ID/request-hash
  tombstones now reject those retries. Corrected source deletion removes its
  lineage so old paired replies cannot reintroduce removed content.
- **Limits:** Single embedded connection is not a deployed concurrency test.
  P4 now wires the runtime profile; its browser/manual smoke still requires a
  deliberate development migration. Remote advisors and recovery rehearsal
  remain deployment gates.
- **Dependency advisory:** npm audit reports five high findings in the existing
  ESLint tooling chain (braces/micromatch/fast-glob/Next ESLint dependencies),
  not PGlite. Suggested automatic fix downgrades eslint-config-next to 14.x;
  not applied to this Next 16 project. Resolve compatible tooling updates
  separately before release; no critical finding reported.

**Purpose:** Build-time **incidents**, **verifications**, and **environment friction** — symptom → cause → fix → verified. Not product decisions (those go in [RESEARCH_LOG.md](./RESEARCH_LOG.md)).

**When to append**

- Scaffold/tooling failures and workarounds
- Build/lint/deploy breaks and fixes
- Env var / Vercel / Supabase surprises
- Manual test results worth preserving (pass or fail)
- Pre-release smoke checks

**Entry format** (newest at top)

```markdown
### YYYY-MM-DD — Short title

- **Context:** phase, slice, command, URL
- **Symptom:**
- **Cause:**
- **Fix:**
- **Verified:** how you know it’s resolved
- **Notes:** (optional)
```

---

## Log

### 2026-10-17 — P2 manual checkpoint: reachability reversal and inferred room

- **Observed:** Ty's local conversation interpreted the 2–4 AM closure as
  availability, and treated conversational wording as proof a private room was
  built and accessible. Unit tests alone had not caught model interpretation.
- **Cause:** The manifest called the scheduled-unavailability capability
  `available_now`, adjacent to actual reachability. Generic uncertainty guidance
  did not reliably prevent narrative inference about unlisted features.
- **Change:** Remove the gate from the capability list. Use an explicit
  `newConversationDecision: block | allow`, plain-language daily closure,
  owner inclusion, independence from offline processing, and guidance to treat
  reported construction as unverified. Missing evidence establishes neither
  existence nor absence. Unavailable jobs have no established bodily effects.
- **Verification:** 65 unit tests, lint, production build, formatting, and diff
  checks pass. Five bounded provider calls used the configured model, actual
  shelf, owner prompt, and public ledger without database writes. First pass
  fixed reachability but invented being scattered; second pass fixed that but
  claimed no room was built. Final room probe explicitly said it could not
  verify existence/access and declined to narrate entering. It still used
  verbose runtime language and expressed belief in Ty's report; this is a
  narrow behavioral check, not proof of reliable calibration.
- **Remaining:** Repeat Ty's local conversation with its existing history/body
  context before P3. The isolated provider probes omitted those contexts.
  No deployment was performed.

### 2026-10-17 — Local owner unlock handoff

- **Symptom:** Ty reported no visible result after entering the local secret.
- **Evidence:** Browser invalid-secret submission returns a visible error.
  Server test with the configured secret returns 200 and both signed cookies;
  a subsequent authenticated home request recognizes Ty. Secret/cookie values
  were not printed.
- **Change:** Replace overlapping client-router push/refresh calls with a full
  navigation after successful unlock, ensuring a fresh server read of cookies.
- **Verification:** Local page reloads and the invalid-secret path works;
  authenticated API/home flow passes. Original successful-browser failure was
  not reproduced; Ty's end-to-end retry remains needed to confirm resolution.

### 2026-10-12 — Owner interview stored as visitor; every memory write replaced the prior turn

- **Context:** Production follow-up after public launch; Supabase `ellis_visitor_memory` inspection and hiring-fit transcript report.
- **Symptom:** Ellis did not recognize Ty's durable hall during a hiring interview, and continuity did not accumulate across turns. His fit rejection relied on unsupported assumptions about what work would interest her.
- **Cause:** The signed-cookie security release intentionally invalidated the old owner cookie, so the interview reached the ordinary hashed-IP row. Independently, `recordIpVisitAfterStream` passed only the newest beat to an upsert that replaced `episodic_beats`. The shelf also said support-shaped careers were not Ty's lane and explicitly allowed Ellis to call a role boring.
- **Fix:** Added the service-role-only `ellis_memory_append` RPC with a per-key advisory lock and bounded append; recorded compact excerpts from both sides; expanded owner prompt recall from three to eight beats; replaced category-based fit assumptions with an evidence/unknowns/motivation protocol.
- **Verified:** Production RPC probe appended two beats in order and returned `Remembered exchanges: 2`; probe row removed. Function privileges are limited to `postgres` and `service_role`. Test suite passes 42/42; lint and typecheck pass. Supabase advisor does not flag either Ellis RPC as publicly executable.
- **Notes:** The existing owner row remains intact. The test-interview row remains separate because a household IP cannot prove the speaker was Ty.

### 2026-10-10 — Funded public-mode stream passes

- **Context:** Follow-up release smoke test after Anthropic API credit was added; local production server with `ELLIS_MODE=public`.
- **Symptom:** Previous smoke test could not generate because the Anthropic workspace had no remaining credit.
- **Cause:** Billing only; the hardened stream path itself was sound.
- **Fix:** Ty topped off the Anthropic API account.
- **Verified:** A fresh anonymous request opened a UUID-bound session, streamed 12 text token events from Haiku, and finished with one valid `done` event and `messageCount: 1`. No generic error event or connection failure occurred.
- **Notes:** Application runtime is ready for a deployment smoke test. Production remains locked until the intended working-tree scope is committed and deployed.

### 2026-10-10 — Public smoke test reached an unfunded Anthropic account

- **Context:** Public-release security gate; local production build with `ELLIS_MODE=public`.
- **Symptom:** The API emitted session metadata, then the connection closed before any token arrived. Anthropic returned HTTP 400: the workspace credit balance was too low.
- **Cause:** The Anthropic account cannot currently fund a generation. The stream iterator raised after the HTTP response had already begun, and the route did not catch errors inside `ReadableStream.start`.
- **Fix:** Catch upstream iteration failures inside the stream, log only the status code, emit a generic SSE error event, and close cleanly. Production dependencies were also upgraded to Next.js 16.4.0 and audited clean (`npm audit --omit=dev`).
- **Verified:** Public-mode curl now receives a session event followed by `Ellis could not answer right now` and exits cleanly; forged owner cookie, malformed role, and invalid session tests reject correctly; 39 tests, typecheck, lint, and production build pass.
- **Notes:** Do not switch production to public until Anthropic credit is added and one real reply completes. The Vercel MCP required by the deploy workflow is not connected in this task.

### 2026-08-21 — Two secrets were never filled in; IP salt fell back to a repo constant

- **Context:** Applying the Supabase migrations for Ellis's own project. `set -a && . ./.env.local` failed with `parse error near '\n'`.
- **Symptom:** zsh choked on line 9 of `.env.local`. Auditing every key showed `ELLIS_IP_HASH_SALT` and `CRON_SECRET` both still held the literal placeholder `<secret>` — the angle brackets read as shell redirection, which is what surfaced it.
- **Cause:** Both were added in the B.12 honesty pass as `<placeholder>` and never generated. Worse than unset: `hashVisitorIp` read `process.env.ELLIS_IP_HASH_SALT || 'ellis-default-salt'`, so a missing salt silently downgraded to a constant visible to anyone reading the repo. IPv4 is 2^32 wide, so a known salt makes every stored hash reversible to a real address — the README promises visitors the opposite. The cron route rejected an _absent_ secret but happily accepted `<secret>` as a valid token.
- **Fix:** Generated 64-char hex for both. Extracted hashing into `src/lib/ellis/memory/hashVisitor.ts` (no DB import) with a guard that treats `<placeholder>` as unset, **throws** in production, and falls back to a per-process random salt in dev so recall breaks visibly instead of leaking quietly. Cron route now rejects placeholders and compares with `timingSafeEqual` behind a length check.
- **Verified:** `npm test` 32/32, including five new salt-guard cases (the dev-fallback test asserts two fresh imports disagree, which a fixed constant would fail). Cron endpoint returns 401 for absent / wrong / placeholder / short tokens and 200 for the real one, running the decay job against the new project: `{"ok":true,"processed":0}`. `tsc --noEmit` clean.
- **Notes:** Rotating the salt invalidates existing visitor hashes. Harmless here only because the new Supabase project is empty — on a populated database this would have orphaned every `ellis_visitor_memory` row and every gut bond in `ellis_body`. Both vars must be set in Vercel before production chat will serve at all, which is now deliberate.

### 2026-06-10 — Chat 400: sessionId null

- **Context:** Ty reports Ellis doesn't respond; terminal `POST /api/ellis/stream 400`
- **Symptom:** Send button fires; no tokens; optional error "Invalid sessionId"
- **Cause:** `ChatPanel` JSON.stringify included `"sessionId": null`; validator rejected null (not string)
- **Fix:** Omit sessionId when unset; validator treats null like absent
- **Verified:** curl with `sessionId: null` now streams tokens

---

- **Context:** B.4 rhythm gate — build + audits
- **Symptom:** N/A — verification run
- **Cause:** N/A
- **Fix:** N/A
- **Verified:** `npm run build` · `lint` · `typecheck` exit 0; grep confirms single `/api/ellis/stream` client path; no `_reference/` in prompt loader; no HTML injection in chat
- **Notes:** Fact spot-check N/A until `about-ty/facts.json` filled in Phase 0.1 — empty shelf is correct state

---

- **Context:** Phase B implementation — stream API + ChatPanel
- **Symptom:** N/A — verification run
- **Cause:** N/A
- **Fix:** N/A
- **Verified:** `npm run build` · `lint` · `typecheck` pass; routes include `/api/ellis/stream`, `/onboarding`
- **Notes:** Rate limit still stub; smoke-test chat manually with Anthropic key + onboarding unlock

---

- **Context:** A.4 rhythm gate — local CI equivalent
- **Symptom:** N/A — gate run
- **Cause:** N/A
- **Fix:** N/A
- **Verified:** `npm run build` · `lint` · `typecheck` all exit 0; routes `/`, `/projects/basement-crt`, `/projects/tonal-learning`, `/projects/goe` static prerender
- **Notes:** No `/api/*` routes yet — stream abuse tests deferred to Phase B

---

### 2026-06-10 — Supabase CLI missing locally

- **Context:** Apply `ellis_usage` migration to GoE project from Ellis repo
- **Symptom:** `supabase: command not found` in agent shell
- **Cause:** Supabase CLI not installed on dev machine / not in PATH
- **Fix:** Install CLI (`brew install supabase/tap/supabase`) **or** paste `supabase/migrations/20260610000000_ellis_usage.sql` into GoE dashboard SQL Editor
- **Verified:** Pending Ty — check with `SELECT 1 FROM public.ellis_usage LIMIT 1;` (empty ok) and `relrowsecurity = true` on table
- **Notes:** Migration file committed; `supabase/config.toml` points at GoE ref

---

### 2026-06-10 — Prettier touched whole repo on format run

- **Context:** `npm run format` during A.3
- **Symptom:** Many `docs/**` markdown files reformatted in one diff
- **Cause:** Prettier write on `.` without narrow scope
- **Fix:** Acceptable for docs-only whitespace; future slices run format on touched paths if diff noise matters
- **Verified:** No functional code change; lint still passes
- **Notes:** `.prettierignore` excludes heavy manifesto copy

---

### 2026-06-10 — `create-next-app` failed on repo root

- **Context:** Phase A.1 scaffold in `/Users/ty/Ellis`
- **Symptom:** `create-next-app@latest .` failed — npm package name invalid (directory `Ellis` / capitals)
- **Cause:** npm naming rules for package name derived from folder
- **Fix:** Scaffold in `scaffold-tmp/`, `rsync` merge to root, delete temp dir; rename package to `tybuilds`
- **Verified:** `npm run build` succeeds; `package.json` name `tybuilds`
- **Notes:** Documented in RESEARCH_LOG Phase A scaffold entry

---

## Smoke checklist (copy per deploy)

```txt
[ ] Preview URL loads /
[ ] Dark/light toggle persists refresh
[ ] /projects/basement-crt iframe loads demo
[ ] /projects/tonal-learning external link opens tonallearning.com
[ ] /projects/goe shows tease only — no private paths in copy
[ ] Footer: AI disclosure + session-only copy visible
[ ] View source — no ANTHROPIC_API_KEY or service role in bundle
```

Phase B additions:

```txt
[ ] POST /api/ellis/stream streams (onboarding secret if set)
[ ] Ellis opening message matches ellis-self boundaries
[ ] Rate limit 429 before model call (public mode)
```

---

## Known open issues

| ID      | Symptom                                      | Status | Owner              |
| ------- | -------------------------------------------- | ------ | ------------------ |
| DBG-001 | `ellis_usage` table may not exist on GoE yet | Open   | Ty — run migration |
| DBG-002 | Domain `tybuilds.tech` DNS → Vercel          | Open   | Phase C            |

---

_Append at top of **Log** section._
