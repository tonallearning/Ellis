# Ellis — Research Log

**Purpose:** Chronological record of **decisions**, **why**, and **system/design impact** while building tybuilds.tech. Not chat-only — if it changes shape, it gets a row here.

**Companion:** [DEBUG_LOG.md](./DEBUG_LOG.md) — incidents, verifications, env/deploy friction (symptom → fix).

**Relationship to other docs**

| Doc                                                          | Role                                                           |
| ------------------------------------------------------------ | -------------------------------------------------------------- |
| This log                                                     | Full decision journal with impact                              |
| [ARCHITECTURAL_DOCTRINE.md](./ARCHITECTURAL_DOCTRINE.md) §10 | Locked doctrine summary — link here, don’t duplicate rationale |
| [PROJECT_MEMORY.md](../../PROJECT_MEMORY.md)                 | Current state + pointers — not history                         |
| [WIRING_MAP.md](./WIRING_MAP.md)                             | Topology after each **Wire** step                              |

**When to append**

- End of **Wire** (BUILD_RHYTHM): any decision forced by the slice
- Entrance / product gates Ty confirms
- Infra or stack choices (Supabase host, env, deploy)
- Anything that would change audit answers or visitor behavior if reversed

**Entry format** (newest at top)

```markdown
### YYYY-MM-DD — Short title

- **Decision:**
- **Why:**
- **System / design impact:**
- **Artifacts:** paths, env vars, routes
- **Phase / slice:**
- **Docs updated:**
- **Open follow-ups:** (optional)
```

---

## Log

### 2026-10-12 — Owner continuity accumulates; fit judgments separate evidence from desire

- **Decision:** Keep Ty's durable identity on the signed owner cookie and `owner` memory key rather than the household IP, but make that memory actually cumulative. Every completed exchange now atomically appends a bounded beat containing both sides of the exchange; owner recall carries eight recent beats and survives the visitor decay job. Fit judgments must separate evidence, inference, and unknowns; present work is not treated as the boundary of what Ty may deliberately want next.
- **Why:** The public-release cookie signing correctly invalidated the old forgeable cookie, so Ty's hiring test was stored as a seven-day visitor. A separate defect meant every turn upserted a one-element JSON array, replacing all prior beats. Fit guidance also promoted a narrow description of Ty's current lane into an unsupported personality claim that some categories would bore her.
- **System / design impact:** `ellis_memory_append` serializes writes per memory key, retains 200 owner beats / 40 visitor beats, and is executable only by `service_role`. Stored beats now include compact Ty/visitor and Ellis excerpts. Ellis asks about motivation and missing experience before a negative verdict, recognizes deliberate transitions, and states what would change an assessment.
- **Artifacts:** `20261012132034_accumulate_ellis_memory.sql`, `ipMemory.ts`, `ipMemoryIntegration.ts`, `summarizeExchange.ts`, `assemble.ts`, `systemPrompt.ts`, `philosophy.md`
- **Phase / slice:** Public follow-up — continuity and fit calibration
- **Docs updated:** this log, `DEBUG_LOG.md`, `WIRING_MAP.md`, `supabase/README.md`
- **Open follow-ups:** Ty must unlock once at `/onboarding` on each browser whose old owner cookie predates the signed-cookie release. Do not merge a household-IP visitor row into owner memory automatically; it may contain another household member's conversation.

### 2026-10-10 — Public release gate: signed owner identity and atomic spend reservation

- **Decision:** Treat the owner and onboarding cookies as authenticated bearer credentials, not boolean flags. Both are now purpose-separated HMAC values derived from the onboarding secret. Public chat validates the complete message envelope server-side, binds sessions to the originating visitor and hall, and uses the atomic Supabase usage increment as the final authorization point before an Anthropic call.
- **Why:** A literal cookie value of `1` was forgeable, which exposed owner-only context and bypassed the public spend ceiling. A read-then-increment rate check also allowed concurrent requests to pass against the same remaining balance. Client-only message limits were not an API boundary.
- **System / design impact:** Existing owner cookies are intentionally invalidated; Ty unlocks once again at `/onboarding`. Anonymous callers cannot claim owner status, reuse another visitor's session, submit system-role messages, exceed message/history caps, or race multiple generations past the daily budget.
- **Artifacts:** `src/lib/ellis/owner.ts`, `config.ts`, `validateChatInput.ts`, `/api/ellis/onboarding/unlock`, `/api/ellis/stream`, `ChatPanel.tsx`, `next.config.ts`
- **Phase / slice:** Public release security gate
- **Docs updated:** this log, `DEBUG_LOG.md`, `WIRING_MAP.md`
- **Open follow-ups:** Add Anthropic API credit, then rerun the live streaming smoke test before switching `ELLIS_MODE=public` in production.

### 2026-08-26 — The work (one door, her words)

- **Decision:** One quiet header link — “the work” — opens a centered panel. The panel is Ty’s personal thesis statement, not a project catalog. Ashe, GoE, and Ellis appear in the prose if the argument needs them. Close is talk to Ellis. Sims bridge is not a peer in this chrome. Copy lives in `content/from-ty/the-work.ts` and is placeholder until she writes it. Default hall is still conversation-first.
- **Why:** A reviewer who won’t type still needs to read something she wrote. Four obvious buttons would have been the rooms coming back as modals.
- **System / design impact:** Hall header only. Native `<dialog>`. Ellis’s knowledge shelf is unchanged — this is public first-person, not his third-person notes.
- **Artifacts:** `content/from-ty/the-work.ts`, `src/components/work/TheWork.tsx`, `SiteShell.tsx`, `globals.css`
- **Phase / slice:** Hall polish
- **Docs updated:** this log
- **Open follow-ups:** Thesis statement in her words (replace placeholders). Walkthrough video. One more form of proof. Do not ship filler.

### 2026-08-24 — Privacy and terms that match the code

- **Decision:** Ship `/privacy` and `/terms` as plain-English pages in the hall chrome, linked from the footer. Copy tracks the actual stores: hashed IP (fail-closed salt), seven-day beats, compressed traces after decay, daily usage ledger, persistent body with hashed visitor markers, Anthropic for replies, Vercel logs, operator cookie. Footer now says specifics fade, not that the visit vanishes.
- **Why:** The footer already promised seven-day memory with no policy behind it. Submission-ready means a reviewer can click through and get the same story the code tells. Ashe's legal register (short, true, not HR) is the model; 18+ not 21 because this is a portfolio host, not a companion.
- **System / design impact:** New public routes. Wordmark links home. Contact falls back to the address already published on Ashe if `NEXT_PUBLIC_CONTACT_EMAIL` is empty.
- **Artifacts:** `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `src/components/layout/LegalArticle.tsx`, `Footer.tsx`, `SiteShell.tsx`, `src/lib/site.ts`, `globals.css`
- **Phase / slice:** Submission-ready legal
- **Docs updated:** this log
- **Open follow-ups:** Creative attachments are writing, not chrome.

### 2026-08-24 — Link preview polish

- **Decision:** Metadata, generated OG (1200×630), and a typographic favicon. No font swap tonight. Title template is `%s · Ellis`; the card says "Ask about her work."
- **Why:** Reviewers see the unfurl before they see the hall. Geist stays; type is a longer night.
- **System / design impact:** `metadataBase` is tybuilds.tech so relative OG URLs resolve in production.
- **Artifacts:** `src/app/layout.tsx`, `opengraph-image.tsx`, `icon.tsx`
- **Phase / slice:** Submission-ready polish
- **Docs updated:** this log

### 2026-08-23 — Hall is the site; rooms come out

- **Decision:** Delete the three project rooms and their hall handoff chips. The conversation is the site. Fix the composer: the hall shell used `overflow-hidden`, which clipped the input and made it feel frozen. Rebuild the page as a full-viewport column with the input docked, not a card in a box.
- **Why:** Rooms were Phase A brochure. Fit is discovered in talk now, and the rooms were leftover doors to nowhere useful (private GoE, parked TL, a CRT demo). Luxury here is air and a composer that actually accepts type, not more glass.
- **System / design impact:** Routes `/projects/*` are gone. Ellis is told not to send anyone to a room. Unlock page matches the hall register.
- **Artifacts:** `ChatPanel.tsx`, `SiteShell.tsx`, `Footer.tsx`, `MessageBubble.tsx`, `onboarding/page.tsx`, `globals.css`; deleted room pages, `RoomChrome`, `ProjectCard`, `ProjectHandoff`
- **Phase / slice:** Hall polish
- **Docs updated:** this log
- **Open follow-ups:** CRT demo file still sits in `public/demos/` with no route.

---

### 2026-08-23 — Owner tier: Ty is a cookie, not an IP

- **Decision:** Ty unlocks at `/onboarding` with the existing secret and gets a long-lived `ellis_owner` cookie. Her memory lives on a sentinel key (`owner`) that cannot be produced by hashing an address. Decay skips that key. The spend ceiling does not apply to her. Ellis is told it is her.
- **Why:** The house shares a connection. Exempting an IP hash would hand Pete and the kids her recall. Owner/stranger is a person split, the same shape as Ashe's, not a network split. The seven-day promise stays true for everyone else.
- **System / design impact:** Unlock works in public mode as well as onboarding — the secret is how she is recognized, not a mode flag. No migration: `expires_at` is NOT NULL, so the owner row gets a fifty-year expiry _and_ the cron excludes the key. Gut bonds for her key on `owner`, so they survive a new house IP. Usage for her writes to that same key, so her talk cannot spend the household's daily budget.
- **Artifacts:** `src/lib/ellis/owner.ts`, `src/lib/ellis/owner.test.ts`, stream route, unlock route, `decayIpMemory.ts`, `ipMemory.ts`, `systemPrompt.ts`, `assemble.ts`, `config.ts`
- **Phase / slice:** Owner tier
- **Docs updated:** `.env.example`, `supabase/README.md`, onboarding page copy
- **Open follow-ups:** She has to visit `/onboarding` once on this browser after deploy so the cookie exists.

---

### 2026-08-22 — Philosophy onto the shelf, at input depth

- **Decision:** Ellis gets a full philosophy teach file (`content/about-ty/philosophy.md`) wired into the knowledge shelf, not a one-page brief. ~5,900 words / ~8.5k tokens. Cached system prompt lands around 15k.
- **Why:** Earnest and goe-teach hold texture and the GoE-specific hard line. They do not hold the argument — world vs body, environment as judge, anti-cosplay tests, the pressure reversal, the gap, handicap, how the four surfaces compose. A visitor who can go deep was getting the sentence and then a shrug. Haiku 4.5's window is 200k; the binding limit is use, not capacity. Past ~15k of stance he starts reciting. This is the ceiling that still behaves like a mind that knows something.
- **System / design impact:** `loadShelf` now reads `philosophy.md`. System prompt points at it for work/GoE/Ashe/hall questions and tells him to hold the argument rather than dump it. Cost on the cached prefix is negligible (~1.5¢ first turn, ~0.15¢ after). Still no recipes, paths, thresholds, or anyone else's interior.
- **Artifacts:** `content/about-ty/philosophy.md`, `src/lib/ellis/halls/loadShelf.ts`, `src/lib/ellis/systemPrompt.ts`
- **Phase / slice:** Shelf fill
- **Docs updated:** ARCHITECTURAL_DOCTRINE §3
- **Open follow-ups:** Ty approved 2026-08-23. Auntie of AI removed from philosophy and from `ellis-self.md` so he cannot introduce her that way. Doctrine / onboarding capture still have the old frame as history.

---

### 2026-08-21 — A privacy promise fails closed, or it is not a promise

- **Decision:** A missing or placeholder `ELLIS_IP_HASH_SALT` now **throws in production** instead of falling back to a constant. Outside production it falls back to a salt regenerated each boot. Hashing moved to `src/lib/ellis/memory/hashVisitor.ts`, which imports nothing but `crypto`.
- **Why:** The fallback was `'ellis-default-salt'`, written in the repo. Salting only defends against reversal while the salt is unknown, and IPv4 has ~4.3 billion addresses — enumerable in minutes — so a public salt makes stored hashes equivalent to stored IPs. Ellis tells visitors he keeps no raw addresses, and that claim was resting on an env var nobody had filled in. The precedent was already set by the spend ledger: when the thing that protects a person is unavailable, refuse rather than degrade. The dev fallback rotates deliberately, so a missing salt shows up as visitor recall breaking on restart rather than as nothing at all — the failure mode this codebase keeps getting bitten by is silence, not breakage.
- **System / design impact:** Production chat will not serve until the salt is set in Vercel, which is intended: an outage is recoverable and a de-anonymized visitor log is not. Extraction was forced by testing — `hashVisitorIp` lived beside a module that constructs a Supabase client at import, so the hot-path privacy primitive could not be exercised without a database. Salt rotation invalidates every `ellis_visitor_memory` row and every gut bond keyed by hash; free now only because the new project is empty, and a real cost from here on. Same placeholder bug hit `CRON_SECRET`, whose route rejected an absent token but accepted `<secret>`; it now screens placeholders and compares with `timingSafeEqual`.
- **Artifacts:** `src/lib/ellis/memory/hashVisitor.ts`, `src/lib/ellis/memory/hashVisitor.test.ts` (5 tests), `src/app/api/cron/decay-ip-memory/route.ts`, `.env.example`
- **Phase / slice:** Post-B hardening
- **Docs updated:** DEBUG_LOG, `content/about-ty/facts.json`
- **Open follow-ups:** `ELLIS_IP_HASH_SALT` and `CRON_SECRET` must be set in Vercel production. `memory/ipMemory.ts` still builds its Supabase client at module scope, which is what made the hashing function untestable in the first place.

---

### 2026-08-21 — One body, persisted; delete the interior that never ran

- **Decision:** Ellis gets a **single** persistent body rather than one per session. Pulse, gut, and membrane ported from GoE into `src/lib/ellis/me/body/`, stored in one row (`ellis_body`) shared across every visitor. Bonds inside the gut stay per visitor, keyed by the same salted IP hash as visitor memory. Everything in the imported ME scaffolding that was never called got deleted rather than wired.
- **Why:** The interior was held in a process-local `Map` keyed by a session id the browser carried in React state, so a page refresh produced a new body and a deploy wiped every body at once. Each visitor met an Ellis born the moment they arrived, which is the opposite of what a body is for. Separately, an audit of the ME import found a large fraction of it inert: `shouldEngage` was documented as the gate that lets Ellis decline a conversation and returned `true` on every branch including the one whose comment described returning `false`; `workingMemory` was initialized empty and nothing ever pushed to it, so the assembly branch reading it never ran; `sessionDrift` was never assigned; `validateInteriorNotInWire` was never called and would have flagged a leak whenever Ellis used the word "present". The import predates GoE's body stack by 26 days — Ellis was not a lite version of current GoE, he was a faithful copy of a GoE that no longer exists.
- **System / design impact:** New `me/body/{pulse,gut,membrane,store}.ts`. Gut's event table is deliberately smaller than GoE's: gestures, drinks, ground breaking, and mortality do not exist in a portfolio hall, so those branches were dropped rather than carried as decoration. One event is Ellis-native — `refused`, fired when the spend ceiling turns a visitor away, which raises tension and leaves a hollow in that bond. Decay runs on read against real elapsed hours, since there is no world loop; the only thing that reliably happens is someone arriving. Body load **fails soft** (default body, conversation continues) which is deliberately the opposite of the rate limiter's fail-closed, because a missing interior degrades him but does not make him unsafe. Deleted: `world/hallPhysics.ts` entirely, plus `shouldEngage`, `describePlace`, `updateRelational`, `validateInteriorNotInWire`, `workingMemory`, `sessionDrift`, `openThreads`. Fixed while adjacent: the relational snapshot was written on the first message and never again, freezing Ellis's read of a visitor at hello; it now recomputes each turn with depth and project list merging so they cannot regress.
- **Artifacts:** `src/lib/ellis/me/body/`, `supabase/migrations/20260821000000_ellis_body.sql`, `src/lib/ellis/me/body/body.test.ts`
- **Phase / slice:** Post-B hardening
- **Docs updated:** `supabase/README.md`, `content/about-ty/facts.json`
- **Open follow-ups:** Present-tense ME docs (`ELLIS_ME_BUILD.md`, `WIRING_MAP_ME.md`, `docs/goe/ELLIS_ME_FULL.md`) still describe the session-scoped interior. Dated session records are left alone — they are accurate as history.

---

### 2026-08-21 — First tests, on the organs

- **Decision:** Tests over pulse, gut, and membrane using Node's built-in runner (27 at first; 32 after the salt guard landed later the same day). No test framework beyond `tsx` for TypeScript resolution.
- **Why:** The repo had no automated tests at all, and the organs are the cheapest possible place to start: pure functions with exact claims attached. "Drift accumulates and is never corrected" is either true of the code or it is a sentence in a comment, and only one of those survives a refactor. The load-bearing test asserts that `renderBody` never emits a digit — the membrane's whole job is converting floats to language, so a leaked number is a specific failure with a specific detector.
- **System / design impact:** `npm test`. `tsx` added as a dev dependency only because Node's ESM resolver will not resolve the extensionless imports the source already uses; changing the source's import style would have risked the Next build for a test-only benefit.
- **Artifacts:** `src/lib/ellis/me/body/body.test.ts`, `package.json`
- **Open follow-ups:** Chat pipeline, rate limiter, and shelf loader are still checked by hand.

---

### 2026-08-21 — Ellis moves to his own Supabase project; Anthropic hall removed

- **Decision:** Ellis stops being a guest on the GoE project and takes his own, holding all four tables (`ellis_usage`, `ellis_visitor_memory`, `ellis_global_traces`, `ellis_body`). Separately, the Anthropic hall is deleted — route, component, both content overlays, themed CSS, registry entry, and the chat panel variant.
- **Why:** GoE is a private world build with its own residents and its own retention problems; a public site strangers can reach should not share a database with it, and what began as one borrowed table had grown to four. On the hall: it was built for a fellowship pitch, and once the target became a Claude Corps application a bespoke themed lobby for a single job posting read as overkill.
- **System / design impact:** `NEXT_PUBLIC_SUPABASE_URL` and both keys repointed; these must match Vercel Production or Ellis's memory silently splits across two databases. No data migrated — `main` was serving a stale scaffold until 2026-08-21, so nothing but local testing had ever written to those tables. The hall _mechanism_ survives with an empty registry; adding one later costs an entry plus a markdown file.
- **Artifacts:** `supabase/README.md`, `npm run db:bundle`, `src/lib/ellis/halls/registry.ts`
- **Docs updated:** `supabase/README.md` rewritten from "one table on the GoE project"

---

### 2026-08-19 — Ship 7-day recall honestly; repair the spend ceiling

- **Decision:** Keep the 7-day rolling visitor recall and change the public copy to match it, rather than pulling the feature to preserve the session-only promise. Rate limit fails **closed**.
- **Why:** Every visitor-facing surface claimed session-only memory while the server hashed IPs and stored seven days of episodic beats. A false privacy claim is worse than a stronger memory claim, and this site's argument is presence honesty. Separately, the spend gate had never functioned: `checkRateLimit` queried `visitor_id_hash` (not a column on `ellis_usage`), so it errored and fell through to fail-open, and `recordUsage` inserted three nonexistent columns, so spend was never recorded. There was no ceiling.
- **System / design impact:** Rate limit now keys on `ip_hash` (matching the table and `markReturnVisit`) instead of an IP+UA hash, so changing user agent no longer resets budget. Spend is charged **before** the model call using a conservative estimate that prices the full `max_tokens` allowance. Ledger unreachable → request denied, except in non-production without Supabase configured. Stream route now reads model IDs and budget from `getEllisConfig()` instead of hardcoding `claude-3-5-*`.
- **Artifacts:** `supabase/migrations/20260819000000_ellis_usage_increment.sql` (atomic upsert RPC), `src/lib/ellis/rateLimit/check.ts` (rewritten, adds `estimateCostUsd`), `src/app/api/ellis/stream/route.ts`, `src/app/api/cron/decay-ip-memory/route.ts` (was never a valid App Router path, so decay never ran), `vercel.json` (daily 00:00 UTC cron), `CRON_SECRET` env var. Copy: `Footer.tsx`, `ChatPanel.tsx`, `AnthropicHall.tsx`, `content/ellis-self.md`, `systemPrompt.ts`, `README.md`.
- **Phase / slice:** Phase B.12 honesty pass
- **Docs updated:** README status, this log
- **Open follow-ups:** `about-ty/*` shelf still empty — Ellis does not know Ty. Owner tier (Ty exempt from decay) not built. `loadGlobalTraces` still write-only. Onboarding does not write to the shelf.

---

### 2026-06-11 — `/anthropic` Think · Build · Log (excited hall v1)

- **Decision:** `/anthropic` ships three tabs — **Think** (Ellis chat + Claude-inspired overlay toggle), **Build** (project cards), **Log** (live research + debug logs for tybuilds and GoE snapshots).
- **Why:** Fellows URL must demonstrate think/build/log in one visit — not just chat cosplay.
- **System / design impact:** `src/app/anthropic/page.tsx`; build logs read from `docs/building/` at request time; GoE logs synced to `docs/building/goe/` for deploy; overlay `localStorage`; stream `hall=anthropic` + `content/halls/anthropic.md`.
- **Artifacts:** `AnthropicHall.tsx`, `BuildLogPanel.tsx`, `content/halls/anthropic-opening.md`
- **Phase / slice:** Excited hall / Phase B+
- **Docs updated:** EXCITED_HALLS, WIRING_MAP

---

### 2026-06-10 — Phase B exit (B.4 rhythm gate)

- **Decision:** Phase B complete — Ellis streams in onboarding mode; Phase 0.1 unlocked.
- **Why:** Build/lint/typecheck pass; architecture/security/hygiene audits pass for onboarding scope.
- **System / design impact:** Single SSE path; shelf read-only; rate limits deferred until public flip.
- **Phase / slice:** B.4
- **Docs updated:** BUILD_CHECKLIST, DEBUG_LOG
- **Open follow-ups:** Phase 0.1 Ty ↔ Ellis sessions; Supabase rate limit before public

---

- **Decision:** Single SSE path `POST /api/ellis/stream`; shelf loader; onboarding gate via `/onboarding` + httpOnly cookie; synthesis still manual (Ellis outputs in chat, Ty approves before git writes).
- **Why:** Phase B exit = Ellis can talk to Ty; visitors blocked until unlock; no `_reference/` cheat sheet in prompt.
- **System / design impact:** `src/lib/ellis/*` module; ChatPanel client; Haiku/Sonnet router; session ME lite in memory; public mode 403 if `about-ty` empty; rate limit stub until public flip.
- **Artifacts:** `src/app/api/ellis/stream/route.ts`, `src/components/ellis/ChatPanel.tsx`, `@anthropic-ai/sdk`
- **Phase / slice:** B.1–B.3
- **Docs updated:** WIRING_MAP, BUILD_CHECKLIST
- **Open follow-ups:** Set `ELLIS_ONBOARDING_SECRET` in Vercel; B.4 rhythm gate; wire Supabase rate limit before `public`

---

- **Decision:** Phase A complete — static shell shippable; proceed Phase B (stream + onboarding mode).
- **Why:** Build/lint/typecheck pass; architecture/security/hygiene audits pass for static scope; no API yet is expected.
- **System / design impact:** Visitor can navigate Hall + three project rooms + CRT embed; chat remains placeholder until B.2/B.3.
- **Artifacts:** `src/app/*`, `src/components/*`, `public/demos/basement-crt.html`, `docs/building/WIRING_MAP.md`
- **Phase / slice:** A.4
- **Docs updated:** BUILD_CHECKLIST, WIRING_MAP, PROJECT_MEMORY

---

### 2026-06-10 — Supabase on GoE project (`ellis_usage` only)

- **Decision:** Rate-limit table lives on existing GoE Supabase project (`oubavruicijhxiqrlikr`); no new free Supabase project.
- **Why:** Supabase free tier project cap; Ellis only needs one counter table, not a separate DB.
- **System / design impact:** tybuilds server uses GoE `SUPABASE_SERVICE_ROLE_KEY` but **must only** read/write `ellis_usage`. RLS on, no anon policies. Ellis app never queries GoE ME/workshop tables.
- **Artifacts:** `supabase/migrations/20260610000000_ellis_usage.sql`, `supabase/config.toml`, `supabase/README.md`
- **Phase / slice:** A.1 infra
- **Docs updated:** WIRING_MAP, .env.example, BUILD_CHECKLIST
- **Open follow-ups:** Run `supabase db push` against GoE if not applied yet; rate-limit code in Phase B public mode

---

### 2026-06-10 — Defer `ELLIS_IP_HASH_SALT` until public rate limits

- **Decision:** IP hash salt env var documented but not required during `ELLIS_MODE=onboarding`.
- **Why:** Salt only needed when persisting hashed IPs to `ellis_usage`; Ty-only onboarding has no public rate limit path yet.
- **System / design impact:** Phase B onboarding can ship without salt; required before `ELLIS_MODE=public` when rate limit module writes `ip_hash`.
- **Artifacts:** `.env.example` (commented)
- **Phase / slice:** A.1 / B planning
- **Open follow-ups:** `openssl rand -base64 32` → Vercel + local before public flip

---

### 2026-06-10 — Infra: GitHub, Vercel, env situated

- **Decision:** Repo on GitHub; Vercel preview/prod linked; `.env.local` + Vercel env mirror; `NEXT_PUBLIC_SITE_URL=https://tybuilds.tech`.
- **Why:** Deploy path before Phase B; Anthropic + GoE Supabase keys ready for stream work.
- **System / design impact:** Preview URLs work; build reads `.env.local`; production secrets not in git.
- **Phase / slice:** A.1
- **Docs updated:** BUILD_CHECKLIST, PROJECT_MEMORY

---

### 2026-06-10 — Phase A static UI (STYLE tokens + rooms)

- **Decision:** Luminous glass hall shell; dark/light parity; project rooms with room accents; CRT via sandboxed iframe from `public/demos/`.
- **Why:** [STYLE.md](./STYLE.md) locked — conversation not brochure; hall neutral-luxury, rooms own accent; CRT retro stays inside room.
- **System / design impact:** `/` = ChatPanelShell (static); `/projects/*` = RoomChrome; theme via `data-theme` + localStorage; footer always discloses AI + session-only memory.
- **Artifacts:** `src/app/globals.css`, `src/components/layout/*`, `src/components/hall/*`, `src/lib/site.ts`
- **Phase / slice:** A.3

---

### 2026-06-10 — Phase A scaffold (`tybuilds` package)

- **Decision:** Next.js 16 App Router, React 19, Tailwind 4, `src/app`, Turbopack dev, package name `tybuilds`.
- **Why:** Matches handoff stack; `Ellis` directory name invalid for npm package on `create-next-app .`.
- **System / design impact:** Standard Next deploy on Vercel; `@/*` path alias; ESLint 9 flat config + Prettier.
- **Artifacts:** `package.json`, `eslint.config.mjs`, `.prettierrc`
- **Phase / slice:** A.1

---

### 2026-06-11 — Ellis earns Ty (blank shelf at boot)

- **Decision:** At boot Ellis loads `content/ellis-self.md` only; `content/about-ty/*` empty until Ellis interviews Ty and Ty approves synthesis. Wren/dev does not pre-fill Ty knowledge.
- **Why:** Host must not invent resume; onboarding is a product event; `docs/reference/*` is Ty QA only — never prompt-injected.
- **System / design impact:** Phase B onboarding mode; synthesis path writes `about-ty/`; public mode blocked until Ty approves. Stream prompt assembly excludes `docs/reference/`.
- **Artifacts:** `content/about-ty/*`, [ELLIS_ONBOARDING_BUILD.md](./ELLIS_ONBOARDING_BUILD.md)
- **Phase / slice:** 0.2 entrance
- **Docs updated:** ARCHITECTURAL_DOCTRINE, BUILD_CHECKLIST

---

### 2026-06-11 — Excited halls registry (generic default)

- **Decision:** `/` = generic hall for all non-excited applications; `/anthropic`, `/huggingface`, … only when on [EXCITED_HALLS.md](../reference/EXCITED_HALLS.md) registry.
- **Why:** Most resume URLs stay company-neutral; enthusiasm is rare and earned per company.
- **System / design impact:** Route-scoped hall overlay (`content/halls/{slug}.md`); allowlist in stream API `hall` param (Phase B).
- **Phase / slice:** Product / ME build
- **Docs updated:** EXCITED_HALLS, APPLICATIONS, WIRING_MAP

---

### 2026-06-11 — Ellis ME-lite + experience constraints

- **Decision:** Session-scoped interior + hall physics lite; 7-day IP visitor memory (Phase B+); ~$1/day/IP budget with Ellis warnings at 50%/80%; topic scope = Ty's work only; Haiku default, Sonnet when Ty's work in depth.
- **Why:** GoE-res witness without cross-visit lie; bill protection; honest scope; cost control.
- **System / design impact:** `src/lib/ellis/me/*`, `rateLimit/*`, `session/*` (Phase B); `ellis_usage` + future visitor memory tables on GoE DB; model router server-side.
- **Artifacts:** [ELLIS_ME_BUILD.md](./ELLIS_ME_BUILD.md), [ELLIS_EXPERIENCE.md](./ELLIS_EXPERIENCE.md)
- **Phase / slice:** Planning → B

---

### 2026-06-11 — Style + product bar locked

- **Decision:** Luminous glass, Rodeo-register luxury, equal dark/light, impressed-even-on-no; single hall (no Personal/Business toggle); typographic Ellis before avatar art.
- **Why:** Ty entrance session; Apple / STYLE_MASTER bar.
- **System / design impact:** CSS semantic tokens; no global CRT noise; project cards in chat flow not hero grid.
- **Docs updated:** STYLE.md, ENTRANCE_CRITERIA

---

### 2026-06-11 — GoE disclosure + philosophy

- **Decision:** Moderate tease sentence locked; no secret sauce / step-by-step build recipes; philosophy = Ty builds inhabited systems, Ellis is front door; Auntie of AI framing optional after onboarding.
- **Why:** Public witness without leaking private GoE; honest fit including no.
- **System / design impact:** `/projects/goe` tease page; system prompt hard line; Ellis refuses depth beyond approved shelf.
- **Docs updated:** ARCHITECTURAL_DOCTRINE §0, §6

---

### 2026-06-09 — Host model + stack honesty

- **Decision:** Ellis third-person host; session-only visitor memory (v1); Supabase for rate limits only; build rhythm gates (arch/security/hygiene per slice).
- **Why:** hire-me §9; no fake continuity; stack honesty.
- **System / design impact:** Footer disclosure; no visitor auth; ME state TTL not cross-visit merge.
- **Docs updated:** ENTRANCE_CRITERIA, BUILD_RHYTHM, SECURITY_CHECKLIST

---

## Open questions (research backlog)

| Question                                                         | Blocks                                             | Owner |
| ---------------------------------------------------------------- | -------------------------------------------------- | ----- |
| Site wordmark — `tybuilds` vs `Ellis Hall`                       | Polish / OG                                        | Ty    |
| Contact email final                                              | Footer mailto                                      | Ty    |
| All five migrations applied on Ellis's own project?              | Public rate limits, spend ledger, body persistence | Ty    |
| Present-tense ME docs still describe the session-scoped interior | Doc accuracy                                       | Wren  |
| Illustrated Ellis avatar                                         | Deferred                                           | Ty    |

---

## Superseded

| Date       | Was                                         | Superseded by                                                                                                    |
| ---------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 2026-06-09 | Wren pre-fills `ty-earnest` before scaffold | **Ellis earns Ty** (2026-06-11)                                                                                  |
| 2026-06-09 | Dedicated Supabase project for Ellis        | **GoE project `ellis_usage`** (2026-06-10)                                                                       |
| 2026-06-10 | GoE project `ellis_usage`                   | **Dedicated Supabase project** (2026-08-21) — the 2026-06-09 instinct was right; the borrowed table grew to four |
| 2026-06-11 | Session-scoped interior, one per visitor    | **One persistent body** (2026-08-21)                                                                             |

---

_Append at top of **Log** section. Doctrine §10 stays summary-only — detail lives here._
