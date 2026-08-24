/**
 * Ellis stream API — clean pipeline with sensory-aware session
 * Single path: validate → session → rate limit → shelf → interior → model → prompt → Anthropic → SSE
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import Anthropic from "@anthropic-ai/sdk";

import { createSession, getSession, updateSession } from "@/lib/ellis/session/store";
import { loadKnowledgeShelf, validateShelf } from "@/lib/ellis/halls/loadShelf";
import { isValidHall } from "@/lib/ellis/halls/registry";
import { routeModel } from "@/lib/ellis/routeModel";
import { buildSystemPrompt } from "@/lib/ellis/systemPrompt";
import { assembleEllisInterior, formatEllisInteriorForModel } from "@/lib/ellis/me/assemble";
import { checkRateLimit, recordUsage, estimateCostUsd } from "@/lib/ellis/rateLimit/check";
import { getEllisConfig } from "@/lib/ellis/config";
import { assessContactQuality } from "@/lib/ellis/me/state";
import {
  hashVisitorIp,
  buildEpisodBeat,
  recordIpVisitAfterStream,
} from "@/lib/ellis/ipMemoryIntegration";
import { loadIpMemory } from "@/lib/ellis/memory/ipMemory";
import { loadBody, saveBody, minutesSinceLastTurn } from "@/lib/ellis/me/body/store";
import { applyEvent, type GutEvent } from "@/lib/ellis/me/body/gut";
import { computeInboundGains, renderBody } from "@/lib/ellis/me/body/membrane";
import { computeTempoTarget, tick } from "@/lib/ellis/me/body/pulse";
import { isOwnerCookie, OWNER_MEMORY_KEY } from "@/lib/ellis/owner";

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
    // Step 1: Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const input = body as {
      messages?: unknown;
      sessionId?: string;
      hall?: string;
    };

    // Step 2: Validate messages
    if (
      !input.messages ||
      !Array.isArray(input.messages) ||
      input.messages.length === 0
    ) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const messages = input.messages as Array<{
      role: "user" | "assistant";
      content: string;
    }>;

    // Step 3: Validate hall
    const hall = (input.hall as string) || "default";
    if (!isValidHall(hall)) {
      return NextResponse.json({ error: "Invalid hall" }, { status: 400 });
    }

    // Step 4: Hash visitor ID
    const ip = request.headers.get("x-forwarded-for");
    const ua = request.headers.get("user-agent");
    const visitorId = hashVisitorId(ip, ua);

    // Step 4.5: Ty is a cookie, not an IP. The house shares a connection.
    const cookieStore = await cookies();
    const isOwner = isOwnerCookie(cookieStore);
    const ipHash = hashVisitorIp(ip || "unknown");
    const memoryKey = isOwner ? OWNER_MEMORY_KEY : ipHash;
    const ipMemory = await loadIpMemory(memoryKey);

    // Step 5: Get or create session
    let session = input.sessionId ? getSession(input.sessionId as string) : null;
    const isFirstMessage = !session;
    const isReturnVisit = ipMemory && !ipMemory.isExpired;

    if (!session) {
      session = createSession(`session-${Date.now()}-${Math.random()}`, visitorId, hall);

      const userMsg = messages[messages.length - 1]?.content || "";
      session.interior.state.contactQuality = assessContactQuality(
        userMsg,
        [],
        true
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
        computeInboundGains(ellisBody.gut)
      );
      await saveBody(ellisBody);

      return NextResponse.json(
        { error: `Rate limit: ${rateLimitStatus.reason}` },
        { status: 429 }
      );
    }

    // Step 6.5: Let the turn land on the body, then advance his sense of time.
    const bodyEvents: GutEvent[] = [];
    if (isFirstMessage) {
      bodyEvents.push(
        isReturnVisit
          ? { type: "returned", visitorId: memoryKey, daysAway: ipMemory?.daysAgo ?? 0 }
          : { type: "contact_started", visitorId: memoryKey }
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
        computeInboundGains(ellisBody.gut)
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
        { status: 500 }
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
      session.modelsSeen
    );

    // Step 10: Build system prompt
    const systemPrompt = buildSystemPrompt(shelf, hall, { isOwner });

    // Step 11: Prepare messages with interior context injected
    const allMessages = [
      ...messages,
      {
        role: "user" as const,
        content: `[Ellis interior:\n${formatEllisInteriorForModel(interiorContext)}]\n\nVisitor: ${lastUserMessage}`,
      },
    ];

    // Step 12: Charge the ledger before spending, then call Anthropic
    const config = getEllisConfig();
    const modelId = model === "sonnet" ? config.modelSonnet : config.modelHaiku;

    const promptChars =
      systemPrompt.length +
      allMessages.reduce((sum, m) => sum + m.content.length, 0);
    const { costUsd, tokenEstimate } = estimateCostUsd(
      model,
      promptChars,
      MAX_OUTPUT_TOKENS
    );

    await recordUsage(
      memoryKey,
      costUsd,
      tokenEstimate,
      rateLimitStatus.warned || false
    );

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
        // Send metadata
        controller.enqueue(
          encoder.encode(
            sse({
              type: "session",
              sessionId: finalSession.sessionId,
              hall,
              model,
              cost: costUsd,
            })
          )
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
                })
              )
            );
          }
        }

        // Step 14: Update session after stream completes
        if (!finalSession) {
          throw new Error("Session missing");
        }

        const updated = updateSession(
          finalSession.sessionId,
          lastUserMessage,
          fullResponse,
          model,
          costUsd
        );

        const currentSession = updated || finalSession;

        // Record IP visit (build beat from session + response)
        const beat = buildEpisodBeat(currentSession, lastUserMessage, fullResponse);
        await recordIpVisitAfterStream(memoryKey, [beat], fullResponse.length);

        // Send done event
        controller.enqueue(
          encoder.encode(
            sse({
              type: "done",
              sessionId: currentSession.sessionId,
              messageCount: currentSession.messageCount,
            })
          )
        );

    controller.close();
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
