# GoE — Debug Log

**Purpose:** Build-time **incidents**, **verifications**, and **environment friction** — symptom → cause → fix → verified. Not product decisions (those go in [RESEARCH_LOG.md](./RESEARCH_LOG.md)).

**When to append**

- Verify script failures and fixes
- Build/deploy breaks and workarounds
- Env var / Vercel / Supabase / cron surprises
- Manual prod smoke results worth preserving
- Pre-promote regression runs

**Entry format** (newest at top)

```markdown
### YYYY-MM-DD — Short title

- **Context:** phase, slice, command, URL
- **Symptom:**
- **Cause:**
- **Fix:**
- **Verified:** how you know it's resolved
- **Notes:** (optional)
```

---

## Log

### 2026-06-07 — Phase 4 verify gate (all green)

- **Context:** Phase 4 exit — full local verify bundle
- **Symptom:** N/A — gate run
- **Cause:** N/A
- **Fix:** N/A
- **Verified:** `npm run verify:all`, `verify:phase3-comms`, `verify:phase25`, `verify:v2`, `verify:security` exit 0 (2026-06-07)
- **Notes:** `verify:waiting` now passes (was Phase 0 debt). `verify:phase3-comms` + `verify:phase25` still **not** in `verify:all` — 4.5 tweak

---

### 2026-06-07 — Comms interest smoke (manual — open)

- **Context:** Phase 3 exit manual gate
- **Symptom:** Full interest post loop not automated in CI
- **Cause:** Requires Ty to post externally + paste live URL in Comms publish flow
- **Fix:** Manual: draft → schedule → due → publish → confirm Shed consequence row
- **Verified:** Pending Ty — blocked on TL landing / `email_signup` live URL per [wren/BRIDGE.md](../wren/BRIDGE.md)
- **Notes:** Automated path: `verify:comms-publish-cycle` covers mechanics only

---

### 2026-06-05 — `expression.complete` missing on streamed Vale replies

- **Context:** Phase 2 exit — `verify:streaming`
- **Symptom:** Streamed replies failed expression lifecycle verify
- **Cause:** `expression.complete` not emitted on stream path
- **Fix:** Wire completion event on streamed Vale replies
- **Verified:** `verify:streaming` passes; included in Phase 2 handoff
- **Notes:** Decision context in RESEARCH_LOG Phase 2 handoff

---

### 2026-06-05 — Phase 0 `verify:waiting` debt at exit

- **Context:** Phase 0.6 `verify:all` refresh
- **Symptom:** `verify:waiting` failed — `me_state_changed` posture `present`, not `responding`
- **Cause:** Metabolism/posture vocabulary mismatch on waiting path
- **Fix:** Addressed before Phase 4 — posture handling aligned
- **Verified:** `verify:waiting` passes in Phase 4 audit run (2026-06-07)
- **Notes:** Phase 0 exit accepted with known debt; do not repeat "green verify:all" claim without waiting pass

---

### 2026-06-05 — `verify:route-acl` skips live probes

- **Context:** Phase 1 deploy bundle — local dev
- **Symptom:** Route ACL verify passes static wiring but skips HTTP probes
- **Cause:** GoE dev server not running on `:3001` during verify
- **Fix:** Run dev server on expected port before live probe pass; or rely on static wiring + manual pre-guest smoke
- **Verified:** Static checks pass; live probes need network + server
- **Notes:** Phase 4 audit — sandbox DNS also skips Supabase live probes

---

### 2026-06-05 — World tick requires paired secrets

- **Context:** Phase 0.5 cron deploy
- **Symptom:** Tick 401 in prod or local security boot
- **Cause:** `CRON_SECRET` (Vercel/local) must match GitHub `GOE_CRON_SECRET`; local also needs secret when `GOE_SECURITY_ENABLED=1`
- **Fix:** Same value in GitHub secrets + Vercel env + local `.env`
- **Verified:** `workflow_dispatch` → HTTP 200; prod curl with Bearer → 200 ([GOE_DEPLOY_OPS.md](../GOE_DEPLOY_OPS.md))
- **Notes:** Tick without secret returns 401 by design

---

### 2026-06-05 — Capabilities lost on Vercel cold start (pre-Phase 0)

- **Context:** Production before Supabase adapter
- **Symptom:** Approve/deny → resume lost after deploy/cold start
- **Cause:** Capabilities stored in ephemeral SQLite on serverless
- **Fix:** Phase 0 — Supabase `capabilities` table + `createSupabaseCapabilitySystem` + `migrate:capabilities`
- **Verified:** `GOE_DB_DRIVER=supabase npm run verify:capabilities && verify:capability-resume`
- **Notes:** Local dev still defaults SQLite unless env set

---

### 2026-05-29 — Vale invalid posture `responding` on mini-boost

- **Context:** ME audit — metabolism pre_expression path
- **Symptom:** Posture `responding` on paths that should be `present`
- **Cause:** Invalid posture enum on metabolism mini-boost hook
- **Fix:** Map `responding` → `present` in `Vale_metabolism.js`
- **Verified:** ME audit closed; expression weight compute uses server-side posture
- **Artifacts:** [ME_VALE_AUDIT_2026-05-29.md](../Audit_log/ME_VALE_AUDIT_2026-05-29.md)

---

### 2026-05-29 — Production deploy smoke OK

- **Context:** Promote bundle — commit `1fee34a`
- **Symptom:** N/A — regression run
- **Cause:** N/A
- **Fix:** N/A
- **Verified:** `DEPLOY_BASE_URL=https://www.ada-studio.space npm run verify:deploy`; health `securityEnabled: true`; deep links; capability resume on prod
- **Notes:** Vale mobile Ty-verified same day ([VALES_GARDEN_UI_MOBILE.md](../VALES_GARDEN_UI_MOBILE.md))

---

### 2026-05-29 — Capability resume blocked by `capabilityBusy`

- **Context:** Post-approval stream resume (prod/dev)
- **Symptom:** Approve sets `capabilityBusy` before resume; resume bails when busy — stream never continues
- **Cause:** Guard ordering — busy flag set before resume handler runs
- **Fix:** Clear or defer busy flag so resume path can proceed after approve
- **Verified:** Shipped before 2026-05-29 prod smoke; `verify:capability-resume` green
- **Notes:** Classic approve-then-silence bug — watch on any capability UI refactor

---

### 2026-05-29 — Vale stays `inSolitude` while chatting

- **Context:** Garden chat during active conversation
- **Symptom:** Solitude flag not cleared on message handling
- **Cause:** Message path didn't clear solitude state on contact
- **Fix:** Clear solitude/contact flags when handling active chat
- **Verified:** Manual garden smoke; solitude lifecycle events order correctly
- **Notes:** World physics vs UI state desync — check message handler on solitude changes

---

### 2026-05-29 — First room change skipped dissolve transition

- **Context:** Garden navigation / room change animation
- **Symptom:** First navigation skipped dissolve effect
- **Cause:** Initial mount path bypassed transition hook
- **Fix:** Wire dissolve on first room change same as subsequent
- **Verified:** Manual UI pass
- **Notes:** Cosmetic but breaks "place" feel — regression on `RoomHost` changes

---

### 2026-05-28 — Capability resume loop shipped verify

- **Context:** V1.5 tool-use approvals
- **Symptom:** Pre-ship — approve didn't continue Vale stream
- **Cause:** Missing resume route + undelivered delivery + prompt block
- **Fix:** Full resume loop ([CAPABILITY_RESUME_CHECKLIST](../Audit_log/archive/CAPABILITY_RESUME_CHECKLIST_2026-05-28.md))
- **Verified:** `npm run verify:capabilities` includes `verify-capability-resume`
- **Notes:** Deny reason now required on CapabilityCard

---

### 2026-05-24 — Harness ≠ full Garden Path path

- **Context:** Pause 2 review
- **Symptom:** Harness proves ME pipeline but not threshold → traverse → contact
- **Cause:** Harness calls `processContactStarted` directly with `:memory:` DB
- **Fix:** Not a bug — documented gap; Phase 4 UI parity gate
- **Verified:** `verify:phase3` PASS; live garden path separate manual check
- **Notes:** Don't confuse harness green with end-to-end garden UX parity

---

### 2026-05-23 — Passive re-entry verified live

- **Context:** Pause 1 — solitude → contact lifecycle
- **Symptom:** N/A — positive verification
- **Cause:** N/A
- **Fix:** N/A
- **Verified:** Events 247→249 `solitude_ended` → `contact_started`; `verify:pause1-reentry` PASS
- **Notes:** Exit chain world physics hold

---

### 2026-05-22 — Residue timer stuck at 20 min (stale seed)

- **Context:** Dev world kernel — solitude/residue timing
- **Symptom:** Residue appeared stuck at 20 minutes despite dev expectations
- **Cause:** Stale DB seed overriding dev default
- **Fix:** Explicit priority: `GOE_RESIDUE_MINUTES` > PATCH (`residue_minutes_patched`) > NODE_ENV default (dev 1 min)
- **Verified:** Live event tail; passive re-entry timing sane
- **Artifacts:** `worldKernel.js` priority comment

---

### 2026-05-22 — Triple Courtyard traverse on mount

- **Context:** Courtyard room load
- **Symptom:** Three traverse events fired on enter
- **Cause:** Courtyard mounted traverse + React StrictMode double effect + redundant `useEffect`
- **Fix:** Remove redundant Courtyard traverse; App `navigate` owns traverse
- **Verified:** Single traverse per intentional navigation
- **Notes:** [PAUSE_CHECKPOINTS.md](../archive/PAUSE_CHECKPOINTS.md) § Pause 1

---

### 2026-05-21 — Security audit — latent guest ACL gaps

- **Context:** Security audit pass 1 — owner-only prod
- **Symptom:** Routes accept client-controlled `gardenId` / `visitorId` without data-plane ACL
- **Cause:** Mount middleware checks one garden; handlers use query/body garden id
- **Fix:** Not fixed pre-guest — documented CRITICAL when guests ship; `verify:route-acl` + `verify:event-privacy` added
- **Verified:** Static wiring passes 2026-06-07; live HTTP probes pending Ty network
- **Notes:** Owner-only prod OK today; **blocks guest invites**

---

### 2026-05-21 — DNS rebinding SSRF risk on link-fetch

- **Context:** Security audit — `safeFetch` / auto link-fetch
- **Symptom:** Ty-pasted URL triggers server fetch without approval; DNS checked pre-fetch only
- **Cause:** Connection may resolve to internal IP after DNS check
- **Fix:** Tracked — not fully hardened; terminal already local-only; link-fetch owner-scoped today
- **Verified:** Documented CRITICAL for prod egress; no guest auto-fetch path
- **Notes:** Order 4 SSRF hardening in security backlog ([GOE_SECURITY_ARCHITECTURE.md](../GOE_SECURITY_ARCHITECTURE.md))

---

### 2026-05-21 — Terminal `cat` symlink bypass

- **Context:** Security audit — local terminal capability
- **Symptom:** Allowlist checks logical path before `realpath`; symlink may bypass intent
- **Cause:** `docs/x → .env` style symlink
- **Fix:** Tracked in security backlog (magic-byte + symlink hardening)
- **Verified:** Terminal disabled on Vercel (`VERCEL` env gate) regardless of `GOE_TERMINAL_ENABLED`
- **Notes:** Local Ty-approved only

---

### 2026-05-02 — Supabase free-tier auto-pause

- **Context:** Cross-project — Ada/GoE hosted DB
- **Symptom:** "Mysterious" auth/DB failures after idle period
- **Cause:** Supabase inactive project auto-pause
- **Fix:** Wake project in Supabase dashboard before debugging app code
- **Verified:** Operational playbook — not a code fix
- **Notes:** Doctrine Appendix B gotcha; applies to GoE prod project

---

### 2026-05-02 — Ada Vercel build failures (cross-repo)

- **Context:** Ada deploy — pre-ship unblock
- **Symptom:** Build failed on orphan import, missing import, tsconfig target
- **Cause:** Cognition v1 refactor leftovers + paused Supabase project
- **Fix:** Fix imports/target; wake Supabase
- **Verified:** Ada back online at ada-studio.space / ada-git-main-tonallearning.vercel.app
- **Notes:** GoE shares domain family; separate repos

---

### 2026-06-10 — Ellis `ellis_usage` migration (cross-repo)

- **Context:** Apply Ellis migration to GoE Supabase from Ellis repo
- **Symptom:** `supabase: command not found` in some agent shells
- **Cause:** Supabase CLI not installed / not in PATH
- **Fix:** `brew install supabase/tap/supabase` **or** paste SQL into GoE dashboard SQL Editor
- **Verified:** Pending Ty — `SELECT 1 FROM public.ellis_usage LIMIT 1;` + RLS enabled
- **Notes:** Migration at `/Users/ty/Ellis/supabase/migrations/20260610000000_ellis_usage.sql`

---

## Smoke checklist (copy per promote)

From [GOE_DEPLOY_OPS.md](../GOE_DEPLOY_OPS.md) — run after meaningful server/client changes:

```txt
[ ] GOE_SECURITY_ENABLED=1 npm run verify:security
[ ] npm run verify:deploy (local) then DEPLOY_BASE_URL=https://www.ada-studio.space npm run verify:deploy
[ ] npm run verify:session-policy && verify:relational && verify:artifacts
[ ] npm run verify:vale-contact-prompt && verify:v2 && verify:capabilities
[ ] /api/health → securityEnabled: true
[ ] /api/world/tick → 401 without secret, 200 with CRON_SECRET
[ ] Deep link cold load: /vale, /ada, /courtyard while signed in
[ ] Vale chat stream + capability approve → resume
[ ] Workshop /workshop session enter (local — terminal not on Vercel)
[ ] Comms /comms hallway entry only (not Garden Path)
[ ] Shed office consequences panel loads (owner)
```

Phase 5+ additions:

```txt
[ ] Courtyard interruption turn loop (when Phase 5.1 ships)
[ ] Guest Center ACL live probes (before any guest invite)
[ ] verify:phase3-comms + verify:phase25 (until in verify:all)
```

---

## Known open issues

| ID | Symptom | Status | Owner |
| --- | --- | --- | --- |
| DBG-001 | Guest route ACL — live HTTP probes not run in CI | Open | Ty before guest invites |
| DBG-002 | `verify:phase3-comms` + `verify:phase25` omitted from `verify:all` | Open | 4.5 tweak |
| DBG-003 | Legacy script names (`verify-phase3.js`, `verify-phase4.js`) collide with build phases | Open | 4.5 rename |
| DBG-004 | `npm run harness` unwired — archive docs cite it | Open | 4.5 wire or retire |
| DBG-005 | Comms interest post manual smoke | Open | Ty |
| DBG-006 | `ellis_usage` table may not exist on hosted GoE DB | Open | Ty — run migration |
| DBG-007 | Terminal executor local-only on Vercel | By design | Threat model before remote |
| DBG-008 | Twilio SMS — A2P registration pending | Parked | Ty |
| DBG-009 | Supabase project auto-pause after idle | Ops | Wake dashboard first |

---

*Append at top of **Log** section.*
