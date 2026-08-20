# Ellis IP Memory — Implementation Guide

**Status:** Phase B.11 Complete — Ready for integration into stream route  
**Implemented:** 2026-06-11

---

## What's Built

### 1. Supabase Migrations (✅ Ready)

**Files:**
- `supabase/migrations/20260611000000_ellis_visitor_memory.sql` — Creates `ellis_visitor_memory` + `ellis_global_traces` tables + indexes + RLS
- `supabase/migrations/20260611000001_ellis_usage_extend.sql` — Extends `ellis_usage` with `is_return_visit` column

**Run migrations:**
```bash
npx supabase migration up
# Or via Vercel dashboard: Deploy → Migrations
```

### 2. Core API Functions

**File:** `src/lib/ellis/memory/ipMemory.ts`

**Exports:**
- `loadIpMemory(ipHash: string)` — Load visitor memory for return visit checks
- `recordIpVisit(input: IpVisitInput)` — Record/update IP visit at end of stream
- `generateDayLabel(occurredAt, now)` — Human-readable temporal labels ("Friday", "earlier this week")
- `markReturnVisit(ipHash, dayUtc)` — Flag return visits in `ellis_usage` for analytics

**Usage:**
```typescript
// Check for return visit at start of stream
const ipMemory = await loadIpMemory(ipHash);
if (ipMemory && !ipMemory.isExpired) {
  console.log('Return visitor!', ipMemory.daysAgo, 'days ago');
}

// Record session at end of stream
await recordIpVisitAfterStream(ipHash, beats, responseLength);
```

### 3. Decay Job (Cron)

**File:** `src/app/api/cron/decay-ip-memory.ts`

**Function:** `decayExpiredIpMemory()`  
**Purpose:** Convert expired IP memories into Ellis global traces  
**Schedule:** Daily at 00:00 UTC via Vercel cron

**Setup:**
1. Add to `vercel.json` (or `vercel.ts`):
   ```json
   "crons": [
     {
       "path": "/api/cron/decay-ip-memory",
       "schedule": "0 0 * * *"
     }
   ]
   ```

2. Set `CRON_SECRET` in Vercel environment:
   ```bash
   vercel env add CRON_SECRET
   # Generate a random token (e.g., `openssl rand -hex 32`)
   ```

3. Test locally:
   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/decay-ip-memory
   ```

### 4. Memory Integration Module

**File:** `src/lib/ellis/ipMemoryIntegration.ts`

**Exports:**
- `hashVisitorIp(ipString)` — SHA-256 hash of IP + server salt
- `extractVisitorIp(headers)` — Extract client IP from request headers
- `buildEpisodBeat(session, userMessage, ellisResponse)` — Create beat snapshot
- `buildThreadSummary(beats)` — Compress beats into thread summary
- `recordIpVisitAfterStream(ipHash, beats, responseLength)` — Convenience wrapper

**Usage in stream route:**
```typescript
import { 
  hashVisitorIp, 
  extractVisitorIp, 
  buildEpisodBeat,
  recordIpVisitAfterStream 
} from '@/lib/ellis/ipMemoryIntegration';

// In POST /api/ellis/stream:
const ip = extractVisitorIp(req.headers);
const ipHash = hashVisitorIp(ip);
const ipMemory = await loadIpMemory(ipHash);

// ... stream response ...

// At end:
const beat = buildEpisodBeat(session, userMessage, responseText);
await recordIpVisitAfterStream(ipHash, [beat], responseText.length);
```

### 5. Assembly Integration

**File:** `src/lib/ellis/me/assemble.ts` (updated)

**Change:** Added optional `ipMemory` parameter to `assembleEllisInterior()`

**Injection point:** Section 1.5 — "Prior visit(s)"  
If `ipMemory` exists and isn't expired:
- Last visit date (in days)
- Recent episodic beats (last 3)
- Thread summary
- Day labels + resonance

**Example output:**
```
## Prior visit(s)
**Last visit:** 2 day(s) ago (6/9/2026)
**What we discussed:**
- [Friday] Asked about behavioral architecture; interested in Vale/Ada
  → Genuine curiosity, not window shopping
- [Thursday] Explored Ellis lite ME structure
  → Technical depth; interested in implementation

**Overall thread:** Explored architecture, projects. Average engagement depth: 4/5.
```

---

## Environment Setup

Add these to `.env.local` and Vercel:

```bash
# IP hashing salt (prevent IP discovery via rainbow tables)
ELLIS_IP_HASH_SALT=your-random-salt-here

# Cron token
CRON_SECRET=your-random-token-here

# Already set; ensure service role key is available for IP memory ops
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Integration Checklist (Phase B.12)

Before merging, wire into `src/app/api/ellis/stream/route.ts`:

- [ ] Import `hashVisitorIp`, `extractVisitorIp`, `buildEpisodBeat`, `recordIpVisitAfterStream`
- [ ] Import `loadIpMemory` from `@/lib/ellis/memory/ipMemory`
- [ ] At start of POST handler:
  ```typescript
  const ip = extractVisitorIp(req.headers);
  const ipHash = hashVisitorIp(ip);
  const ipMemory = await loadIpMemory(ipHash);
  ```
- [ ] Pass `ipMemory` to `assembleEllisInterior({ ..., ipMemory })`
- [ ] At end of stream (after response):
  ```typescript
  const beat = buildEpisodBeat(session, userMessage, responseText);
  await recordIpVisitAfterStream(ipHash, [beat], responseText.length);
  ```
- [ ] Update `BUILD_CHECKLIST.md` → mark B.12 complete

---

## Data Flow (Full Journey)

```
POST /api/ellis/stream { messages: [...] }
  ↓
1. extractVisitorIp → IP address from headers
2. hashVisitorIp → SHA-256 hash (no raw IP stored)
3. loadIpMemory → Check for unexpired visitor memory
   ├─ First visit: returns null
   └─ Return within 7 days: returns beats + summary + daysAgo
4. createSession / getSession → Start/retrieve Ellis session
5. assembleEllisInterior({ ..., ipMemory }) → Inject prior visit context if present
   ├─ If no IP memory: fresh interior
   └─ If IP memory: interior includes "We talked Friday about..."
6. buildSystemPrompt → System context (including IP memory block)
7. POST to Anthropic → Stream response
8. [Stream receives text]
   ↓
9. buildEpisodBeat → Snapshot this exchange (theme, resonance, depth)
10. recordIpVisitAfterStream → UPSERT ellis_visitor_memory
    ├─ New visitor: INSERT with expires_at = now + 7 days
    └─ Return: UPDATE beats, extend expires_at = now + 7 days
11. markReturnVisit → Flag in ellis_usage for analytics
12. Return SSE response to client

[After 7 days inactivity]
  ↓
Cron (00:00 UTC): decayExpiredIpMemory()
  ├─ SELECT * FROM ellis_visitor_memory WHERE expires_at < now
  ├─ For each: extract themes, resonances → compress to trace
  ├─ INSERT ellis_global_traces
  └─ DELETE ellis_visitor_memory (IP data cleaned up)
```

---

## Security & Privacy

### IP Hashing
- Raw IP never stored
- Salt-based SHA-256 prevents rainbow tables
- Salt: `ELLIS_IP_HASH_SALT` env var (keep secret)

### No PII in Global Traces
- Global traces: patterns only ("explored architecture")
- No verbatim chat, no IP hash, no names/contact info
- Supabase RLS blocks anon/authenticated read/write

### Rate Limiting + Audit
- `ellis_usage` tracks visits per IP + daily cost
- `is_return_visit` flag for analytics
- Decay job logs to console

### Cron Security
- `CRON_SECRET` token prevents unauthorized decay runs
- Vercel cron includes Authorization header automatically
- Falls back to 401 Unauthorized if token missing/wrong

---

## Testing (Phase B.14)

### First Visit Flow
```bash
1. Clear browser cookies / use incognito
2. POST to /api/ellis/stream with new IP
3. Monitor: Supabase ellis_visitor_memory should be empty initially
4. After stream: ellis_visitor_memory row created with beat
5. expires_at should be 7 days from now
```

### Return Visit (within 7 days)
```bash
1. Same IP, visit again
2. loadIpMemory returns prior beats
3. Ellis naturally references "We talked about..."
4. After stream: ellis_visitor_memory beat count increases
5. expires_at extends to now + 7 days
```

### After 7 Days (Decay Job)
```bash
1. Run cron manually:
   curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/decay-ip-memory
2. Monitor: ellis_visitor_memory row should be deleted
3. ellis_global_traces should have new row with compressed trace
4. Next visit from same IP: fresh thread, Ellis may reference global trace
```

---

## Gotchas

### Gotcha 1: ELLIS_IP_HASH_SALT not set
- **Symptom:** All IPs hash to the same value
- **Fix:** Set `ELLIS_IP_HASH_SALT` in `.env.local` and Vercel
- **Bonus:** Different salts per environment prevent cross-environment IP matching

### Gotcha 2: Vercel Cron not triggering
- **Symptom:** `ellis_global_traces` stays empty after 7 days
- **Fix:** 
  1. Verify `vercel.json` includes cron config
  2. Verify `CRON_SECRET` is set in Vercel env
  3. Check Vercel Logs for `/api/cron/decay-ip-memory` calls

### Gotcha 3: CRON_SECRET mismatch
- **Symptom:** 401 Unauthorized when testing cron manually
- **Fix:** Ensure local `CRON_SECRET` matches Vercel env var
- **Test:** `echo $CRON_SECRET` before curl

### Gotcha 4: RLS blocking decay job
- **Symptom:** Decay job runs but ellis_global_traces stays empty
- **Fix:** Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (service role bypasses RLS)
- **Verify:** Check Supabase logs for permission errors

---

## References

- **Spec:** `docs/building/ELLIS_IP_MEMORY_SPEC.md`
- **Tables:** `supabase/migrations/20260611000000_ellis_visitor_memory.sql`
- **Assembly:** `src/lib/ellis/me/assemble.ts` (section 1.5)
- **Route:** `src/app/api/ellis/stream/route.ts` (to be wired Phase B.12)

---

## Next: Phase B.12 Integration

Ready to wire into stream route. See `BUILD_CHECKLIST.md` § B.12 for exact steps.
