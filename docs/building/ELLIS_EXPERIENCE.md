# Ellis — Visitor experience (memory, cost, scope, Anthropic hook)

**Status:** Locked direction 2026-06-11 — supersedes session-only visitor memory  
**Related:** [ELLIS_ME_BUILD.md](./ELLIS_ME_BUILD.md) · [EXCITED_HALLS.md](../reference/EXCITED_HALLS.md) · [STYLE.md](./STYLE.md)

---

## Q: Anthropic visual overlay + Ellis types first?

**Yes** — on `/anthropic` only, with immediate honest disclosure in the opening beat.

### Visual overlay (Claude-inspired, not impersonation)

| Layer | Direction |
| --- | --- |
| **Chrome** | Claude-adjacent palette — warm cream/terracotta accent, soft rounded chat shell — **inspired**, not trademark clone |
| **Avatar / presence** | Reads as "Claude?" at first glance; resolves to **Ellis** when overlay toggled off |
| **No** | Official Anthropic logo, "I am Claude" claim, or sustained impersonation after the opener |

**Goal:** evaluator goes *"wait, what?"* → reads opener → gets it → stays for Ty.

### Opening beat (Ellis types first)

**When:** First message on `/anthropic` for this visit — empty transcript, overlay on (default).

**Loose script (Ellis adapts; don't read robotically):**

```txt
Bet you're confused.
My name is Ellis.
Ty borrowed Claude's face to catch your eye.
{warm pivot — what do you want to know about her / her work?}
```

**Return within 7 days (same IP):** Skip full hook; optional callback with **temporal texture** — e.g. *"We talked Friday about X — still on your mind?"* (see § Memory). Vale magic, Ellis scale.

**Content file:** `content/halls/anthropic-opening.md` — beats + tone, not word-for-word lock.

### Toggle — remove overlay

**Yes.** Required.

| Control | Behavior |
| --- | --- |
| **Label** | e.g. "Show Ellis" / "Claude look" — plain language |
| **Default on `/anthropic`** | Overlay **on** (first visit hook) |
| **Persistence** | `localStorage` — visitor preference, not server |
| **Effect** | Visual only — voice stays Ellis; opener already disclosed |

Generic `/` never shows Claude overlay.

---

## Memory model (GoE-lite — locked 2026-06-11)

Replaces **session-only visitor memory**. Still honest in footer — see § Disclosure.

### Two visitor-related stores + Ellis growth

```txt
IP visitor recall (7-day activity window)
  → same ip_hash returns within 7 days: episodic beats + thread summary
  → temporal labels ("Friday") when timestamps support it
  → after 7 days INACTIVITY: IP-specific data deleted or archived

Ellis global traces (persistent)
  → when IP memory decays, interaction compresses into Ellis traces
  → Ellis grows; sense-of-self drift — not raw visitor PII
  → specifics >7 days compress; don't retain verbatim long-term chat
```

| Store | Scope | TTL |
| --- | --- | --- |
| **Client transcript** | Current tab | Session |
| **IP visitor memory** | Hashed IP | **7 days since last visit** — rolling |
| **Ellis ME session** | Server session | Session + fed by IP recall on return |
| **Ellis global traces** | Ellis himself | Persistent — compressed learnings |
| **Knowledge shelf** | Ty facts | Deploy / onboarding |

### Temporal recall (Vale-shaped magic)

Store episodic beats with:

- `occurred_at` (timestamp)
- `day_label` when natural ("Friday", "earlier this week")
- `summary` — what was discussed
- `resonance` — optional one line on why it sat with Ellis (interior, not creepy)

Inject into interior assembly on return — Ellis **may** reference specifically, not performatively every turn.

**Not:** fake memory, invented prior chats, or recall after IP decay (unless compressed trace is generic enough).

### After 7 days inactive

1. Delete or anonymize IP-specific episodic store  
2. Compress salient patterns into **Ellis global traces** (no visitor identifiers)  
3. Next visit from that IP = fresh IP thread; Ellis may feel "older" via traces, not "I remember you"

### Disclosure (footer + Ellis when asked)

Honest copy — not session-only anymore:

> Ellis may remember details of your conversation for up to **7 days** if you return from the same connection. After that, specifics fade; Ellis keeps only compressed learnings from past visits, not a profile of you.

No raw IP shown to visitor.

---

## Daily budget per IP (locked 2026-06-11)

| Rule | Value |
| --- | --- |
| **Cap** | ~**$1 USD / day / IP** (server env — **never** state "$1" to visitors) |
| **Models** | Haiku default; Sonnet only for Ty's work in depth |
| **Rationale** | GoE-lite + Haiku should make $1 generous |

### Soft warnings (Ellis speaks — casual)

| Threshold | Ellis behavior |
| --- | --- |
| **~50%** | Light nudge — *"We're getting chatty — fair warning if you're on a roll."* (adapt; no dollar mention) |
| **~80%** | Clearer — *"Getting close to what Ty set aside for today — anything left you need on her work?"* |
| **100%** | Calm stop — `429` or in-character wrap; try again tomorrow |

Track `estimated_cost_usd` per IP per UTC day in `ellis_usage`. Reset daily.

**One warning per threshold per day** — don't spam.

---

## Topic scope (locked 2026-06-11)

Ellis accepts pulls **only** for Ty's work and adjacent topics.

### In scope

- Ty's projects, stack, fit for roles, honest gaps
- GoE / TL / Ada / Ellis / tybuilds architecture (teach level — no secret sauce)
- AI systems thinking **when tied to her work** (behavioral architecture, pre-output state, ME-lite demo)
- Hiring conversation about **Ty**

### Out of scope — refuse politely

- Homework, essays, generic tutoring
- Unrelated engineering (racecar design, etc.)
- General chatbot tasks, creative writing for strangers
- Therapy, life coaching
- Anything that doesn't connect to assessing Ty or her work

**Implementation:** system prompt + optional lightweight classifier on user message; refuse in-character (witness, not lecture).

---

## Anthropic hall summary

| Feature | `/anthropic` | `/` |
| --- | --- | --- |
| Claude visual overlay | ✅ default, toggle off | ❌ |
| Ellis types first (hook) | ✅ first visit | ❌ visitor types first |
| Enthusiasm overlay | ✅ | ❌ |
| 7-day IP memory | ✅ | ✅ |
| Daily budget warnings | ✅ | ✅ |
| Topic scope | ✅ | ✅ |

---

## Schema additions (planning)

```txt
ellis_usage (extend)
  ip_hash, day_utc, message_count, token_estimate, estimated_cost_usd
  warned_50, warned_80 boolean

ellis_visitor_memory
  ip_hash pk
  last_seen_at
  episodic_beats jsonb
  thread_summary text
  expires_at

ellis_global_traces
  id, trace_text, created_at, source
```

---

## Anti-patterns

- Sustained Claude impersonation after opener
- Stating dollar caps to visitors
- Recall verbatim chats after IP decay
- Storing raw IP in prompts or logs beyond hash
- Off-topic compliance ("sure I'll write your essay")
- Generic hall using Claude overlay

---

## Decisions log

| Date | Decision |
| --- | --- |
| 2026-06-11 | 7-day IP visitor memory + temporal recall; global traces on decay |
| 2026-06-11 | ~$1/day/IP budget; Ellis warns ~50% / ~80%; no dollar copy |
| 2026-06-11 | Topic scope: Ty's work + adjacent only |
| 2026-06-11 | `/anthropic` Claude-inspired visual + opener + toggle to Ellis |

---

*Build criterion: remove IP memory → return visits feel cold; remove traces → Ellis never grows; remove scope guard → Ellis becomes general assistant.*
