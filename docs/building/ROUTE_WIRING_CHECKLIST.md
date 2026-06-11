# Ellis Stream Route — Wiring Checklist

**File:** `src/app/api/ellis/stream/route.ts`

The route already exists and has the right shape. This checklist shows what needs to be imported/updated to use the new ME stack.

---

## Imports to add

```typescript
// Types
import type {
  EllisInterior,
  SessionState,
  AssembleParams,
  InteriorContext,
  RateLimitCheck,
  HallConfig,
} from '@/lib/ellis/types';

// ME systems
import { createInitialState, updateState, assessContactQuality, shouldEngage } from '@/lib/ellis/me/state';
import { createTrace, extractTracesFromResponse, createRelationalSnapshot, updateRelational } from '@/lib/ellis/me/traces';
import { assembleEllisInterior, formatEllisInteriorForModel, validateInteriorNotInWire } from '@/lib/ellis/me/assemble';

// Session
import { createSession, getSession, updateSession } from '@/lib/ellis/session/store';

// Halls
import { loadKnowledgeShelf, validateShelf, formatShelfForPrompt } from '@/lib/ellis/halls/loadShelf';
import { isValidHall, getHallInfo } from '@/lib/ellis/halls/registry';

// Routing
import { routeModel, explainRouting } from '@/lib/ellis/routeModel';

// Rate limit
import { checkRateLimit, recordUsage } from '@/lib/ellis/rateLimit/check';

// System prompt
import { buildSystemPrompt } from '@/lib/ellis/systemPrompt';

// Stream (if created)
import { handleEllisStream } from '@/lib/ellis/stream';
```

---

## Validation layer

```typescript
export async function POST(request: Request) {
  // 1. Config
  const config = getEllisConfig();

  // 2. Auth (onboarding mode only)
  const cookieStore = await cookies();
  if (config.mode === 'onboarding' && !isOnboardingChatAllowed(config, cookieStore)) {
    return NextResponse.json({ error: 'Onboarding requires unlock' }, { status: 401 });
  }

  // 3. Public mode gate (about-ty must be approved)
  if (config.mode === 'public') {
    const shelf = await loadKnowledgeShelf();
    if (!shelf.aboutTy.earnest || !shelf.aboutTy.facts) {
      return NextResponse.json(
        { error: 'Public mode blocked until Ty approves about-ty' },
        { status: 403 }
      );
    }
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const input = body as { messages?: unknown; sessionId?: string; hall?: string };

  // Validate input
  const validated = validateStreamInput(input, config);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: validated.status });
  }

  // ... (continue below)
}
```

---

## Core pipeline

```typescript
// 1. Validate hall
const hall = (input.hall as string | undefined) || 'default';
if (!isValidHall(hall)) {
  return NextResponse.json({ error: 'Invalid hall' }, { status: 400 });
}

// 2. Extract visitor ID (IP hash)
const ip = request.headers.get('x-forwarded-for') || 'unknown';
const ua = request.headers.get('user-agent') || 'unknown';
const visitorIdHash = crypto.createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 12);

// 3. Get or create session
let session = (input.sessionId as string | undefined)
  ? getSession(input.sessionId)
  : null;

if (!session) {
  session = createSession(
    `session-${Date.now()}-${Math.random()}`,
    visitorIdHash,
    hall
  );
}

// 4. Rate limit check
const rateLimitStatus = await checkRateLimit(visitorIdHash);
if (!rateLimitStatus.allowed) {
  return NextResponse.json(
    { error: `Rate limit: ${rateLimitStatus.reason}` },
    { status: 429 }
  );
}

// 5. Load knowledge shelf
const shelf = await loadKnowledgeShelf(hall);
if (!validateShelf(shelf)) {
  return NextResponse.json(
    { error: 'Shelf validation failed' },
    { status: 500 }
  );
}

// 6. Assemble interior
const lastUserMessage = validated.messages[validated.messages.length - 1]?.content || '';
const interiorContext = assembleEllisInterior({
  interior: session.interior,
  userMessage: lastUserMessage,
  hallContext: shelf.hallOverlay,
});

// 7. Route model
const model = routeModel(
  {
    messages: validated.messages,
    hall,
    sessionDepth: session.interior.relational.depthReached,
    isFirstMessage: session.messageCount === 0,
  },
  session.modelsSeen
);

// 8. Build system prompt
const systemPrompt = buildSystemPrompt(shelf, hall);

// 9. Prepare messages (interior context injected pre-Anthropic)
const allMessages = [
  ...validated.messages,
  {
    role: 'user' as const,
    content: `[Ellis interior:\n${formatEllisInteriorForModel(interiorContext)}]\n\nVisitor: ${lastUserMessage}`,
  },
];

// 10. Stream from Anthropic
const modelId = model === 'sonnet'
  ? 'claude-3-5-sonnet-20241022'
  : 'claude-3-5-haiku-20241022';

const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

const stream = await anthropic.messages.stream({
  model: modelId,
  max_tokens: 1024,
  system: systemPrompt,
  messages: allMessages,
});

// Estimate cost
const costUsd = model === 'sonnet' ? 0.015 : 0.005;

// Record usage (fire and forget)
recordUsage(visitorIdHash, model, costUsd, rateLimitStatus.warned || false);

// ... (return SSE stream, then update session)
```

---

## SSE response

```typescript
const encoder = new TextEncoder();
const sseStream = new ReadableStream({
  async start(controller) {
    // Send metadata
    controller.enqueue(
      encoder.encode(
        `data: ${JSON.stringify({
          type: 'session',
          sessionId: session.id,
          hall,
          model,
          cost: costUsd,
        })}\n\n`
      )
    );

    let fullResponse = '';

    // Stream tokens
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const text = event.delta.text;
        fullResponse += text;

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'token',
              text,
            })}\n\n`
          )
        );
      }
    }

    // After stream completes: validate, update session
    const isValid = validateInteriorNotInWire(fullResponse, session.interior);
    if (!isValid) {
      console.error('[SECURITY] Interior may have leaked');
      // Purge response? Return error? Decide based on risk tolerance.
    }

    // Update session with this turn
    const newSession = updateSession(
      session.id,
      lastUserMessage,
      fullResponse,
      model,
      costUsd
    );

    if (newSession) {
      session = newSession;
    }

    controller.enqueue(
      encoder.encode(
        `data: ${JSON.stringify({
          type: 'done',
          sessionId: session.id,
          messageCount: session.messageCount,
        })}\n\n`
      )
    );

    controller.close();
  },
});

return new Response(sseStream, {
  headers: {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  },
});
```

---

## Error handling

```typescript
try {
  // ... pipeline ...
} catch (err) {
  console.error('[ELLIS_STREAM]', err);

  if (err instanceof Error) {
    if (err.message.includes('Rate limit')) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    if (err.message.includes('Invalid hall')) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err.message.includes('validation')) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }

  return NextResponse.json(
    { error: 'Stream failed' },
    { status: 500 }
  );
}
```

---

## Checklist

- [ ] Import all ME types + functions
- [ ] Add session ID generation + retrieval
- [ ] Add visitor ID hashing (IP + UA → sha256)
- [ ] Add hall allowlist validation
- [ ] Add rate limit check (before Anthropic)
- [ ] Add shelf loading + validation
- [ ] Add interior assembly
- [ ] Add model routing
- [ ] Add system prompt building
- [ ] Add interior context injection into messages
- [ ] Add Anthropic client SSE streaming
- [ ] Add interior validation (check for leaks)
- [ ] Add session update after stream
- [ ] Add usage recording (fire and forget)
- [ ] Test: interior never on SSE payload
- [ ] Test: session dies after 24h
- [ ] Test: rate limit enforces hard stop
- [ ] Test: model routing switches on signals

---

_Route wiring → Ellis has bones → Ready for onboarding._
