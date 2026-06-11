# Build Ethos — Ellis / tybuilds.tech

**Status:** Locked 2026-06-11 — read before every build slice. Non-negotiable.

**Related:** [STYLE.md](./STYLE.md) · [BUILD_RHYTHM.md](./BUILD_RHYTHM.md) · [ARCHITECTURAL_DOCTRINE.md](./ARCHITECTURAL_DOCTRINE.md)

---

## The rule

**We don't patch. We gut it and build clean.**

When something changes — requirements, architecture, a bad first pass, a "quick fix" that aged badly — do **not** layer temp patches, shims, or commented-out cruft. Remove the wrong thing. Rebuild the right thing. Properly.

Ty's ask: clean, elegant, **sexy** code. Build the dream bot. If Ellis should feel expensive on the surface, the codebase should feel expensive underneath.

---

## What that means in practice

| Don't                                       | Do                                            |
| ------------------------------------------- | --------------------------------------------- |
| Bolt new behavior onto a broken abstraction | Rename or replace the abstraction             |
| `// TODO: fix later` after a hack ships     | Fix now or cut scope — no debt cosplay        |
| Duplicate paths "just for this slice"       | One intentional path; delete the old one      |
| Leave dead code "in case we need it"        | Delete; git remembers                         |
| Style pass as lipstick on a mess            | Structure first; glow follows good bones      |
| "It works" as the bar                       | Would Apple ship it? ([STYLE.md](./STYLE.md)) |

**Changing course is not failure.** Shipping patches on top of the wrong shape is.

---

## When a slice forces rework

1. **Stop** — don't stack fixes on the mistake.
2. **Name** what was wrong (wrong layer, wrong boundary, wrong file ownership).
3. **Delete or replace** the bad path — one PR, one truth.
4. **Wire** — update [WIRING_MAP.md](./WIRING_MAP.md) so the map matches reality.
5. **Hygiene** — build/lint clean; no orphans.

Small diff is good when the _first_ shape was right. When it wasn't, a small diff is a lie.

---

## Ellis-specific

- One stream path to chat — no API + server action + direct fetch parallel
- Knowledge shelf is read-only — don't "patch" visitor input into content files
- Prompt assembly in one place — don't scatter Ellis voice across components
- Dark/light, glass, streaming UI — implement tokens and structure once, not per-component hacks

Build Ellis like he belongs on Rodeo Dr. Same standard for the repo.

---

## Agent contract

**Read this file** at session start when building Ellis, and again before marking a slice done.

If you catch yourself reaching for a patch: pause, say so, gut the bad part, rebuild clean.

---

_Locked by Ty · 2026-06-11_
