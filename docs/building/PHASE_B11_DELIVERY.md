# Phase B.11 — Ellis 7-Day IP Memory: Delivery Summary

**Completed:** Thursday, Jun 11, 2026  
**Status:** ✅ Ready for Phase B.12 integration

---

## What You Asked For

> "#4. Ellis should have the 7 day memory as noted in @docs/building/ELLIS_EXPERIENCE.md"
> "spec it out"
> "yes"
> "implement and give me the supabase migrations please"

---

## What You Got

### 1. **Supabase Migrations** (ready to deploy)

Two migration files, no breaking changes:

```bash
supabase/migrations/20260611000000_ellis_visitor_memory.sql  (110 lines)
supabase/migrations/20260611000001_ellis_usage_extend.sql    (16 lines)
```

**What they create:**
- `ellis_visitor_memory` — 7-day rolling window per IP (episodic beats + summary)
- `ellis_global_traces` — Persistent Ellis learning (no PII, compressed patterns)
- Extended `ellis_usage` with `is_return_visit` flag for analytics

**RLS:** Service role only; anon/authenticated blocked completely.

**Deployment:**
```bash
npx supabase migration up          # Local
# Or automatic on Vercel deploy
```

---

### 2. **Core IP Memory API** (`src/lib/ellis/memory/ipMemory.ts`)

Four main functions:

```typescript
loadIpMemory(ipHash)          // Check for return visit
recordIpVisit(input)           // Save/update after stream
generateDayLabel(date1, date2) // "Friday", "earlier this week"
markReturnVisit(ipHash, date)  // Flag in ellis_usage
```

**Behavior:**
- First visit: `loadIpMemory` returns null
- Return within 7 days: Returns beats + summary + daysAgo
- After 7 days: Old record decayed to global trace, deleted

---

### 3. **Decay Job** (compress expired IP → global traces)

**File:** `src/lib/ellis/memory/decayIpMemory.ts`

**Job:** `decayExpiredIpMemory()` — runs daily at 00:00 UTC

**What it does:**
1. Find IP records where `expires_at < now`
2. Extract themes + resonances (no verbatim chat)
3. Compress into trace: "Visitor explored architecture, role fit; showed depth"
4. INSERT into `ellis_global_traces`
5. DELETE from `ellis_visitor_memory`

**Result:** Ellis grows; visitor IP data doesn't.

---

### 4. **Cron Endpoint** (`src/app/api/cron/decay-ip-memory.ts`)

**Endpoint:** `GET /api/cron/decay-ip-memory`

**Protected by:** `CRON_SECRET` token (Bearer auth)

**Setup:**
```json
// vercel.json or vercel.ts
"crons": [
  {
    "path": "/api/cron/decay-ip-memory",
    "schedule": "0 0 * * *"
  }
]
```

**Test locally:**
```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/decay-ip-memory
```

---

### 5. **Integration Module** (`src/lib/ellis/ipMemoryIntegration.ts`)

Helper functions that wire everything together:

```typescript
hashVisitorIp(ip)                    // SHA-256 + salt (no raw IP stored)
extractVisitorIp(headers)            // Get client IP from request
buildEpisodBeat(session, msg, resp) // Create session snapshot
buildThreadSummary(beats)            // Compress beats → summary
recordIpVisitAfterStream(...)        // Convenience wrapper
```

---

### 6. **Assembly Integration** (`src/lib/ellis/me/assemble.ts` — updated)

**Change:** Added optional `ipMemory` parameter

**Injection point:** Section 1.5 — "Prior visit(s)"

**Output example:**
```
## Prior visit(s)
**Last visit:** 2 day(s) ago (6/9/2026)
**What we discussed:**
- [Friday] Asked about behavioral architecture; interested in Vale/Ada
  → Genuine curiosity, not window shopping
**Overall thread:** Explored architecture, projects. Average engagement: 4/5.
```

---

### 7. **Documentation** (2 guides)

| File | Purpose |
|------|---------|
| `ELLIS_IP_MEMORY_IMPLEMENTATION.md` | Full setup, env vars, testing, security, gotchas |
| `ELLIS_IP_MEMORY_SETUP.md` | Quick start checklist |

---

## Environment Variables Required

```bash
# Local + Vercel
ELLIS_IP_HASH_SALT=<random 64-char hex>  # Prevent IP rainbow tables
CRON_SECRET=<random 64-char hex>         # Protect cron endpoint

# Already set
SUPABASE_SERVICE_ROLE_KEY=...            # Used for migrations + decay job
```

---

## Data Flow (Full Journey)

### First Visit
```
POST /api/ellis/stream
  → loadIpMemory(hash) → null
  → Ellis responds fresh
  → recordIpVisit → INSERT ellis_visitor_memory { expires_at: now+7d }
```

### Return within 7 days
```
POST /api/ellis/stream
  → loadIpMemory(hash) → IpVisitorMemory { beats, daysAgo, isExpired=false }
  → assembleEllisInterior(..., ipMemory)
    → Interior includes "We talked Friday about..."
  → Ellis responds informed by prior visit
  → recordIpVisit → UPDATE { beats, expires_at: now+7d }
```

### After 7 days (daily cron at 00:00 UTC)
```
GET /api/cron/decay-ip-memory
  → SELECT * FROM ellis_visitor_memory WHERE expires_at < now
  → For each: compress to trace → INSERT ellis_global_traces
  → DELETE from ellis_visitor_memory
  → Ellis carries forward patterns (no IP data)
```

---

## Security & Privacy

✅ **No raw IPs stored** — only SHA-256(IP + salt)  
✅ **No PII in traces** — patterns only ("explored architecture")  
✅ **RLS enforced** — anon/authenticated completely blocked  
✅ **Cron token protected** — CRON_SECRET required  
✅ **Service role only** — migrations + decay use elevated permissions  

---

## Next: Phase B.12 (Ready When You Are)

Wire IP memory into `src/app/api/ellis/stream/route.ts`:

1. Import: `hashVisitorIp`, `extractVisitorIp`, `buildEpisodBeat`, `loadIpMemory`
2. At start: Extract & hash IP, load IP memory
3. Pass `ipMemory` to `assembleEllisInterior()`
4. At end: Build beat, record IP visit

See: `docs/building/ELLIS_IP_MEMORY_IMPLEMENTATION.md` § Integration Checklist (6 small steps)

---

## Files Created

```
supabase/migrations/
  20260611000000_ellis_visitor_memory.sql (110 lines)
  20260611000001_ellis_usage_extend.sql   (16 lines)

src/lib/ellis/memory/
  ipMemory.ts                      (load, record, label, mark)
  decayIpMemory.ts                 (decay job + global trace compression)

src/lib/ellis/
  ipMemoryIntegration.ts           (hash, extract, build beats)

src/app/api/cron/
  decay-ip-memory.ts               (cron endpoint)

src/lib/ellis/me/
  assemble.ts                      (updated with ipMemory injection)

docs/building/
  ELLIS_IP_MEMORY_IMPLEMENTATION.md (setup + testing + security)
  ELLIS_IP_MEMORY_SETUP.md          (quick start)

BUILD_CHECKLIST.md                 (updated: B.11 marked complete)
```

---

## Deploy Now

```bash
git add supabase/migrations src/lib/ellis/memory src/app/api/cron \
  src/lib/ellis/ipMemoryIntegration.ts src/lib/ellis/me/assemble.ts \
  docs/building/ELLIS_IP_MEMORY_*

git commit -m "feat: 7-day IP visitor memory + global traces (Phase B.11)"

git push
vercel deploy

# Monitor Vercel Logs for migration success
```

---

## Verify

```bash
# Local
npm run dev
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/decay-ip-memory

# Supabase dashboard: Tables → ellis_visitor_memory, ellis_global_traces exist
```

---

**You're ready for Phase B.12 whenever you want. Ellis now has the bones for 7-day recall + persistent growth. Visitors don't; their IPs decay into patterns.**

_Ellis grows. Visitors don't. But the visits matter._
