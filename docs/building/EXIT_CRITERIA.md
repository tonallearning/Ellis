# Ellis / tybuilds.tech — Exit Criteria

**Canonical v1:** [`~/coding-home/templates/exit-criteria/EXIT_CRITERIA.v1.md`](../coding-home/templates/exit-criteria/EXIT_CRITERIA.v1.md)

**This file:** Ellis fork — whole-product gate before putting `tybuilds.tech` on job applications.

**When:** After BUILD_RHYTHM slice loops complete — **not** a sixth step in the per-slice loop. See [BUILD_RHYTHM.md](./BUILD_RHYTHM.md).

**Finish line:** _Ty puts tybuilds.tech on applications; Ellis answers “what did she build?” without inventing facts; Basement CRT and Tonal Learning are one click away; GoE stays teased, not leaked._

How to check off: `- [ ]` → `- [x]`.

**Related:** [ENTRANCE_CRITERIA.md](./ENTRANCE_CRITERIA.md) · [STYLE.md](./STYLE.md) · [`~/coding-home/projects/tybuilds/HANDOFF.md`](../coding-home/projects/tybuilds/HANDOFF.md)

---

## 1) Security completeness

- [ ] **CRITICAL** Security checklist — full core + appendix; all applicable CRITICAL + CONDITIONAL
- [ ] **CRITICAL** Staging/production: anon cannot abuse `/api/ellis/stream` (rate limit, no prompt leak, no key exfiltration)
- [ ] **CRITICAL** No open security CRITICAL exceptions without documented reason
- [ ] **CRITICAL** Production build + env — no `ANTHROPIC_API_KEY` or full knowledge shelf in client bundle
- [ ] **ADVISORY** Sanitized write-up for any security findings fixed during build

## 2) Functional completeness

- [ ] **CRITICAL** BUILD checklist phases required for launch shipped — Ellis Hall, stream API, project rooms (Basement CRT, TL, GoE tease)
- [ ] **CRITICAL** Full journey on staging: land → chat with Ellis → open project card → reach demo or external link
- [ ] **CRITICAL** Tested by someone who **did not build** the flow (or blind scripted walkthrough)
- [ ] **CRITICAL** Ellis does not invent resume facts — spot-check 10 questions against `ty-facts.json`
- [ ] **CRITICAL** Session-only memory stated honestly — no false persistence claims
- [ ] **ADVISORY** Hygiene checklist appendix + deletion/refactor registers reviewed
- [ ] **ADVISORY** Architecture + doctrine match production (knowledge boundaries, GoE disclosure level)

## 3) Data integrity

- [ ] **CRITICAL** If any DB used: migrations applied; prod isolated from staging
- [ ] **CRITICAL** Knowledge pack (`ty-facts.json`, `ty-earnest.md`) matches what Ellis can say — Ty approved
- [ ] **CRITICAL** No debug-only content required for prod to function
- [ ] **ADVISORY** Orphan routes or unused API handlers removed or documented

## 4) Observability

- [ ] **CRITICAL** Error tracking on production (Sentry, Vercel monitoring, or equivalent)
- [ ] **CRITICAL** Failures visible for `/api/ellis/stream` and auth-less public routes
- [ ] **CRITICAL** Logs do not store `ANTHROPIC_API_KEY`, full system prompts, or visitor PII beyond session
- [ ] **ADVISORY** Process to check prod errors within 24h of first application send

## 5) Legal and compliance

- [ ] **CRITICAL** Privacy policy published and linked (footer or chat disclosure)
- [ ] **CRITICAL** Terms of service (or equivalent) published and linked
- [ ] **CRITICAL** AI disclosure — Ellis uses third-party AI; what visitor messages are sent; session-only memory
- [ ] **CONDITIONAL** Cookie consent if non-essential cookies or analytics added
- [ ] **ADVISORY** Contact path for factual corrections about Ty's resume

## 6) Performance baseline

- [ ] **CRITICAL** `/api/ellis/stream` rate limits, caps, or cost controls — not unlimited public abuse
- [ ] **CRITICAL** Reasoned about first-real-traffic failure modes (cold start, streaming timeouts, API quota)
- [ ] **ADVISORY** Two simultaneous chat sessions on staging without hard failures
- [ ] **ADVISORY** Public routes cannot enumerate internal paths or knowledge files

## 7) Recovery

- [ ] **CRITICAL** Rollback path for bad deploy documented (Vercel promote previous, or equivalent)
- [ ] **CRITICAL** Knowledge pack rollback — git tag or deploy pin if Ellis misstates facts post-deploy
- [ ] **ADVISORY** Incident response contact known (who fixes prod when Ty is applying)

## 8) Access hygiene

- [ ] **CRITICAL** Production secrets in platform secret manager only — not in git, not in client
- [ ] **CRITICAL** No dev/test API keys on production
- [ ] **CRITICAL** Knowledge file edits require deploy — visitors cannot mutate ty-facts via chat
- [ ] **ADVISORY** Rotate any secret that lived in chat or email during build

---

## Application-ready inputs

Before first application send (track here; not all are exit blockers for technical gate):

- [ ] Onboarding complete — `ty-earnest.md` approved by Ty
- [ ] Ty spot-check: 5 role-specific questions Ellis should answer well
- [ ] GoE tease answers reviewed — no private content
- [ ] `tybuilds.tech` DNS + SSL live

---

## Cursor prompt (Ellis)

```text
Exit criteria audit — Ellis / tybuilds.tech. Staging + production config.
Use docs/EXIT_CRITERIA.md. Aggregate security/hygiene appendix, E2E flows, legal, recovery.
Flag blockers for putting URL on job applications. ready | not-ready + numbered list.
```

---

## Progress tracker

| Section                 |  Items | CRITICAL |
| ----------------------- | -----: | -------: |
| Security completeness   |      5 |        4 |
| Functional completeness |      7 |        5 |
| Data integrity          |      4 |        3 |
| Observability           |      4 |        3 |
| Legal and compliance    |      5 |        3 |
| Performance baseline    |      4 |        2 |
| Recovery                |      3 |        2 |
| Access hygiene          |      4 |        3 |
| **Total**               | **36** |   **25** |

---

_Forked from canonical v1 · Last updated: 2026-06-10_
