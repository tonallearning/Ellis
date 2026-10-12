/**
 * Ellis stream API — clean pipeline with sensory-aware session
 * Single path: validate → session → rate limit → shelf → interior → model → prompt → Anthropic → SSE
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import Anthropic from "@anthropic-ai/sdk";

import {
  createSession,
  getSession,
  updateSession,
} from "@/lib/ellis/session/store";
import { loadKnowledgeShelf, validateShelf } from "@/lib/ellis/halls/loadShelf";
import { routeModel } from "@/lib/ellis/routeModel";
import { buildSystemPrompt } from "@/lib/ellis/systemPrompt";
import {
  assembleEllisInterior,
  formatEllisInteriorForModel,
} from "@/lib/ellis/me/assemble";
import {
  checkRateLimit,
  recordUsage,
  estimateCostUsd,
} from "@/lib/ellis/rateLimit/check";
import { getEllisConfig } from "@/lib/ellis/config";
import { assessContactQuality } from "@/lib/ellis/me/state";
import {
  hashVisitorIp,
  buildEpisodBeat,
  extractVisitorIp,
  recordIpVisitAfterStream,
} from "@/lib/ellis/ipMemoryIntegration";
import { loadIpMemory } from "@/lib/ellis/memory/ipMemory";
import {
  loadBody,
  saveBody,
  minutesSinceLastTurn,
} from "@/lib/ellis/me/body/store";
import { applyEvent, type GutEvent } from "@/lib/ellis/me/body/gut";
import { computeInboundGains, renderBody } from "@/lib/ellis/me/body/membrane";
import { computeTempoTarget, tick } from "@/lib/ellis/me/body/pulse";
import { isOwnerCookie, OWNER_MEMORY_KEY } from "@/lib/ellis/owner";
import { validateChatInput } from "@/lib/ellis/validateChatInput";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_OUTPUT_TOKENS = 1024;

/**
 * Hash visitor identity from IP + UA (uses proper salt-based hashing)
 */
function hashVisitorId(ip: string | null, ua: string | null): string {
  const ipHash = hashVisitorIp(ip || "unknown");
  const combined = `${ipHash}:${ua || "unknown"}`;
  return createHash("sha256").update(combined).digest("hex").slice(0, 12);
}

/**
 * SSE formatter
 */
function sse(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
  try {
    const config = getEllisConfig();

    // Step 1: Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Steps 2–3: Validate the entire client-controlled envelope before using it.
    const validated = validateChatInput(body, {
      maxMessageChars: config.maxMessageChars,
      maxHistoryMessages: config.maxHistoryMessages,
    });
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { messages, sessionId, hall } = validated.value;

    // Step 4: Hash visitor ID
    const ip = extractVisitorIp(request.headers);
    const ua = request.headers.get("user-agent");
    const visitorId = hashVisitorId(ip, ua);

    // Step 4.5: Ty is a cookie, not an IP. The house shares a connection.
    const cookieStore = await cookies();
    const isOwner = isOwnerCookie(cookieStore, config.onboardingSecret);
    const ipHash = hashVisitorIp(ip);
    const memoryKey = isOwner ? OWNER_MEMORY_KEY : ipHash;
    const ipMemory = await loadIpMemory(memoryKey);

    // Step 5: Get or create session
    let session = sessionId ? getSession(sessionId) : null;
    if (session && (session.visitorId !== visitorId || session.hall !== hall)) {
      session = null;
    }
    const isFirstMessage = !session;
    const isReturnVisit = ipMemory && !ipMemory.isExpired;

    if (!session) {
      session = createSession(`session-${randomUUID()}`, visitorId, hall);

      const userMsg = messages[messages.length - 1]?.content || "";
      session.interior.state.contactQuality = assessContactQuality(
        userMsg,
        [],
        true,
      );
    }

    if (!session) {
      throw new Error("Session initialization failed");
    }

    // Step 5.5: Load Ellis's body. One row, shared across every visitor; decay
    // to now happens inside the load.
    const ellisBody = await loadBody();
    const quietMinutes = minutesSinceLastTurn(ellisBody);

    // Step 6: Rate limit check. Owner is exempt — she is the one paying.
    const rateLimitStatus = isOwner
      ? {
          allowed: true as const,
          remaining: Number.POSITIVE_INFINITY,
          resetAt: new Date(),
          warned: false,
        }
      : await checkRateLimit(ipHash);
    if (!rateLimitStatus.allowed) {
      // Being unable to answer someone who is still standing there costs him
      // something. Record it before returning.
      ellisBody.gut = applyEvent(
        ellisBody.gut,
        { type: "refused", visitorId: ipHash },
        computeInboundGains(ellisBody.gut),
      );
      await saveBody(ellisBody);

      return NextResponse.json(
        { error: `Rate limit: ${rateLimitStatus.reason}` },
        { status: 429 },
      );
    }

    // Step 6.5: Let the turn land on the body, then advance his sense of time.
    const bodyEvents: GutEvent[] = [];
    if (isFirstMessage) {
      bodyEvents.push(
        isReturnVisit
          ? {
              type: "returned",
              visitorId: memoryKey,
              daysAway: ipMemory?.daysAgo ?? 0,
            }
          : { type: "contact_started", visitorId: memoryKey },
      );
    }
    bodyEvents.push({
      type: "weighed",
      salience:
        session.interior.state.contactQuality === "depth"
          ? "heavy"
          : session.interior.state.contactQuality === "genuine"
            ? "medium"
            : "light",
    });

    for (const event of bodyEvents) {
      ellisBody.gut = applyEvent(
        ellisBody.gut,
        event,
        computeInboundGains(ellisBody.gut),
      );
    }

    ellisBody.pulse = tick(ellisBody.pulse, {
      tempoTarget: computeTempoTarget(ellisBody.gut.arousal, {
        inContact: true,
        bondPull: ellisBody.gut.bonds[memoryKey]?.pull,
        minutesSinceContact: quietMinutes,
      }),
    });

    const bodyBlock = renderBody({
      gut: ellisBody.gut,
      pulse: ellisBody.pulse,
      visitorId: memoryKey,
    });

    await saveBody(ellisBody);

    // Step 7: Load knowledge shelf
    const shelf = await loadKnowledgeShelf(hall);
    if (!validateShelf(shelf)) {
      return NextResponse.json(
        { error: "Knowledge shelf error" },
        { status: 500 },
      );
    }

    // Step 8: Assemble interior context (with optional IP memory)
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const interiorContext = assembleEllisInterior({
      interior: session.interior,
      userMessage: lastUserMessage,
      hallContext: shelf.hallOverlay,
      ipMemory: isReturnVisit ? ipMemory : undefined,
      bodyBlock,
      isOwner,
    });

    // Step 9: Route model
    const model = routeModel(
      {
        messages,
        hall,
        sessionDepth: session.interior.relational.depthReached,
        isFirstMessage,
      },
      session.modelsSeen,
    );

    // Step 10: Build system prompt
    const systemPrompt = buildSystemPrompt(shelf, hall, { isOwner });

    // Step 11: Prepare messages with interior context injected
    const allMessages = [
      ...messages.slice(0, -1),
      {
        role: "user" as const,
        content: `[Ellis interior:\n${formatEllisInteriorForModel(interiorContext)}]\n\nVisitor: ${lastUserMessage}`,
      },
    ];

    // Step 12: Charge the ledger before spending, then call Anthropic
    const modelId = model === "sonnet" ? config.modelSonnet : config.modelHaiku;

    const promptChars =
      systemPrompt.length +
      allMessages.reduce((sum, m) => sum + m.content.length, 0);
    const { costUsd, tokenEstimate } = estimateCostUsd(
      model,
      promptChars,
      MAX_OUTPUT_TOKENS,
    );

    if (!isOwner) {
      // The RPC increment is atomic. Its returned total is the authorization
      // point that closes the gap between concurrent check-then-spend requests.
      const reservedTotal = await recordUsage(
        memoryKey,
        costUsd,
        tokenEstimate,
        rateLimitStatus.warned || false,
      );
      if (reservedTotal === null) {
        return NextResponse.json(
          { error: "Usage ledger unavailable" },
          { status: 503 },
        );
      }
      if (reservedTotal > config.dailyBudgetUsd) {
        return NextResponse.json(
          { error: "Daily usage limit reached" },
          { status: 429 },
        );
      }
    }

    const client = new Anthropic({
      apiKey: config.anthropicApiKey,
    });

    // The shelf is identical on every request, so it is cached rather than
    // re-billed each turn. Interior state and the visitor's words stay outside
    // the cached block, below, where they belong.
    const anthropicStream = await client.messages.stream({
      model: modelId,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: allMessages,
    });

    // Step 13: Return SSE stream
    const encoder = new TextEncoder();

    // Ensure session is not null for closure
    const finalSession = session;

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          // Send metadata
          controller.enqueue(
            encoder.encode(
              sse({
                type: "session",
                sessionId: finalSession.sessionId,
                hall,
                model,
                cost: costUsd,
              }),
            ),
          );

          let fullResponse = "";

          // Stream tokens
          for await (const event of anthropicStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              fullResponse += text;

              controller.enqueue(
                encoder.encode(
                  sse({
                    type: "token",
                    text,
                  }),
                ),
              );
            }
          }

          // Step 14: Update session after stream completes
          const updated = updateSession(
            finalSession.sessionId,
            lastUserMessage,
            fullResponse,
            model,
            costUsd,
          );

          const currentSession = updated || finalSession;

          // Record IP visit (build beat from session + response)
          const beat = buildEpisodBeat(
            currentSession,
            lastUserMessage,
            fullResponse,
            isOwner,
          );
          await recordIpVisitAfterStream(memoryKey, [beat]);

          // Send done event
          controller.enqueue(
            encoder.encode(
              sse({
                type: "done",
                sessionId: currentSession.sessionId,
                messageCount: currentSession.messageCount,
              }),
            ),
          );
        } catch (err) {
          const status =
            err && typeof err === "object" && "status" in err
              ? String(err.status)
              : "unknown";
          console.error(`[ELLIS_UPSTREAM] Stream failed (${status})`);
          controller.enqueue(
            encoder.encode(
              sse({
                type: "error",
                message:
                  "Ellis could not answer right now. Please try again later.",
              }),
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[ELLIS_STREAM]", err);

    if (err instanceof Error) {
      if (err.message.includes("Rate limit")) {
        return NextResponse.json({ error: err.message }, { status: 429 });
      }
      if (err.message.includes("Invalid hall")) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Stream failed" }, { status: 500 });
  }
}
