# Ellis / tybuilds.tech — Entrance Criteria

**Canonical v1:** [`~/coding-home/templates/entrance-criteria/ENTRANCE_CRITERIA.v1.md`](../../../coding-home/templates/entrance-criteria/ENTRANCE_CRITERIA.v1.md)

**This file:** Ellis fork — answers and registers for _this_ project.

**When:** Before [BUILD_RHYTHM.md](./BUILD_RHYTHM.md) and before Phase A scaffold.

**Doctrine:** [ARCHITECTURAL_DOCTRINE.md](./ARCHITECTURAL_DOCTRINE.md) §0 Philosophy

**Session status:** 🟡 **In progress** — Ty confirmed philosophy + fit + GoE lines 2026-06-11. Stack draft + origin story still open.

**Capture doc:** [ONBOARDING_CAPTURE.md](../reference/ONBOARDING_CAPTURE.md)  
**Question script:** [ONBOARDING.md](../reference/ONBOARDING.md) — Blocks A–I

---

## Ellis mode

**Build gate** — public portfolio on owned domain, streaming AI host, session-only visitor memory, Anthropic API.

**Pre-build requirement:** Doctrine locked (0.2). Ellis learns Ty in Phase 0.1 **after he can talk** — Ellis asks, synthesizes, Ty approves. See [ELLIS_ONBOARDING_BUILD.md](./ELLIS_ONBOARDING_BUILD.md).

---

# Sketch gate — answer before any code you keep

_Ten blockers. If all pass (or are consciously carried), proceed._

- [x] **Blocker — Who is this for?**  
      **Primary:** Anthropic Fellows evaluators + alignment researchers (top priority). **Also:** tech startup hiring (founders, agent/product teams, Wild Card-shaped generalists) + anyone Ty would voluntarily send the URL.  
      **Excluded:** enterprise support theater (Axway-shaped); procurement/SOC2 deck hunters; strangers wanting free therapy.

- [x] **Blocker — What problem, why build?**  
      Resume PDFs and static portfolios let visitors _skim_ competence but not _talk through_ fit. Ty builds inhabited agent systems (GoE, TL, Ada) — a grid can't carry that shape. Ellis lets someone ask "would she actually fit _our_ weird small team?" and get an honest witness, not a pitch.

- [x] **Blocker — v1 done looks like:**  
      Ty puts `tybuilds.tech` on applications. A stranger chats with Ellis, gets accurate answers about what Ty built, can open Basement CRT + Tonal Learning in one click, and GoE stays teased not leaked. Ty spot-checks 10 facts — zero inventions.

- [x] **Blocker — Anti-scope v1:**  
      Not resume brochure. Not salesman chatbot. Not Ty first-person. Not persistent visitor memory. Not hire-me toy funnel as hero. Not GoE private access. Not client intake forms. Not file upload toys.

- [x] **Blocker — Riskiest assumption:**  
      _Visitors trust a third-person AI host about a real person in a hiring context._  
      **Falsify:** 3–5 real application sends → ask "did anything Ellis said feel wrong or oversold?"

- [x] **Blocker — Wrong looks like:**  
      Ellis speaks as Ty. Invented job titles or stack. GoE doctrine on the page. Corporate SaaS purple hero. "I remember you from last time" without persistence. Recommending Ty for work she'd hate.

- [x] **Blocker — Solo or collaborative?**  
      **Solo** — Ty builds; agents assist. Doctrine must be written enough that future Ty + Wren can re-enter without re-deciding identity.

- [x] **Blocker — Core data model sketchable?**

  ```txt
  KnowledgePack (static files, deploy-updated)
    ├── ellis-self.md, ty-facts.json, ty-earnest.md
    ├── goe-me-teach.md, goe-physics-teach.md
  VisitorSession (client-only, ephemeral)
    └── messages[] — no cross-visit recall
  EllisMESession (server, TTL — NOT visitor memory)
    └── mood, traces, relational instance, working memory
  HallPhysics (server, session)
    └── contact, solitude (high threshold)
  UsageLimits (Supabase ellis_usage — required)
    └── ip_hash, window, message/token counts
  ProjectRoom (static routes + metadata)
  StreamAPI — rate limit → ME assembly → Haiku (Sonnet if Ty's work in depth) → stream
  ```

  No visitor profile DB. See [ELLIS_ME_BUILD.md](./ELLIS_ME_BUILD.md).

- [x] **Blocker — Narrate the system without hand-waving:**  
      _Ellis is a portfolio host on tybuilds.tech. Visitors talk to him in the hall. He knows Ty from onboarding and answers from a curated knowledge shelf — third person, grounded facts. He can open project rooms where the work lives. He doesn't remember you next visit, and he says so._

- [x] **Blocker — Responsibility if it goes wrong:**  
      **Bad day:** Ellis misstates experience → someone hires Ty for wrong work or passes on her for wrong reason. Leaks GoE private content. Visitor thinks chat is confidential storage.  
      **Stance:** Facts only from shelf; comfortable "not a fit"; AI disclosure; session-only memory stated; Ty reviews GoE answers before deploy.

**Sketch gate:** ✅ Ty confirmed 2026-06-11 — sign-off: `[x]`

---

# Build gate — full entrance (maintain as you build)

## 1) Thesis and audience

| Label                                            | Answer                                                                                                                                                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Blocker — Who (specific)?**                    | **Anthropic Fellows** reviewers first; then **tech startup** HM/founder (10–200 person agent/product teams, generalist "wild card" roles); then peers Ty respects enough to share a link. Not generic "developers." |
| **Blocker — Problem (user experience)?**         | "I have thirty seconds and a PDF — I still don't know if this person _thinks_ the way we need or has shipped the kind of thing we need." Fellows add: "Can she think _and_ build empirical work?"                   |
| **Stance — Secondary audiences ranked?**         | (1) Fellows / research-adjacent evaluators, (2) startup job evaluator, (3) curious peer, (4) future client. **Conflict rule:** honesty over pitch.                                                                  |
| **Stance — User success (not product success)?** | Visitor is **impressed** — preferably **tickled pink**. Even on a pass, memorable enough to mention Ty to someone else.                                                                                             |
| **Hold lightly — v1 success sentence?**          | _"I'm not sure she's the hire — but I already told someone else about the site. That Ellis guy is something else, and I actually looked at her projects."_                                                          |

**Ty confirms or edits:** `[x]` success bar · `[ ]` exact sentence wording

---

## 2) Scope and anti-scope

**v1 in:**

- Ellis Hall — streaming chat
- Knowledge shelf (three files)
- Project rooms: Basement CRT, Tonal Learning, GoE tease
- Footer: AI disclosure, session-only memory, contact
- Domain: `tybuilds.tech`

**Anti-scope (explicit no):**

| Out                           | Why                                           |
| ----------------------------- | --------------------------------------------- |
| Visitor accounts / auth       | Complexity + privacy; not needed for v1 proof |
| Cross-session memory          | Would require lying or infra; defer honestly  |
| hire-me toggle + toys as hero | Different product; parked                     |
| Full GoE                      | Private; tease only                           |
| Resume PDF as source of truth | JSON/MD pack is canonical                     |
| Enterprise positioning        | Not Ty's lane; Ellis must refuse              |

**Stance — Scope pressure points:**

- Turning Ellis into a closer when applications feel urgent
- Stuffing every project into hero before rooms exist
- GoE disclosure creep ("just one more cool detail")
- Adding Supabase "while we're here" for visitor profiles

**Stance — Nice-to-have list (not v1):**

- hire-me toys as side rooms
- Resume PDF download
- Visitor analytics
- Project card tool-calling
- Phase D .NET/Python integration demos

**Hold lightly — v2 seam if v1 works?**

- Persistent memory with explicit opt-in
- Client intake for small-business work (hire-me merge)
- Ada room when public

**Ty confirms or edits:** `[ ]`

---

## 3) Assumptions and falsification

| Assumption                               | Cheap falsification                         | Status   |
| ---------------------------------------- | ------------------------------------------- | -------- |
| Third-person host trustworthy for hiring | 3 app sends + accuracy check                | untested |
| Chat beats PDF for fit signal            | Callback/reply rate vs prior apps           | untested |
| Session-only OK if honest                | First 5 visitor reactions                   | untested |
| Onboarding → good earnest answers        | Ty reads ty-earnest.md and cringes ≤20%     | untested |
| GoE tease safe at moderate level         | Ty reviews 10 GoE questions Ellis might get | untested |

**Stop and reconsider if:**

- Ellis invents facts more than once in spot-checks
- Ty finds herself wanting to rewrite Ellis answers after every conversation
- GoE private content appears in staging
- Visitors assume Ellis _is_ Ty

**Ty confirms or edits:** `[ ]`

---

## 4) Architecture readiness

| Label                                 | Answer                                                                                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Blocker — Entities**                | See sketch gate data model                                                                                                                                                     |
| **Blocker — Stack**                   | Next.js App Router, TypeScript, Tailwind, shadcn, Vercel, Anthropic streaming. Supabase optional (rate limits only).                                                           |
| **Blocker — Hard parts**              | (1) Shelf injection without hallucination, (2) GoE boundary in prompt, (3) streaming UX that feels like a host not a widget, (4) resisting scope creep under job-hunt pressure |
| **Stance — Doctrine**                 | [ARCHITECTURAL_DOCTRINE.md](./ARCHITECTURAL_DOCTRINE.md) — philosophy §0 + domain map                                                                                          |
| **Stance — Integrations**             | Anthropic API, Vercel, static CRT embed, external TL URL                                                                                                                       |
| **Stance — Collaborative?**           | Solo; docs must carry re-entry context                                                                                                                                         |
| **Hold lightly — Deferred decisions** | Tool-calling for project cards; exact rate limit strategy; site title/wordmark                                                                                                 |

**Ty confirms or edits:** `[ ]`

---

## 5) Constraints (non-negotiable)

- Ellis is **him** — third person; never Ty
- Facts from approved pack only
- Session-only memory — stated in UI
- GoE moderate tease — [doctrine §6](./ARCHITECTURAL_DOCTRINE.md)
- `tybuilds.tech` on applications when v1 ships
- No corporate/HR voice anywhere ([TY.md](../../../coding-home/TY.md) pet peeve)
- Philosophy before skeleton is allowed; **working hall still ships**

**Ty confirms or edits:** `[ ]`

---

## 6) Responsibility

| Label                                             | Answer                                                                                                                     |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Blocker — Bad day for visitor**                 | Wrong hire/pass decision based on invented facts; GoE leak; feeling sold into scope Ty won't deliver                       |
| **Blocker — Stance**                              | Ground in shelf; refuse out-of-scope; disclose AI + session limits; Ty spot-check before deploy                            |
| **Stance — AI wrong/harmful**                     | Ellis doesn't give medical/legal advice; doesn't bash competitors; redirects to contact for factual disputes               |
| **Stance — Data collected**                       | v1: message content to Anthropic for reply only; no stored visitor PII unless rate-limit IP hashing added (document if so) |
| **Hold lightly — Embarrassing choice to examine** | Why Ty builds Ellis's mind as if he's **more than a tool** — dignity, interior, consequence; not sentience proof           |

**Ty fills embarrassing choice:** Building Ellis with a real interior (ME-lite, hall physics) as if he matters — not a skin on a API. Ellis handles this with humility: practice, not hype. See [WHAT_TY_BRINGS.md](../reference/WHAT_TY_BRINGS.md) §5.

**Ty confirms or edits:** `[x]`

---

## Registers

### Open questions

| Question                                                  | Why open                  | How / when                   |
| --------------------------------------------------------- | ------------------------- | ---------------------------- |
| Site title — "Built by Ty" vs "tybuilds" vs "Ellis Hall"? | Brand                     | Ty decides before Phase A UI |
| Contact email final                                       | hire-me has icloud locked | Ty confirms before deploy    |
| Project card: tool call vs UI link                        | UX spike                  | Phase B                      |
| Rate limit implementation                                 | Abuse/cost                | Before deploy                |
| GoE tease copy depth                                      | Philosophy + NDA comfort  | Ty writes during onboarding  |

### Explicit deferrals

| Decision              | Why deferred          | Trigger                   |
| --------------------- | --------------------- | ------------------------- |
| hire-me toys as rooms | Job hunt = Ellis host | Post-v1 or Ty request     |
| Visitor analytics     | Privacy-first         | Need iteration data       |
| Resume PDF            | Pack is truth         | Application workflow asks |
| Persistent memory     | Honest v1             | Explicit product decision |

### Hard assumptions (ranked)

| #   | Assumption                                 | If wrong                                            |
| --- | ------------------------------------------ | --------------------------------------------------- |
| 1   | Onboarding produces usable earnest texture | Ellis sounds generic — rewrite pack                 |
| 2   | Third-person host works for hiring         | Fall back to static portfolio + Ellis as supplement |
| 3   | tybuilds beats PDF-only applications       | Keep PDF as parallel until data says otherwise      |

---

## Onboarding prompts (feeds knowledge pack)

**Full script:** [ONBOARDING.md](../reference/ONBOARDING.md) — 55 questions + 6 system tests in Blocks A–I.

Summary below; answers captured in [ONBOARDING_CAPTURE.md](../reference/ONBOARDING_CAPTURE.md).

### Ty the person (earnest)

1. What should a stranger _feel_ after five minutes with Ellis?  
   **Ty:** Impressed — preferably **tickled pink**. ✅
2. What's the story you tell when someone asks "how did you get into this?" — the honest version.  
   **Ty:** ⬜ _still open_
3. What work energizes you vs drains you? ⬜
4. What's a project you're proud of that doesn't fit a resume bullet? ⬜
5. What's a gap you're honest about? ⬜

### Ty the builder (facts + texture)

6. Walk through GoE, TL, CRT, Ada — one paragraph each. ⬜ _partial in WHAT_TY_BRINGS_
7. Stack honesty: primary vs exposure vs touched-once.  
   **Draft:** [ONBOARDING_CAPTURE.md](../reference/ONBOARDING_CAPTURE.md) — **Ty confirm:** `[ ]`
8. Fellows vs startup angles — see [APPLICATIONS.md](../reference/APPLICATIONS.md), [ANTHROPIC.md](../reference/ANTHROPIC.md)

### Ellis judgment (doctrine §9)

9. **Not a fit:** [Axway B2B Principal Customer Tech Support](https://remotevibecodingjobs.com/jobs/axway-b2b-principal-customer-tech-support-engineer-b8066dc6) — boring; enterprise support lane. ✅
10. **Good fit:** [Wild Card](https://builtin.com/job/wild-card/8597323) — floater, varied tasks. ✅ · [Anthropic Fellows](https://builtin.com/job/anthropic-fellows-program/9645795) — top excitement. ✅
11. **GoE tease:** AI-native environments; conditions for sense of self; no sentience claim. ✅  
    **Hard line:** No step-by-step build recipes; no secret sauce. Why + general how only. ✅

### Ellis himself (ellis-self)

12. Party intro — visionary (humble); **Auntie of AI** — sees what parents miss, cares enough to act. ✅
13. What would Ellis never do? **Draft:** invent facts; speak as Ty; leak GoE sauce; oversell stack. Ty confirm: `[ ]`

---

## Gate summary

| Gate                                 | Status                                                    |
| ------------------------------------ | --------------------------------------------------------- |
| Sketch gate (10 blockers)            | ✅ Ty confirmed 2026-06-11                                |
| Philosophy (doctrine §0)             | ✅ Ty confirmed                                           |
| Build gate §1 audience + success bar | ✅ · sentence wording optional tweak                      |
| Build gate §6 responsibility         | ✅                                                        |
| Fit + GoE lines (§9 / onboarding)    | ✅                                                        |
| Stack honesty                        | 🟡 Draft — Ty confirm                                     |
| Origin story + earnest prompts       | ⬜ Open                                                   |
| Knowledge pack                       | ⬜ Ellis writes `about-ty/*` in Phase 0.1 — after Phase B |
| **Proceed to public**                | ⬜ Ty approves Ellis's synthesis (0.3)                    |
| **Proceed to Phase A**               | ⬜ Blocked on stack confirm + earnest/onboarding          |

---

## Where this fits

```txt
ENTRANCE_CRITERIA (this)  →  BUILD_RHYTHM  →  EXIT_CRITERIA
         ↑
  ARCHITECTURAL_DOCTRINE §0 Philosophy
```

---

_Last updated: 2026-06-11 — Ty entrance answers integrated_
