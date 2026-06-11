# Phase B Clean Break — Rebuild the Route

**Decision:** Option A — Delete old code, rebuild route cleanly with new structure  
**Ethos:** Like a broken wrist: set it right, let it heal properly, not wrap it crooked  
**Timeline:** Phase B.3–B.10 (6–8 hours careful integration)

---

## What gets deleted

```
❌ src/lib/ellis/session/sessionStore.ts          (old flat structure)
❌ src/lib/ellis/me/updateState.ts                (old mutation pattern)
❌ src/lib/ellis/me/assembleInterior.ts           (old assembly)
❌ src/lib/ellis/me/sessionStore.ts (if exists)   (duplicate)
```

These are the broken bone. We're not wrapping them; we're replacing them.

---

## What gets kept (new, clean)

```
✅ src/lib/ellis/session/store.ts                 (nested, clean)
✅ src/lib/ellis/me/state.ts                      (perception + shifts)
✅ src/lib/ellis/me/traces.ts                     (trace handling)
✅ src/lib/ellis/me/assemble.ts                   (sensory-aware assembly)
✅ src/lib/ellis/world/hallPhysics.ts             (contact events)
✅ src/lib/ellis/types.ts                         (with sensory types)
```

This is the healed bone. New structure, one truth.

---

## What the route needs vs. what we provide

### Old route imports (don't exist in new structure)

```typescript
// ❌ These don't exist:
import { isAllowedHall, normalizeHall } from './halls/registry';
import { pickModel } from './routeModel';
import { streamEllisReply } from './stream';
import { applyContactEvent } from './world/hallPhysics';
```

### New functions available

```typescript
// ✅ These do exist:
import { isValidHall, getHallInfo } from './halls/registry';
import { routeModel, explainRouting } from './routeModel';
import { handleEllisStream } from './stream';
import { onContactStarted, onContactEnded } from './world/hallPhysics';
```

### Mismatch resolution

| Old route | New structure | Change |
|-----------|---------------|--------|
| `isAllowedHall('slug')` | `isValidHall('slug')` | Rename |
| `normalizeHall(input)` | Hall comes directly from allowlist | Remove normalization (not needed) |
| `pickModel(messages, session)` | `routeModel(context, models)` | Different signature; requires context dict |
| `streamEllisReply({...})` | `handleEllisStream(req)` or manual Anthropic client | Different abstraction; need to wire Anthropic call in route |
| `applyContactEvent(...)` | `onContactStarted()` / `onContactEnded()` | Event firing, not applying |

---

## Phase B.3–B.10: The rebuild steps

### Step 1: Delete old code (30 min)

```bash
rm src/lib/ellis/session/sessionStore.ts
rm src/lib/ellis/me/updateState.ts
rm src/lib/ellis/me/assembleInterior.ts
# Any other old duplicates
```

No comments, no "keeping just in case." Git has the history.

### Step 2: Rewrite route imports (15 min)

```typescript
// src/app/api/ellis/stream/route.ts (new imports only)

import type { SessionState } from '@/lib/ellis/types';
import { createSession, getSession, updateSession } from '@/lib/ellis/session/store';
import { loadKnowledgeShelf, validateShelf, formatShelfForPrompt } from '@/lib/ellis/halls/loadShelf';
import { isValidHall } from '@/lib/ellis/halls/registry';
import { routeModel } from '@/lib/ellis/routeModel';
import { buildSystemPrompt } from '@/lib/ellis/systemPrompt';
import { assembleEllisInterior, formatEllisInteriorForModel } from '@/lib/ellis/me/assemble';
import { checkRateLimit, recordUsage } from '@/lib/ellis/rateLimit/check';
import { onContactStarted, onContactEnded } from '@/lib/ellis/world/hallPhysics';

import Anthropic from '@anthropic-ai/sdk';
```

### Step 3: Rewrite route POST handler (2–3 hours)

Replace the entire POST body with clean structure:

```typescript
export async function POST(request: Request) {
  try {
    // 1. Parse + validate
    const body = await request.json();
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // 2. Hall validation
    const hall = body.hall || 'default';
    if (!isValidHall(hall)) {
      return NextResponse.json({ error: 'Invalid hall' }, { status: 400 });
    }

    // 3. Session (create or retrieve)
    const ip = request.headers.get('x-forwarded-for') || '';
    const ua = request.headers.get('user-agent') || '';
    const visitorId = hashVisitorId(ip, ua); // helper function

    let session = body.sessionId ? getSession(body.sessionId) : null;
    if (!session) {
      session = createSession(`session-${Date.now()}`, visitorId, hall);
      
      // First message = contact event
      const userMsg = body.messages[body.messages.length - 1]?.content || '';
      const quality = assessContactQuality(userMsg, [], true); // from state.ts
      onContactStarted(session, userMsg, quality);
    }

    // 4. Rate limit
    const rateLimitStatus = await checkRateLimit(visitorId);
    if (!rateLimitStatus.allowed) {
      return NextResponse.json(
        { error: `Rate limit: ${rateLimitStatus.reason}` },
        { status: 429 }
      );
    }

    // 5. Load shelf + validate
    const shelf = await loadKnowledgeShelf(hall);
    if (!validateShelf(shelf)) {
      return NextResponse.json(
        { error: 'Knowledge shelf error' },
        { status: 500 }
      );
    }

    // 6. Assemble interior
    const lastMsg = body.messages[body.messages.length - 1]?.content || '';
    const interiorContext = assembleEllisInterior({
      interior: session.interior,
      userMessage: lastMsg,
      hallContext: shelf.hallOverlay,
    });

    // 7. Route model
    const model = routeModel(
      {
        messages: body.messages,
        hall,
        sessionDepth: session.interior.relational.depthReached,
        isFirstMessage: session.messageCount === 0,
      },
      session.modelsSeen
    );

    // 8. Build prompt
    const systemPrompt = buildSystemPrompt(shelf, hall);

    // 9. Prepare messages (interior injected)
    const allMessages = [
      ...body.messages,
      {
        role: 'user',
        content: `[Ellis interior:\n${formatEllisInteriorForModel(interiorContext)}]\n\nVisitor: ${lastMsg}`,
      },
    ];

    // 10. Stream from Anthropic
    const modelId = model === 'sonnet'
      ? 'claude-3-5-sonnet-20241022'
      : 'claude-3-5-haiku-20241022';

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const stream = await client.messages.stream({
      model: modelId,
      max_tokens: 1024,
      system: systemPrompt,
      messages: allMessages,
    });

    const costUsd = model === 'sonnet' ? 0.015 : 0.005;
    await recordUsage(visitorId, model, costUsd, rateLimitStatus.warned || false);

    // 11. Return SSE stream
    const encoder = new TextEncoder();
    const responseStream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'session',
              sessionId: session.sessionId,
              hall,
              model,
            })}\n\n`
          )
        );

        let fullResponse = '';

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            fullResponse += event.delta.text;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'token',
                  text: event.delta.text,
                })}\n\n`
              )
            );
          }
        }

        // Update session after stream
        const updated = updateSession(
          session.sessionId,
          lastMsg,
          fullResponse,
          model,
          costUsd
        );

        if (updated) {
          session = updated;
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'done',
              sessionId: session.sessionId,
              messageCount: session.messageCount,
            })}\n\n`
          )
        );

        controller.close();
      },
    });

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[ELLIS_STREAM]', err);
    return NextResponse.json(
      { error: 'Stream failed' },
      { status: 500 }
    );
  }
}
```

### Step 4: Add helper functions (30 min)

```typescript
// In route or new helpers file:

import { createHash } from 'crypto';
import { assessContactQuality } from '@/lib/ellis/me/state';

function hashVisitorId(ip: string, ua: string): string {
  const input = `${ip}:${ua}`;
  return createHash('sha256').update(input).digest('hex').slice(0, 12);
}
```

### Step 5: Verify + test (1 hour)

```bash
npm run typecheck        # Should pass (no old imports)
npm run lint             # Should pass
npm run build            # Should pass
npm run dev              # Start local server

# Test:
# 1. /onboarding page loads
# 2. Send message → SSE streams back
# 3. Check session created
# 4. Second message in same session updates interior
# 5. Rate limit table gets entries
# 6. Git shows deleted old files, new route
```

### Step 6: Hygiene check (15 min)

```bash
# Confirm old files are gone
git status | grep "deleted:"

# Confirm no orphans remain
grep -r "updateState\|sessionStore.ts\|assembleInterior" src/

# Run full suite
npm run build && npm run lint && npm run typecheck
```

---

## Commit message

```
Clean break: rebuild Ellis stream route with sensory-aware session structure

- Delete: old sessionStore.ts, updateState.ts, assembleInterior.ts (flat structure)
- New: session/store.ts (nested interior), sensory-aware assembly
- Route: rewrite to wire new session/interior/contact events cleanly
- No patches, no compatibility shims—one truth, one path
- hallPhysics contact events now fire on entry/exit
- Interior assembly includes spatial awareness first
- Typecheck/lint pass; verified SSE streaming works

Ethos: Like a broken wrist—set it right, let it heal. Not wrapping crooked.
```

---

## Files affected

### Deleted
```
src/lib/ellis/session/sessionStore.ts
src/lib/ellis/me/updateState.ts
src/lib/ellis/me/assembleInterior.ts
(+ any other old duplicates)
```

### Rewritten
```
src/app/api/ellis/stream/route.ts
```

### New (already exists, just now integrated)
```
src/lib/ellis/session/store.ts
src/lib/ellis/me/state.ts
src/lib/ellis/me/traces.ts
src/lib/ellis/me/assemble.ts
src/lib/ellis/world/hallPhysics.ts
```

---

## Testing checklist

- [ ] `npm run typecheck` passes (no stray imports)
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Local dev server starts (`npm run dev`)
- [ ] POST /api/ellis/stream accepts messages
- [ ] SSE stream returns session metadata + tokens
- [ ] Session created with interior state (nested)
- [ ] Second message updates interior (contact quality, traces)
- [ ] Rate limit table receives entries
- [ ] Hall allowlist enforced (invalid hall → 400)
- [ ] No orphaned old code in src/
- [ ] Git log shows clean deletion + new route

---

## Why this is worth the work

**Before (patched):**
- Two session structures (confusing)
- Old route trying to call functions that don't exist
- Integration debt carrying forward
- Next dev wonders "why are there two stores?"

**After (clean break):**
- One session structure (nested, sensible)
- Route is the source of truth—no hidden imports
- Sensory layer fully integrated
- Next dev reads route → sees clean pipeline
- No technical debt hiding in shims

This is 2–3 hours now vs. 20 hours of confusion later.

---

_Like a broken wrist. Set it right. No shortcuts._
