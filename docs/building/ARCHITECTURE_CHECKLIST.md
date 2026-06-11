# Ellis / tybuilds.tech — Architecture Checklist

**Canonical v1:** [`~/coding-home/templates/architecture-checklist/ARCHITECTURE_CHECKLIST.v1.md`](../coding-home/templates/architecture-checklist/ARCHITECTURE_CHECKLIST.v1.md)

**This file:** Ellis fork — 18 items with Ellis Hall / knowledge shelf / project room specifics woven in.

**This is not the slice queue.** Run this checklist **once per slice** at rhythm step 3, then move on. Unchecked boxes mean “run the audit on the current slice,” not “project at zero.”

### Where to look

| Question                       | Doc                                                                                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **What slice am I on?**        | [BUILD_RHYTHM.md](./BUILD_RHYTHM.md) § **Planned slice queue**                                                                               |
| **How does it wire together?** | [WIRING_MAP.md](./WIRING_MAP.md)                                                                                                             |
| **Product phases**             | [BUILD_CHECKLIST.md](./BUILD_CHECKLIST.md)                                                                                                   |
| **Knowledge boundaries**       | [ENTRANCE_CRITERIA.md](./ENTRANCE_CRITERIA.md) · [`~/coding-home/projects/tybuilds/HANDOFF.md`](../coding-home/projects/tybuilds/HANDOFF.md) |

**When:** [BUILD_RHYTHM.md](./BUILD_RHYTHM.md) step 3 — after Wire, before Security. **Next gates:** [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) (step 4) · [HYGIENE_CHECKLIST.md](./HYGIENE_CHECKLIST.md) Core (step 5).

Per-slice audit: check applicable items for **this slice only** (`- [ ]` → `- [x]`), or paste the Cursor prompt below.

---

## 1) Domain boundaries

- [ ] **CRITICAL** Each touched component has one clear owner (Ellis host / knowledge shelf / project room / demo embed / platform API)
- [ ] **CRITICAL** Slice did not cross a domain boundary without a documented exception
- [ ] **CRITICAL** Ellis = third-person host about Ty; UI copy and system prompt do not blur Ellis into Ty's voice
- [ ] **ADVISORY** hire-me Personal/Business toggle patterns not reintroduced as primary UX without re-decision

## 2) Data flow and ownership

- [ ] **CRITICAL** Read/write ownership matches [WIRING_MAP.md](./WIRING_MAP.md) for touched paths
- [ ] **CRITICAL** Knowledge files (`ellis-self`, `ty-facts`, `ty-earnest`) are **read-only at runtime** — visitor chat cannot mutate them
- [ ] **CRITICAL** Session transcript stays ephemeral — no silent persistence path without documented scope change
- [ ] **CONDITIONAL** If Supabase added (rate limits only): writes server-only; not Ellis memory store

## 3) Removal test

- [ ] **CRITICAL** Deleting this slice's system would change observable visitor behavior
- [ ] **CRITICAL** Load-bearing paths from the slice appear on the wiring map (not code-only)

## 4) Design doc honesty

- [ ] **CRITICAL** [ARCHITECTURAL_DOCTRINE.md](./ARCHITECTURAL_DOCTRINE.md) still describes what was built
- [ ] **CRITICAL** Decisions forced by the slice recorded (decisions log or BUILD_CHECKLIST handoff — not chat-only)
- [ ] **ADVISORY** GoE disclosure level still matches handoff § GoE disclosure (moderate tease only)
- [ ] **ADVISORY** BUILD_CHECKLIST phase status honest for affected slices

## 5) Dependency direction

- [ ] **CRITICAL** Visitor UI → API route → Ellis lib / knowledge loader — domain libs do not import UI
- [ ] **CRITICAL** No circular dependency between chat stream, project cards, and demo embed loaders
- [ ] **CONDITIONAL** AI slices: system prompt + shelf assembly server-side only — not client-assembled from visitor input as authority

## 6) Slice coherence

- [ ] **CRITICAL** One intentional path for the behavior — no parallel undocumented way to stream chat or load knowledge (e.g. API + server action + client direct Anthropic call)

---

## Cursor prompt (Ellis slice)

```text
Architecture audit — Ellis / tybuilds.tech slice: [name]. Scope: [systems].
Use docs/ARCHITECTURE_CHECKLIST.md + WIRING_MAP + ENTRANCE_CRITERIA.
Flag Ellis voice drift, knowledge shelf write paths, session persistence creep, GoE over-disclosure, parallel chat paths.
No security or hygiene. pass | fail + required doc edits.
```

---

## Checklist inventory

| Section               |  Items | CRITICAL |
| --------------------- | -----: | -------: |
| Domain boundaries     |      4 |        3 |
| Data flow & ownership |      4 |        3 |
| Removal test          |      2 |        2 |
| Design doc honesty    |      4 |        2 |
| Dependency direction  |      3 |        2 |
| Slice coherence       |      1 |        1 |
| **Total**             | **18** |   **13** |

---

_Fork of canonical v1 · Last updated: 2026-06-10_
