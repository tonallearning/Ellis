# Excited halls — registry

**Status:** Living registry — only companies Ty is genuinely excited about get a dedicated hall  
**Policy:** [ELLIS_ME_BUILD.md](../building/ELLIS_ME_BUILD.md) § Hall variants  
**Updated:** 2026-06-11

---

## Routing rule (locked)

| Visitor type        | URL                            | Ellis                                                      |
| ------------------- | ------------------------------ | ---------------------------------------------------------- |
| **Everyone else**   | `https://tybuilds.tech/`       | Generic hall — witness, honest fit, no company-first pitch |
| **Excited company** | `https://tybuilds.tech/{slug}` | Specialized hall — genuine enthusiasm + alignment overlay  |

**No custom hall for:** roles Ty is sending to but not excited about (SimuTech, Adaptify, Axway, etc.). They get **`/` only**.

Excitement is the gate — not application volume, not "might as well customize."

---

## Registry

| Slug | Route | Company | Status | Application URL | Notes |
| --- | --- | --- | --- | --- | --- |
| `anthropic` | `/anthropic` | Anthropic (Fellows + beyond) | 🟡 Build with v1 | `https://tybuilds.tech/anthropic` | Claude-inspired visual + opener; toggle to Ellis |
| `huggingface` | `/huggingface` | Hugging Face | ⏸ When Ty ready | `https://tybuilds.tech/huggingface` | Enthusiasm overlay when built |

**Anthropic-only UX:** [ELLIS_EXPERIENCE.md](../building/ELLIS_EXPERIENCE.md) — visual overlay, Ellis types first, `content/halls/anthropic-opening.md`

**Overlay:** `content/halls/{slug}.md` — Ty-approved enthusiasm brief per row.  
**Deep dive (optional):** `docs/reference/{topic}.md` — e.g. [ANTHROPIC.md](./ANTHROPIC.md); never raw-injected.

---

## Adding an excited hall

1. **Ty confirms excitement** — same bar as Anthropic (genuine, not performative)
2. **Write** `content/halls/{slug}.md` (+ optional `docs/reference/{slug}.md` for build notes)
3. **Register** slug in `src/lib/ellis/halls/registry.ts` (server allowlist)
4. **Route** — dynamic `[hall]/page.tsx` or static page; same `ChatPanel`, `hall` prop
5. **Update this file** + [APPLICATIONS.md](./APPLICATIONS.md)

One stream API. One Ellis. Overlay only.

---

## Explicitly not halls

| Company / role | URL                            | Why                                   |
| -------------- | ------------------------------ | ------------------------------------- |
| SimuTech       | `/`                            | Application send, not excitement-tier |
| Adaptify       | `/`                            | Same                                  |
| Axway          | `/`                            | Pass — not a fit                      |
| Wild Card      | `/` unless excitement upgrades | Good fit ≠ custom hall                |

---

## Implementation note

Server allowlist = `default` + registered excited slugs from `registry.ts`. Reject unknown `hall` values. Do not accept arbitrary client slugs.

```txt
src/lib/ellis/halls/registry.ts   # EXCITED_HALLS = ['anthropic', 'huggingface', ...]
src/app/[hall]/page.tsx           # or /anthropic/page.tsx per slug at v1
content/halls/{slug}.md
```

---

_If it's not on this registry, the URL is `tybuilds.tech`._
