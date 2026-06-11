# Ellis — Debug Log

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

| ID | Symptom | Status | Owner |
| --- | --- | --- | --- |
| DBG-001 | `ellis_usage` table may not exist on GoE yet | Open | Ty — run migration |
| DBG-002 | Domain `tybuilds.tech` DNS → Vercel | Open | Phase C |

---

*Append at top of **Log** section.*
