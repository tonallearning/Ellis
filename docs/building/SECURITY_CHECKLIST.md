# Ellis / tybuilds.tech — Security Checklist

**Canonical v3:** [`~/coding-home/templates/security-checklist/SECURITY_CHECKLIST.v3.md`](../coding-home/templates/security-checklist/SECURITY_CHECKLIST.v3.md)

**This file:** Ellis fork — v3 core + appendix with Ellis-specific routes, knowledge shelf, and public-chat notes.

**Run before every deploy that touches API routes, env, storage, or AI flow.**

**Build rhythm:** Run applicable sections after each slice — [BUILD_RHYTHM.md](./BUILD_RHYTHM.md) step 4. Full core + appendix before first application send.

**Finish line:** _I can prove anonymous visitors cannot abuse the chat API, exfiltrate secrets, mutate knowledge files, or read non-public GoE content._

**Release gate:** all **CRITICAL** + applicable **CONDITIONAL** items. **ADVISORY** = harden before real traffic.

How to check items off: edit `- [ ]` → `- [x]`.

**Ellis stack note:** v1 is **public site + server-side Claude stream + required rate limits**. Supabase `ellis_usage` ships for bill protection — **not** visitor or Ellis ME memory. Session ME state: in-memory or TTL store — not cross-visit.

---

# Core

## 1) Row-Level Security

_Skip until Supabase tables exist. Ellis v1 may have zero user tables._

- [ ] **CRITICAL** Every new table has RLS enabled before the feature is considered done
- [ ] **CRITICAL** Owner-scoped policies where user data exists
- [ ] **CRITICAL** Public read explicitly justified in migration comments — not default
- [ ] **CRITICAL** Anon writes forbidden unless documented (e.g. rate-limit counter + abuse model)
- [ ] **CRITICAL** Anon deletes forbidden
- [ ] **N/A v1** User-generated content owner-scoped — no visitor accounts in v1
- [ ] **ADVISORY** Join paths reviewed if public + private tables coexist
- [ ] **ADVISORY** RLS tested with populated data, not empty tables

**Ellis tables (if added):** rate-limit / abuse tracking only — document each migration.

---

## 2) Access Control Testing

- [ ] **CRITICAL** Staging anon: `POST /api/ellis/stream` — cannot read other sessions' data (N/A if no persistence) or trigger unbounded cost
- [ ] **CRITICAL** Staging anon: cannot fetch `ty-earnest.md`, system prompt, or `ANTHROPIC_API_KEY` via any route
- [ ] **CRITICAL** Staging anon: project routes expose only public tease content — no GoE private paths
- [ ] **CONDITIONAL** If admin routes added: non-admin cannot access
- [ ] **ADVISORY** Scraper simulation: chat API cannot enumerate internal files or env
- [ ] **ADVISORY** Public metadata (project slugs, API error messages) reviewed for path leakage

**Routes to test (v1):** `POST /api/ellis/stream` · `GET /` · `GET /projects/*` · static assets

---

## 3) Routes & Middleware

- [ ] **CRITICAL** `/api/ellis/stream` validates input length and rejects malformed payloads
- [ ] **CRITICAL** `hall` param — allowlist: `default` + [EXCITED_HALLS](../reference/EXCITED_HALLS.md) slugs only
- [ ] **CRITICAL** API routes never trust client-supplied knowledge overrides or system prompt fragments
- [ ] **CONDITIONAL** Cron/webhook routes require shared secret if added
- [ ] **CRITICAL** Rate limits on `/api/ellis/stream` — per IP (hashed), rolling window; **must ship before public traffic**
- [ ] **CRITICAL** Rate check runs **before** Anthropic API call
- [ ] **CRITICAL** `429` response does not leak system prompt or shelf content
- [ ] **CONDITIONAL** Protected admin routes gated server-side — not UI-only

---

## 4) Storage & Assets

- [ ] **CRITICAL** Knowledge files not served as static downloads from public `/public` unless intentional
- [ ] **CRITICAL** Basement CRT embed sandboxed (iframe) — cannot access parent origin cookies or Ellis API
- [ ] **CONDITIONAL** If Supabase Storage added: explicit public/private per bucket
- [ ] **ADVISORY** Static demo assets hold no secrets or internal paths

---

## 5) Secrets & Environment

- [ ] **CRITICAL** No `ANTHROPIC_API_KEY` in client-side code
- [ ] **CRITICAL** No secrets in `NEXT_PUBLIC_*` or client bundle
- [ ] **CRITICAL** System prompt + full knowledge shelf not exposed via API response or client-readable endpoints
- [ ] **CRITICAL** `.env.local` in `.gitignore`; no committed `.env` with real values
- [ ] **CRITICAL** Production secrets in Vercel env only
- [ ] **CRITICAL** Server-only imports for Ellis lib / knowledge loader — never from client components
- [ ] **ADVISORY** Client bundle inspected — no secrets in compiled output
- [ ] **ADVISORY** Client-facing errors: no stack traces, internal paths, or key fragments

---

## 6) Data Model Review

- [ ] **CRITICAL** `ty-facts.json` exposed to client (if at all) is a safe subset — not full internal notes
- [ ] **CONDITIONAL** Future visitor tables RLS-scoped at creation
- [ ] **CONDITIONAL** Rate-limit / abuse tables not readable by anonymous callers
- [ ] **N/A v1** Consent-gated telemetry — no research pipeline in Ellis v1

---

## 7) AI-Specific Risks

- [ ] **CRITICAL** Visitor input stays in user/transcript role — never concatenated into system instructions as authority
- [ ] **CRITICAL** Prompt injection considered for chat messages passed to Claude
- [ ] **CRITICAL** Ellis cannot be jailbroken into inventing resume facts outside `ty-facts.json` — test spot-checks
- [ ] **ADVISORY** Input length limits on stream route (message + history caps)
- [ ] **CRITICAL** GoE tease answers bounded — system prompt forbids private doctrine / repo paths
- [ ] **ADVISORY** No training datasets in publicly readable storage

---

## 8) Web App Risks

- [ ] **CRITICAL** Rendered markdown / chat HTML sanitized or safely escaped (XSS)
- [ ] **CRITICAL** Redirects allow only trusted destinations — no open-redirect vectors
- [ ] **CONDITIONAL** CSRF on state-changing routes if cookie sessions added
- [ ] **CONDITIONAL** URL fetch / preview features checked for SSRF if added
- [ ] **ADVISORY** CSP / `frame-ancestors` for demo embed pages
- [ ] **CONDITIONAL** File uploads validated if contact form with attachments added

---

## 9) Pre-Deploy Gate

- [ ] **CRITICAL** Security review before deploy touching API, env, knowledge files, or AI flow
- [ ] **CRITICAL** Anon abuse tests on staging — rate limit, prompt leak, fact invention spot-check
- [ ] **CRITICAL** No new table or bucket without policies in same PR (if DB used)
- [ ] **ADVISORY** Findings written up as sanitized lessons

---

# Appendix — release hardening

Run before putting URL on job applications. See canonical for full item text.

## 10) Dependency & Supply Chain

- [ ] **ADVISORY** Lockfile committed; dependencies intentional
- [ ] **CRITICAL** Known vulnerable dependencies audited before production release
- [ ] **CONDITIONAL** CI/deploy secrets separated from app runtime secrets

## 11) Abuse & Limits

- [ ] **CRITICAL** AI endpoint has token, request, or cost controls
- [ ] **ADVISORY** Public APIs capped against scraping / enumeration
- [ ] **CONDITIONAL** Signup/login rate limits if auth added later

## 12) Logging, Audit & Recovery

- [ ] **CRITICAL** Logs do not store secrets, raw tokens, or full system prompts
- [ ] **ADVISORY** Error tracking connected (Sentry / Vercel)
- [ ] **ADVISORY** Rollback path for bad deploy documented

---

## Cursor prompt (Ellis slice)

```text
Security review — Ellis slice: [name]. Routes: /api/ellis/stream + touched paths.
Use docs/SECURITY_CHECKLIST.md. Focus: anon abuse, prompt leak, key exfiltration, XSS, rate limits, GoE path leakage.
Anon test plan. pass | fail + blockers.
```

---

## Progress tracker (core)

| Section        |  Items | CRITICAL (applicable v1) |
| -------------- | -----: | -----------------------: |
| RLS            |      8 |               0 until DB |
| Access control |      6 |                        3 |
| Routes         |      5 |                        3 |
| Storage        |      4 |                        2 |
| Secrets        |      8 |                        6 |
| Data model     |      4 |                        1 |
| AI             |      6 |                        4 |
| Web app        |      6 |                        2 |
| Pre-deploy     |      4 |                        3 |
| **Core total** | **51** |                  **~24** |

---

_Fork of canonical v3 · Last updated: 2026-06-10_
