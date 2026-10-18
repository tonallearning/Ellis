# Ellis — Debug Log

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
  Runtime/browser memory test awaits P4. Remote advisors and recovery rehearsal
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
