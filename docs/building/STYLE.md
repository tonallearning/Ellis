# Style — Ellis / tybuilds.tech (fork)

**Master:** [`~/coding-home/templates/style/STYLE_MASTER.v1.md`](../../../coding-home/templates/style/STYLE_MASTER.v1.md)  
**Planning:** [`~/coding-home/projects/tybuilds/HANDOFF.md`](../../../coding-home/projects/tybuilds/HANDOFF.md) · [ENTRANCE_CRITERIA.md](./ENTRANCE_CRITERIA.md)  
**Status:** Direction locked — implement at Phase A scaffold + polish slice (updated 2026-06-11)

---

## Product north star (this site)

**Portfolio host disguised as a conversation** — not a resume grid, not a salesman chatbot.

Visual job: visitor feels welcomed by someone who _knows_ Ty, can assess fit honestly, and opens the right project room when curious. Ellis is the UI hero; project demos are proof.

**Success bar (locked 2026-06-11):** Even when Ellis says _no_ to a company or role, the visitor is so impressed they still talk about Ty to someone else. Honest fit judgment is a feature — the _experience_ has to be memorable enough that a pass still spreads.

Inherits global principles from STYLE_MASTER: **conversation not brochure**, **warm not HR**, **honest scope**, **accessible delight**.

---

## Quality litmus test (locked 2026-06-11)

**Would Apple ship it?**

- No decoration that doesn't earn its pixel
- Motion feels inevitable, not performed
- Typography and spacing do 80% of the work; effects are seasoning
- Dark and light are two complete products — not one theme + inverted colors
- Accessibility is the bar for "expensive," not a polish pass

If it reads like a portfolio template, a crypto landing page, or a fan-site with glassmorphism slapped on — reject it.

**Luxury register:** Rodeo Dr casual — _The Row_, not Supreme. Understated, impeccable, nowhere to be and all the time in the world. Visitor notices the _fit_, not the logo. Ellis doesn't look like he's selling Ty; he looks like he belongs somewhere expensive without trying.

---

## Aesthetic direction (locked 2026-06-11)

**Make him sexy** — composed, luminous, slightly unreal in a way that feels _expensive_. Not thirst-trap. Not corporate SaaS purple. Not anime boyfriend clipart.

| Word                | Build translation                                                                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Elegant chat**    | One focal column, generous line-height; messages as glass panels, not bubble stickers                                                                                         |
| **Glowy**           | Soft bloom on focus, streaming, hover only — light sources, not neon carnival                                                                                                 |
| **Dewy**            | Layered translucency: `backdrop-blur`, subtle inner highlights, specular edge on panels                                                                                       |
| **Glassy**          | Frosted shell over a slow-moving ambient gradient (barely perceptible — stage lighting between songs)                                                                         |
| **K-pop dream boy** | Editorial restraint: one accent, high-contrast type, negative space as flex. Idol concept-photo energy — _styled_, not busy. Airport-fashion layout, not fan-site widget pile |

Filter all of the above through the Apple / Rodeo test. Sexy here = groomed, unhurried, specific. Expensive is sexy.

---

## Locked: single mood (no Personal/Business toggle)

Unlike hire-me, Ellis is **one host, one hall**. No mode split at v1.

| Layer             | Behavior                                                                        |
| ----------------- | ------------------------------------------------------------------------------- |
| **Chrome**        | Luminous glass hall — editorial luxury, not workshop-warm, not SaaS dashboard   |
| **Ellis panel**   | Chat-first, centered column; guide energy, not iMessage cosplay                 |
| **Project rooms** | Each room gets its own accent when entered; hall stays neutral-luxury           |
| **Demos**         | Basement CRT keeps retro CRT identity _inside_ its room — not global page noise |

```txt
Hall (neutral luminous)  →  excited hall (optional company accent + Anthropic Claude hook)  →  project room  →  demo
```

---

## Anthropic hall — Claude-inspired overlay (locked 2026-06-11)

**Route:** `/anthropic` only. Spec: [ELLIS_EXPERIENCE.md](./ELLIS_EXPERIENCE.md).

| Element | Direction |
| --- | --- |
| **Visual** | Claude-adjacent — warm cream/terracotta, familiar chat shape — **inspired**, not official branding |
| **Hook** | Ellis types first; discloses borrowed face immediately |
| **Toggle** | Visitor can switch to pure Ellis chrome — `localStorage`, default overlay on for `/anthropic` |
| **After toggle** | Ellis identity visually; voice unchanged |

Generic hall never uses this overlay.

---

---

## Dark + light parity (locked 2026-06-11)

**Equal modes** — both first-class from scaffold, not a toggle bolted on later.

```txt
Semantic tokens first (not "light-*" hacks)
  → surface-0 / surface-1 / surface-2 (elevation ladder)
  → text-primary / text-secondary
  → accent (one, restrained)
  → glass: blur + tint + border (tuned separately per mode)

Both modes get:
  → full contrast audit (WCAG AA minimum)
  → glass refraction tuned per mode (dark = subtle edge light; light = soft shadow depth)
  → ambient gradient that works in both (barely there)
  → prefers-color-scheme default + manual override that persists
```

| Mode      | Character                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| **Dark**  | Album packaging — charcoal-not-black, warm white type, glass catches edge light like a boutique window at night       |
| **Light** | Morning on Rodeo — cream/white surfaces, soft shadow depth instead of glow, same editorial spacing. Dewy, not sterile |

Same Ellis. Same hierarchy. Same composition. The _material_ changes; the layout does not.

---

## Ellis presence (locked 2026-06-11)

Apple wouldn't ship a stock-photo host.

1. **Typographic identity first** — wordmark / monogram, perfect kerning, maybe one exquisite detail (hairline rule, subtle mark)
2. **Environmental presence** — the hall _is_ him before he types
3. **Streaming state** — soft, single-point alive indicator. Not three bouncing dots.

Illustrated avatar: **optional later** — only custom, editorial, and passes the Apple test. Environment + type before character art.

---

## Token categories (resolve at scaffold)

Define in Tailwind / CSS variables when repo exists:

### Color

- Semantic: `surface-0`, `surface-1`, `surface-2`, `text-primary`, `text-secondary`, `accent`, `border`, `glass-tint`, `glass-border`
- Hall accent: **one** iridescent edge — ice blue → soft violet shift on interaction only (never rainbow, never corporate purple hero)
- Room accents: `basement-*`, `tl-*`, `goe-*` — one per project route
- Semantic: `destructive` (minimal)

**Dark base:** deep charcoal / soft midnight (not pure black)  
**Light base:** cream / warm white (not clinical hospital white)

### Typography

| Role           | Use                                                      |
| -------------- | -------------------------------------------------------- |
| `font-sans`    | UI chrome, Ellis chat, nav — considered, high-legibility |
| `font-display` | Hall headline / wordmark only                            |
| `font-mono`    | Code snippets in project cards only                      |

Scale: readable body in chat (`max-width ~42rem`); project cards scannable at a glance. Typography carries most of the luxury — don't compensate with effects.

### Spacing & layout

- Chat column centered; project cards appear in-panel when Ellis mentions work — not a hero grid
- Footer always visible — contact, AI disclosure, session-only memory note
- Generous negative space; Rodeo-register restraint

### Radius & elevation

- Precise editorial geometry with soft corners — not bubbly, not razor-sharp
- Glass panel elevation in hall; flatter project cards inside chat flow

### Motion

- Entry: fade + 8–16px rise, 200–300ms
- Streaming text: no layout jitter; respect `prefers-reduced-motion`
- Room transition: crossfade content, 150ms
- Accent bloom on focus / stream / hover only

### Effects

- Glass + ambient gradient in hall only — supports content, doesn't compete (Apple Liquid Glass discipline)
- **No** global CRT/grain — reserved for Basement CRT room embed
- **No** corporate purple-gradient hero
- **No** ambient glow carnival — glow is earned, single-point, intentional

---

## Chat UI shape (target)

```txt
┌─────────────────────────────────────────────┐
│  [ambient gradient — slow, barely there]    │
│                                             │
│     ┌─ glass panel ─────────────────┐       │
│     │  Ellis (typographic presence) │       │
│     │  streaming message area       │       │
│     │  ┌ project card slides in ─┐  │       │
│     │  │ when he mentions work    │  │       │
│     │  └──────────────────────────┘  │       │
│     │  [ input — dewy border glow ] │       │
│     └───────────────────────────────┘       │
│  footer: honest disclosure, always visible  │
└─────────────────────────────────────────────┘
```

---

## Content & voice (visual carry)

- **Ellis chat** is the typographic focus on `/` — largest readable block after first message
- **Project cards** = title + one honest line + CTA — not feature grids
- **CTAs:** one primary per beat — "Open project" → demo or external link
- **Third person** about Ty in all UI copy outside Ellis's own voice block
- **Fit judgment** must feel as calm and composed as everything else — "that's not her strongest angle" delivered without apology or pitch energy

---

## Anti-patterns (Ellis-specific)

- Resume PDF grid as hero
- Ellis avatar as corporate stock photo or generic anime boyfriend
- Identical chrome for hall and Basement CRT (demo should feel like entering a room)
- Hidden AI disclosure
- Fake "we remember you" persistence UI
- Template portfolio / crypto landing / Dribbble-shot glassmorphism
- Dark mode as gray `#1a1a1a` + purple afterthought
- Thirst UI, neon carnival, bloom on everything
- Beautiful chatbot that still pitches — glow doesn't save a closer

---

## Accessibility baseline

- Body text ≥ 4.5:1 contrast (WCAG AA) in **both** modes
- Focus rings on chat input, project card links, drawer close
- Touch targets ≥ 44px on mobile for primary chat actions
- Streaming content: `aria-live` polite region for new Ellis messages
- `prefers-reduced-motion` honored; `prefers-color-scheme` respected

---

## Open decisions (resolve in repo)

- [ ] Site title / wordmark (`tybuilds` vs `Ellis Hall` vs both)
- [ ] Favicon / OG image
- [ ] Font loading vs system stack (must pass Apple bar either way)
- [ ] Illustrated Ellis avatar — deferred; typographic + environmental first

---

## Where this fits

```txt
ENTRANCE_CRITERIA  →  BUILD_RHYTHM  →  STYLE (polish slice)  →  EXIT_CRITERIA
```

---

_Fork of STYLE_MASTER v1 · Last updated: 2026-06-11_
