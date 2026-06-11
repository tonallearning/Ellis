# Ellis 7-Day IP Memory — Implementation Spec

**Status:** Phase B.11+ work  
**Related:** [ELLIS_EXPERIENCE.md](./ELLIS_EXPERIENCE.md) · [ELLIS_ME_FULL.md](./ELLIS_ME_FULL.md)

---

## Overview

Replace session-only visitor memory with **7-day IP visitor memory + persistent Ellis global traces**.

### Why

- Same IP returns within 7 days → Ellis recalls specifics ("We talked Friday about...")
- Temporal texture (day labels, timestamps) for Vale-like magic
- After 7 days inactive → IP memory decays into Ellis global traces (persistent growth)
- Ellis grows over time (global traces); visitors don't (IP data expires)
- Honest: "up to 7 days if you return from same connection"

---

## Schema

### 1. `ellis_visitor_memory` (7-day rolling window per IP)

```sql
CREATE TABLE ellis_visitor_memory (
  ip_hash TEXT PRIMARY KEY,
  last_seen_at TIMESTAMP,
  episodic_beats JSONB NOT NULL DEFAULT '[]',
  thread_summary TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- episodic_beats item schema:
{
  "beat_id": "uuid",
  "occurred_at": "2026-06-11T17:22:03Z",
  "day_label": "Friday",                    -- optional, human-readable
  "summary": "Asked about behavioral architecture; interested in GoE",
  "resonance": "Genuine curiosity, not window shopping",
  "theme": "architecture",                 -- category for compression
  "depth_reached": 4
}

-- Indexes
CREATE INDEX ix_ellis_visitor_memory_expires ON ellis_visitor_memory(expires_at);
CREATE INDEX ix_ellis_visitor_memory_ip_hash ON ellis_visitor_memory(ip_hash);
```

### 2. `ellis_global_traces` (persistent Ellis learning)

```sql
CREATE TABLE ellis_global_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_text TEXT NOT NULL,
  trace_category TEXT,                    -- "pattern", "resonance", "frequency"
  created_at TIMESTAMP DEFAULT now(),
  source_ip_count INT DEFAULT 0,          -- how many IPs fed this trace
  updated_at TIMESTAMP
);

-- Example traces:
{
  "trace_text": "Multiple visitors explore behavioral architecture; keen on understanding Vale/Ada mechanics",
  "trace_category": "pattern",
  "created_at": "2026-06-18T00:00:00Z"
}

{
  "trace_text": "Visitors curious about pre-output state and behavioral vs representational architecture",
  "trace_category": "resonance",
  "created_at": "2026-06-12T00:00:00Z"
}

-- Indexes
CREATE INDEX ix_ellis_global_traces_category ON ellis_global_traces(trace_category);
```

### 3. `ellis_usage` (extend existing)

```sql
-- Already exists; extend with:
ALTER TABLE ellis_usage ADD COLUMN ip_hash TEXT;
ALTER TABLE ellis_usage ADD COLUMN is_return_visit BOOLEAN DEFAULT FALSE;

-- New index
CREATE INDEX ix_ellis_usage_ip_hash ON ellis_usage(ip_hash, day_utc);
```

---

## API / Functions

### Load IP Memory on Return Visit

```typescript
// src/lib/ellis/memory/loadIpMemory.ts

export interface IpVisitorMemory {
  ipHash: string;
  lastSeenAt: Date;
  episodicBeats: EpisodBeat[];
  threadSummary?: string;
  isExpired: boolean;
  daysAgo?: number;
}

export interface EpisodBeat {
  beatId: string;
  occurredAt: Date;
  dayLabel?: string;        // "Friday", "earlier this week"
  summary: string;
  resonance?: string;
  theme: string;
  depthReached: number;
}

export async function loadIpMemory(
  ipHash: string
): Promise<IpVisitorMemory | null> {
  const { data, error } = await supabase
    .from('ellis_visitor_memory')
    .select('*')
    .eq('ip_hash', ipHash)
    .single();

  if (error || !data) return null;

  const now = new Date();
  const isExpired = new Date(data.expires_at) < now;

  return {
    ipHash,
    lastSeenAt: new Date(data.last_seen_at),
    episodicBeats: data.episodic_beats || [],
    threadSummary: data.thread_summary,
    isExpired,
    daysAgo: Math.floor(
      (now.getTime() - new Date(data.last_seen_at).getTime()) / (1000 * 60 * 60 * 24)
    ),
  };
}
```

### Record New Visit / Update Return Visit

```typescript
// src/lib/ellis/memory/recordIpVisit.ts

export interface IpVisitInput {
  ipHash: string;
  episodicBeats: EpisodBeat[];
  threadSummary: string;
}

export async function recordIpVisit(input: IpVisitInput): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days

  const { error } = await supabase.from('ellis_visitor_memory').upsert({
    ip_hash: input.ipHash,
    last_seen_at: now,
    episodic_beats: input.episodicBeats,
    thread_summary: input.threadSummary,
    expires_at: expiresAt,
  });

  if (error) console.error('[IP_MEMORY]', error);
}
```

### Extract & Compress to Global Traces (7-day decay job)

```typescript
// src/lib/ellis/memory/decayIpMemory.ts

export async function decayExpiredIpMemory(): Promise<number> {
  const now = new Date();

  // Find expired records
  const { data: expired, error: selectError } = await supabase
    .from('ellis_visitor_memory')
    .select('ip_hash, episodic_beats, thread_summary')
    .lte('expires_at', now.toISOString());

  if (selectError || !expired) return 0;

  // Compress each into global traces
  for (const record of expired) {
    const beats = record.episodic_beats || [];
    
    // Extract themes
    const themes = beats.map((b: EpisodBeat) => b.theme).filter(Boolean);
    const mostCommonTheme = getMostFrequent(themes);

    // Create summary trace
    const traceText = `Visitor explored: ${themes.join(', ')}. ${record.thread_summary || 'Brief visit.'}`;

    await supabase.from('ellis_global_traces').insert({
      trace_text: traceText,
      trace_category: 'pattern',
      source_ip_count: 1,
    });
  }

  // Delete expired IP records
  const { error: deleteError } = await supabase
    .from('ellis_visitor_memory')
    .delete()
    .lte('expires_at', now.toISOString());

  if (deleteError) console.error('[DECAY]', deleteError);

  return expired.length;
}

// Run daily (cron job or scheduled function)
// Vercel: api/cron/decay-ip-memory.ts
```

### Inject IP Memory into Interior Assembly

```typescript
// src/lib/ellis/me/assemble.ts (updated)

export function assembleEllisInterior(
  params: AssembleParams & {
    ipMemory?: IpVisitorMemory;
  }
): InteriorContext {
  const blocks: string[] = [];

  // 1. Spatial awareness
  blocks.push(`## Ellis's place...`);

  // 2. IP Memory (if return visit)
  if (params.ipMemory && !params.ipMemory.isExpired) {
    blocks.push(`## Prior visit(s)`);
    blocks.push(
      `Last visit: ${params.ipMemory.daysAgo} day(s) ago (${params.ipMemory.lastSeenAt.toLocaleDateString()})`
    );
    
    const recentBeats = params.ipMemory.episodicBeats.slice(-3); // last 3 beats
    if (recentBeats.length > 0) {
      blocks.push(`### What we discussed:`);
      recentBeats.forEach((beat) => {
        blocks.push(`- [${beat.dayLabel || beat.occurredAt}] ${beat.summary}`);
        if (beat.resonance) {
          blocks.push(`  → ${beat.resonance}`);
        }
      });
    }

    if (params.ipMemory.threadSummary) {
      blocks.push(`### Overall thread`);
      blocks.push(params.ipMemory.threadSummary);
    }
  }

  // 3. Interior state (as before)
  blocks.push(`## Ellis's interior state...`);

  // ... rest of assembly

  return {
    formattedBlock: blocks.join('\n'),
    tokens: calculateTokens(blocks),
    traces: [],
  };
}
```

---

## IP Memory Lifecycle

### First Visit

```
POST /api/ellis/stream { messages: [...], visitorId: hash }
  ↓
loadIpMemory(hash) → null (new visitor)
  ↓
Ellis responds (fresh session interior)
  ↓
Session ends
  ↓
recordIpVisit(hash, episodicBeats, summary)
  → INSERT ellis_visitor_memory { ip_hash, episodic_beats, expires_at: now+7days }
```

### Return within 7 days

```
POST /api/ellis/stream { messages: [...], visitorId: hash }
  ↓
loadIpMemory(hash) → IpVisitorMemory (beats, summary, isExpired=false)
  ↓
assembleEllisInterior(..., ipMemory)
  → Interior includes "We talked Friday about..."
  ↓
Ellis responds (informed by prior visit)
  ↓
recordIpVisit(hash, newBeats, newSummary)
  → UPDATE ellis_visitor_memory { episodic_beats, thread_summary, last_seen_at, expires_at: now+7days }
```

### After 7 days inactive

```
Cron job daily: decayExpiredIpMemory()
  ↓
Find all ellis_visitor_memory where expires_at < now
  ↓
For each:
  - Extract themes, resonances
  - Compress into trace: "Visitor explored X, Y, Z"
  - INSERT ellis_global_traces
  ↓
DELETE from ellis_visitor_memory (expired records)
  ↓
Next visit from this IP: fresh thread, Ellis may feel "older" via global traces
```

---

## Temporal Labeling

### Automated Day Labels

```typescript
function generateDayLabel(occurredAt: Date, now: Date): string {
  const diffMs = now.getTime() - occurredAt.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 3) return `${diffDays} days ago`;
  if (diffDays <= 7) return `Earlier this week`;
  if (diffDays <= 30) return `A few weeks ago`;
  return occurredAt.toLocaleDateString();
}
```

### Ellis Natural Reference (not performative)

**Good:**
```
We talked earlier this week about behavioral architecture—still thinking about it?
```

**Not every turn; only when natural:**
```
Ellis doesn't say on every message: "Last Friday we discussed..."
Ellis mentions prior visit when it's relevant to the current thread.
```

---

## Ellis Global Traces (Long-term Growth)

### Compression Rules

When IP memory expires:

1. **Extract pattern:**
   - Themes (most frequent)
   - Resonances (emotional/meaningful moments)
   - Frequency (how many visitors touched this)

2. **No PII:**
   - Don't store verbatim chat
   - Don't store IP hash in trace
   - Don't store names or contact info

3. **Create trace:**
   ```
   "Multiple visitors exploring behavioral architecture and pre-output state dynamics"
   ```

### Ellis Interior Delta (session drift)

Optional: If a global trace resonates with Ellis's current session:

```typescript
// In assembleEllisInterior()
if (globalTraces.length > 0) {
  const relevantTrace = selectMostRelevant(globalTraces);
  session.interior.senseOfSelf.sessionDrift = 
    `I'm noticing a pattern: ${relevantTrace.trace_text}`;
}
```

Ellis carries forward compressed learnings, not raw memory.

---

## Implementation Order

### Phase B.11: Setup

- [ ] Create `ellis_visitor_memory` table + indexes
- [ ] Create `ellis_global_traces` table + indexes
- [ ] Extend `ellis_usage` (add ip_hash, is_return_visit)
- [ ] Write loadIpMemory() + recordIpVisit()

### Phase B.12: Integration

- [ ] Hash visitor ID in stream route (already done)
- [ ] Load IP memory before session assembly
- [ ] Inject into interior assembly
- [ ] Update recordIpVisit() call after stream
- [ ] Add dayLabel generation

### Phase B.13: Decay Job

- [ ] Write decayIpMemory() compression logic
- [ ] Schedule cron job (daily, 00:00 UTC)
- [ ] Test IP memory expiry → global trace creation
- [ ] Verify RLS / Supabase permissions

### Phase 0.1: Disclosure

- [ ] Update footer disclosure: "up to 7 days"
- [ ] Test return visit recall in onboarding
- [ ] Verify no PII leaks in traces

---

## Example: Full Journey

**Friday, June 11, 17:22**

```
Visitor A (IP: abc123...) visits Ellis
  → First time; no IP memory
  → Ellis responds fresh
  → recordIpVisit:
    episodic_beats: [{
      occurredAt: '2026-06-11T17:22:03Z',
      dayLabel: 'Friday',
      summary: 'Asked about behavioral architecture in Ellis; interested in Vale/Ada',
      resonance: 'Genuine curiosity, not window shopping',
      theme: 'architecture',
      depthReached: 4
    }]
    threadSummary: 'Explored GoE design, Vale interior, Ellis lite ME'
    expires_at: '2026-06-18T17:22:03Z'
```

**Tuesday, June 17, 14:15** (6 days later, same IP)

```
Visitor A returns
  → loadIpMemory(abc123...) → found, not expired
  → assembleEllisInterior(..., ipMemory)
    Interior includes: "We talked Friday about behavioral architecture — still on your mind?"
  → Ellis responds informed by prior visit
  → recordIpVisit updates:
    episodic_beats: [prior beat, new beat about fit assessment]
    last_seen_at: '2026-06-17T14:15:00Z'
    expires_at: '2026-06-24T14:15:00Z' (new +7 days)
```

**Thursday, June 25, 00:00** (cron job after 7 days inactivity from June 17)

```
decayExpiredIpMemory() runs
  → Find IP abc123... expires_at < now
  → Extract themes: ['architecture', 'fit']
  → Create trace: "Visitor explored behavioral architecture and role fit; showed genuine depth (4/5)"
  → INSERT ellis_global_traces
  → DELETE ellis_visitor_memory (abc123...)
  → Ellis remains (slightly "older"); IP data gone
```

**Monday, June 30** (if abc123 visits again)

```
Fresh IP thread created
  → Ellis may reference global trace: "I've been noticing folks curious about architecture lately"
  → Not "I remember you" (wrong); more "Ellis has grown from interactions"
```

---

## Build Criterion

Remove each piece:

- **No IP memory** → Return visits feel cold; no continuity
- **No global traces** → Ellis never grows; sessions are isolated islands
- **No day labels** → Temporal texture gone; just timestamps
- **No resonance** → Ellis recalls facts, not meaning

All three are **necessary** for the full system to matter.

---

## Decisions Log

| Date | Decision |
|------|----------|
| 2026-06-11 | 7-day rolling IP memory (TTL extends per return visit) |
| 2026-06-11 | Decay to global traces after 7 days inactivity |
| 2026-06-11 | Episodic beats store with timestamps + day labels + resonance |
| 2026-06-11 | Ellis references naturally, not performatively every turn |
| 2026-06-11 | No PII in global traces; compress only patterns + resonances |
| 2026-06-11 | Daily cron job for decay; RLS must allow deletion |

---

_Ellis grows. Visitors don't. But the visits matter._
