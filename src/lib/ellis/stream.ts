/**
 * Ellis stream API — single path, full interior wiring
 * Server-side only; never exposes state to client
 */

import Anthropic from '@anthropic-ai/sdk';
import type { MessageStreamManager } from '@anthropic-ai/sdk/lib/streaming';
import { createHash } from 'crypto';

import type { SessionState } from './types';
import { createSession, getSession, updateSession } from './session/store';
import { assembleEllisInterior, formatEllisInteriorForModel } from './me/assemble';
import { loadKnowledgeShelf, validateShelf } from './halls/loadShelf';
import { buildSystemPrompt } from './systemPrompt';
import { routeModel } from './routeModel';
import { checkRateLimit, recordUsage } from './rateLimit/check';
import { isValidHall } from './halls/registry';

interface StreamRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionId?: string;
  visitorId: string; // IP hash or UA hash
  hall?: 'default' | string;
}

interface StreamResponse {
  sessionId: string;
  stream: MessageStreamManager;
  cost: number;
}

/**
 * Hash visitor identity (IP or UA)
 */
function hashVisitorId(ip: string | undefined, ua: string | undefined): string {
  const input = `${ip || 'unknown'}:${ua || 'unknown'}`;
  return createHash('sha256').update(input).digest('hex').slice(0, 12);
}

/**
 * Main stream handler
 */
export async function streamMessage(
  req: StreamRequest
): Promise<StreamResponse> {
  // 1. Validate hall
  const hall = req.hall || 'default';
  if (!isValidHall(hall)) {
    throw new Error(`Invalid hall: ${hall}`);
  }

  // 2. Get or create session
  let session = req.sessionId ? getSession(req.sessionId) : null;
  if (!session) {
    session = createSession(req.sessionId || `session-${Date.now()}`, req.visitorId, hall);
  }

  // 3. Rate limit check
  const rateLimitStatus = await checkRateLimit(session.visitorId);
  if (!rateLimitStatus.allowed) {
    throw new Error(`Rate limit exceeded: ${rateLimitStatus.reason}`);
  }

  // 4. Load knowledge shelf
  const shelf = loadKnowledgeShelf(hall);
  if (!validateShelf(shelf)) {
    throw new Error('Knowledge shelf validation failed');
  }

  // 5. Assemble interior context
  const lastUserMessage = req.messages[req.messages.length - 1]?.content || '';
  const interiorContext = assembleEllisInterior({
    interior: session.interior,
    userMessage: lastUserMessage,
    hallContext: shelf.hallOverlay,
  });

  // 6. Route model
  const model = routeModel(
    {
      messages: req.messages,
      hall,
      sessionDepth: session.interior.relational.depthReached,
      isFirstMessage: session.messageCount === 0,
    },
    session.modelsSeen
  );

  // 7. Build system prompt
  const systemPrompt = buildSystemPrompt(shelf, hall);

  // 8. Prepare messages for Anthropic
  const allMessages = [
    ...req.messages,
    // Interior context injected before user message
    {
      role: 'user' as const,
      content: `[Interior context for Ellis:\n${formatEllisInteriorForModel(interiorContext)}]\n\nUser message: ${lastUserMessage}`,
    },
  ];

  // 9. Call Anthropic with streaming
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const modelId =
    model === 'sonnet' ? 'claude-3-5-sonnet-20241022' : 'claude-3-5-haiku-20241022';

  const stream = await client.messages.stream({
    model: modelId,
    max_tokens: 1024,
    system: systemPrompt,
    messages: allMessages,
  });

  // Estimate cost (rough)
  const costUsd = model === 'sonnet' ? 0.015 : 0.005;

  // Record usage
  await recordUsage(session.visitorId, model, costUsd, rateLimitStatus.warned || false);

  // 10. Update session (after streaming completes)
  // Note: In real impl, you'd update after stream finishes, not here
  // For now, just mark it's in progress

  return {
    sessionId: session.sessionId,
    stream,
    cost: costUsd,
  };
}

/**
 * Stream handler wrapper for Next.js route
 */
export async function handleEllisStream(req: StreamRequest, ip?: string, ua?: string) {
  const visitorId = req.visitorId || hashVisitorId(ip, ua);

  try {
    const response = await streamMessage({
      ...req,
      visitorId,
    });

    return response;
  } catch (err) {
    console.error('[ELLIS_STREAM] Error:', err);
    throw err;
  }
}
