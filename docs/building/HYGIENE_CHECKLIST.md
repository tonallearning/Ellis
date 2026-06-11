# Ellis / tybuilds.tech — Code Hygiene Checklist

**Canonical v1:** [`~/coding-home/templates/hygiene-checklist/HYGIENE_CHECKLIST.v1.md`](../coding-home/templates/hygiene-checklist/HYGIENE_CHECKLIST.v1.md)

**This file:** Ellis fork — v1 core + appendix with Next.js / Ellis stream notes.

**Not security.** RLS, auth, secrets → [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md).

**When:** [BUILD_RHYTHM.md](./BUILD_RHYTHM.md) step 5 — **Core only** on touched files each slice; **Appendix** before first application send or monthly deep pass.

How to check off: `- [ ]` → `- [x]`.

---

# Core — slice audit

Run on files touched by the current slice. See canonical for full item text; Ellis notes below.

## 0) Build gate

- [ ] **CRITICAL** `npm run build` passes
- [ ] **CRITICAL** `npm run lint` passes (or pre-existing failures documented)

## 1) Old and legacy code

- [ ] **CRITICAL** Touched code matches Ellis hall + project rooms architecture (not hire-me toggle as primary)
- [ ] **CONDITIONAL** No imports from `~/hire-me` copied wholesale without Ellis adaptation
- [ ] **ADVISORY** No stub waiting on onboarding knowledge pack after Phase 0 ships
- [ ] **ADVISORY** No GoE interior patterns copied into Ellis host without tease boundary

## 2) Dead and unreachable code

- [ ] **CRITICAL** No unused exports in slice diff
- [ ] **CRITICAL** No commented-out production code
- [ ] **CRITICAL** No placeholder after removed feature (orphan route handlers, empty components)
- [ ] **CONDITIONAL** No permanently-off feature flags in visitor path

## 3) Duplication and drift

- [ ] **CRITICAL** No duplicate knowledge loading (API route + server action + client fetch of same shelf)
- [ ] **CRITICAL** No duplicate stream handlers or parallel Anthropic client factories
- [ ] **ADVISORY** Project card metadata not copy-pasted across three room pages — centralize or document
- [ ] **ADVISORY** Ellis voice / third-person rules not duplicated inconsistently (prompt vs UI copy)

## 4) Broken or brittle code

- [ ] **CRITICAL** No known broken visitor flow with TODO instead of fix
- [ ] **CRITICAL** Stream errors surfaced to UI, not swallowed
- [ ] **CONDITIONAL** SSE/stream cleanup on unmount — no leaked connections
- [ ] **CRITICAL** Null-safe paths when knowledge file missing or malformed

## 5) Debug and trace leftovers

- [ ] **CRITICAL** No `console.log` in API routes, Ellis lib, chat components (slice)
- [ ] **ADVISORY** TODO/FIXME tracked in BUILD_CHECKLIST or handoff
- [ ] **CRITICAL** No commented blocks in chat / project room paths
- [ ] **CRITICAL** No developer-only behavior reachable by visitors

## 6) File and folder hygiene

- [ ] **ADVISORY** Ellis lib under consistent path (e.g. `src/lib/ellis/` — decide at scaffold)
- [ ] **ADVISORY** Knowledge content under `content/` — not mixed into components
- [ ] **ADVISORY** BUILD_CHECKLIST phase status matches shipped code

## 7) Cleanup decision rules

(Same as canonical — apply while auditing.)

- [ ] Delete if dead · Merge if duplicate · Refactor if brittle · Leave if intentional · Test first if critical · Don't preserve from fear

---

# Appendix — deep audit

Use canonical appendix (§8–14) for bug-prone logic, complexity, layers, tests, data/state, deps, maintenance signals.

### Ellis code layer notes (§10)

- [ ] **CRITICAL** Client components do not import `ANTHROPIC_API_KEY` or full knowledge shelf
- [ ] **ADVISORY** Stream + shelf assembly live server-side only
- [ ] **ADVISORY** Demo embed pages isolated from Ellis chat state

---

## Registers (fill during deep audit)

### Deletion candidates

| Path | Why | Confidence | Blocked by |
| ---- | --- | ---------- | ---------- |
|      |     |            |            |

### Refactor candidates

| Path | Smell | Suggested split |
| ---- | ----- | --------------- |
|      |       |                 |

### Test gaps (critical flows)

| Flow                    | Coverage today | Minimal test to add |
| ----------------------- | -------------- | ------------------- |
| Ellis stream happy path |                |                     |
| Knowledge shelf load    |                |                     |
| Project room navigation |                |                     |

---

## Cursor prompt (Ellis slice)

```text
Hygiene audit — Ellis slice: [name]. Scope: [paths].
Use docs/HYGIENE_CHECKLIST.md Core only.
Find dead, duplicated, legacy, broken code. delete | merge | refactor | leave | test-first.
No security. Confirm build + lint.
```

---

_Fork of canonical v1 · Last updated: 2026-06-10_
