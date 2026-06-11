# Ellis / tybuilds.tech — Build Checklist

**Work top to bottom. Do not skip ahead.**

**Build rhythm:** Every slice loops **Build → Wire → Architecture audit → Security audit → Hygiene audit** before the next slice. See [BUILD_RHYTHM.md](./BUILD_RHYTHM.md). Do not stack features across a gate.

**Planning:** [ENTRANCE_CRITERIA.md](./ENTRANCE_CRITERIA.md) · [EXIT_CRITERIA.md](./EXIT_CRITERIA.md) · [STYLE.md](./STYLE.md) · [`~/coding-home/projects/tybuilds/HANDOFF.md`](../coding-home/projects/tybuilds/HANDOFF.md)

How to check items off: edit `- [ ]` → `- [x]`.

---

## Approved product plan — Ellis as host

_Not a resume brochure. Not a salesman chatbot. A portfolio host who helps visitors assess fit._

**Visitor UX (target)**

| Area           | Direction                                                                         |
| -------------- | --------------------------------------------------------------------------------- |
| `/`            | Generic Ellis Hall — **default for all non-excited applications**                 |
| `/anthropic`   | Excited hall — Anthropic                                                          |
| `/huggingface` | Excited hall — Hugging Face (when ready)                                          |
| Project rooms  | Basement CRT, Tonal Learning, GoE tease — one click from chat or nav              |
| Voice          | Ellis is **him** — third person about Ty; facts from approved knowledge pack only |
| Memory         | Session-only for visitors — no cross-visit persistence in v1                      |
| Contact        | Footer link + AI disclosure                                                       |

**Explicitly out of v1:** hire-me Personal/Business toggle as primary UX, visitor accounts, persistent chat history, full GoE access, client intake forms.

**Implementation order (rough sequence)**

1. Entrance / doctrine locked (Phase 0.2)
2. Scaffold + Hall UI (Phase A)
3. Ellis live — **self only + onboarding mode + empty `about-ty/`** (Phase B)
4. **Ellis onboarding Ty** — Ellis asks, synthesizes, Ty approves (Phase 0.1 — product event)
5. Public mode + deploy (Phase C)

---

## PHASE 0 — Entrance + Ellis earns Ty

_Ellis boots knowing himself, not Ty. Onboarding is Ellis interviewing Ty — not Wren filling JSON._

**Spec:** [ELLIS_ONBOARDING_BUILD.md](./ELLIS_ONBOARDING_BUILD.md) · **Questions:** [ONBOARDING.md](../reference/ONBOARDING.md)

### 0.2 — Entrance gate (before build)

- [x] [ENTRANCE_CRITERIA.md](./ENTRANCE_CRITERIA.md) sketch gate — Ty confirmed 2026-06-11
- [x] Build gate — philosophy, audience, GoE tease + hard line, fit examples
- [x] GoE disclosure level agreed (doctrine §6)
- [x] **Ellis earns Ty** decision locked — [ELLIS_ONBOARDING_BUILD.md](./ELLIS_ONBOARDING_BUILD.md)
- [x] Bootstrap `content/ellis-self.md` + empty `content/about-ty/*`

**0.2 exit:** ✅ Doctrine + blank shelf — proceed to Phase A

### 0.1 — Ellis onboarding Ty (after Phase B — Ellis can talk)

_Ellis asks from [ONBOARDING.md](../reference/ONBOARDING.md). Ellis synthesizes into `about-ty/`. Ty approves. Wren does not answer for Ellis._

- [ ] Block C — person → `about-ty/earnest.md`
- [ ] Block D — projects
- [ ] Block E — through-line
- [ ] Block F — `about-ty/facts.json`
- [ ] Block G — `about-ty/goe-teach.md`
- [ ] Block H — fit judgment
- [ ] Ty approves all Ellis-written `about-ty/*`

### 0.3 — Phase 0 exit gate

- [ ] Ty approves Ellis's synthesis (not dev-written shelf)
- [ ] Flip to public mode
- [ ] Block I system tests (personas)
- [ ] **Proceed to Phase C deploy when Ty says go**

---

## PHASE A — Scaffold & static shell

_Repo exists. Ellis Hall UI + project room shells. No live AI yet._

### A.1 — Repo & infra

- [ ] Create GitHub repo — **Ty**
- [x] Init Next.js (App Router) + TypeScript + Tailwind 4 — `tybuilds` package, Next 16, `src/app`
- [x] ESLint + Prettier — `eslint.config.mjs`, `.prettierrc`, `format` scripts
- [x] `.env.example` — `ELLIS_MODE`, Anthropic, Supabase rate-limit keys
- [ ] Connect Vercel preview deploys — **Ty**
- [ ] Domain `tybuilds.tech` — DNS + SSL (Phase C)

### A.2 — Docs & topology

- [x] Create `docs/WIRING_MAP.md` — living topology (routes, API, knowledge files)
- [x] Create `docs/ARCHITECTURAL_DOCTRINE.md` — domain boundaries, Ellis vs shelf vs rooms
- [x] Copy bootstrap shelf: `content/ellis-self.md` + empty `content/about-ty/`

### A.3 — Static UI

- [x] Ellis Hall layout — chat panel shell (placeholder copy + project cards)
- [x] `/projects/basement-crt` — embed `public/demos/basement-crt.html` (from coding-home)
- [x] `/projects/tonal-learning` — showcase + link to live site
- [x] `/projects/goe` — public tease page
- [x] Footer — AI disclosure, session-only memory note, contact link
- [x] [STYLE.md](./STYLE.md) tokens in Tailwind — hall chrome, dark/light, room accents

### A.4 — Phase A rhythm gate

- [ ] **Build:** pages render; demo embeds load
- [ ] **Wire:** WIRING_MAP updated
- [ ] **Architecture audit:** [ARCHITECTURE_CHECKLIST.md](./ARCHITECTURE_CHECKLIST.md)
- [ ] **Security audit:** [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) — static routes only
- [ ] **Hygiene audit:** [HYGIENE_CHECKLIST.md](./HYGIENE_CHECKLIST.md) Core

**Phase A exit:** static site navigable — **proceed to Phase B**

---

## PHASE B — Ellis live

_Streaming chat + knowledge shelf. Ellis answers from approved pack._

### B.1 — Knowledge shelf + onboarding mode

- [ ] Load `ellis-self.md` + `about-ty/*` (empty until Phase 0.1)
- [ ] **`onboarding` mode** — Ty-only; question bank injected; synthesis path ([ELLIS_ONBOARDING_BUILD.md](./ELLIS_ONBOARDING_BUILD.md))
- [ ] **`public` mode** — blocked until Ty approves `about-ty/*`
- [ ] `_reference/` docs **never** in prompt assembly
- [ ] No runtime writes to `about-ty/*` from visitor input

### B.2 — Stream API

- [ ] `POST /api/ellis/stream` — Claude streaming
- [ ] System prompt enforces third person, fact grounding, GoE tease boundary
- [ ] Input length limits
- [ ] Rate limit or cost cap (or documented deferral with abuse plan)

### B.3 — Chat UI

- [ ] Wire Hall UI to stream API
- [ ] Error states + loading states
- [ ] Session-only memory UX copy matches behavior
- [ ] Project card handoff (tool or UI) when Ellis mentions a project

### B.4 — Phase B rhythm gate

- [ ] **Build:** chat streams; spot-check 5 facts against `ty-facts.json`
- [ ] **Wire:** WIRING_MAP + doctrine updated
- [ ] **Architecture audit:** shelf read-only, one stream path
- [ ] **Security audit:** anon abuse, prompt leak, XSS in chat render
- [ ] **Hygiene audit:** Core on touched files

**Phase B exit:** Ellis talks in onboarding mode — **proceed to Phase 0.1 (Ellis learns Ty)**

---

## PHASE C — Deploy & application-ready

_Production on tybuilds.tech. Ready for job applications._

### C.1 — Production

- [ ] `tybuilds.tech` live on Vercel
- [ ] Production env vars set (Anthropic key server-only)
- [ ] Privacy policy + terms linked (footer)
- [ ] Error tracking (Sentry or Vercel monitoring)

### C.2 — Verification

- [ ] Stranger test — someone who didn't build it chats with Ellis
- [ ] 10-question fact spot-check (no inventions)
- [ ] GoE tease answers reviewed — no private content
- [ ] Basement CRT + TL links work from production

### C.3 — Exit gate

- [ ] [EXIT_CRITERIA.md](./EXIT_CRITERIA.md) — whole-product pass
- [ ] Ty puts URL on at least one application (manual)

**Phase C exit:** application-ready — **v1 shipped**

---

## PHASE D — Strategic stack (post-v1)

_Optional. Don't block applications._

- [ ] Thin .NET integration ping (`integrations/bridge-dotnet`) — SimuTech signal
- [ ] Python content/audit utility — Adaptify signal
- [ ] Document honestly in project room copy (exposure vs primary stack)

---

## PHASE E — Polish & role targeting

_After Ellis talks on production._

- [ ] Project card tools (Ellis opens room programmatically)
- [ ] Copy polish — generic hall `/` for SimuTech, Adaptify; excited halls per [EXCITED_HALLS.md](../reference/EXCITED_HALLS.md)
- [ ] OG image / favicon / wordmark locked
- [ ] hire-me toys as side rooms (if Ty wants — not v1)

---

## Session handoff template

Append at end of each session (newest at top):

```markdown
### YYYY-MM-DD — [slice name]

- **Shipped:**
- **Verified:**
- **Next:**
- **Gotchas:**
```

---

## Locked constraints (don't drift)

- Ellis is **him** — third person about Ty
- Facts only from approved knowledge pack
- Session-only visitor memory — stated honestly
- GoE: moderate tease only
- Onboarding before scaffold; rhythm gate every slice

---

_Last updated: 2026-06-11 — Phase 0.2 active; ONBOARDING.md added_
