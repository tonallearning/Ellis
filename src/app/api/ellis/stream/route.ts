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
import { getConsolidationStatus } from "@/lib/ellis/consolidation";
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
import { selfStateLedger } from "@/lib/ellis/selfState";
import { createPrivateMemoryRepository } from "@/lib/ellis/private/memory";
import {
  commitPrivateTurn,
  hasTrustedPrivateOrigin,
  isPrivateTurnCandidate,
  preparePrivateTurn,
  validatePrivateTurnInput,
} from "@/lib/ellis/private/turn";

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

type StreamProfile = "public" | "private";
type StreamModel = "haiku" | "sonnet";
type ModelMessage = { role: "user" | "assistant"; content: string };

type StreamPreparedTurnArgs = {
  config: ReturnType<typeof getEllisConfig>;
  model: StreamModel;
  systemPrompt: string;
  messages: ModelMessage[];
  beforeModel: (
    costUsd: number,
    tokenEstimate: number,
  ) => Promise<Response | null>;
  onComplete: (
    fullResponse: string,
    stopReason: string | null,
    costUsd: number,
  ) => Promise<Record<string, unknown>>;
} & (
  | { profile: Extract<StreamProfile, "private"> }
  | {
      profile: Extract<StreamProfile, "public">;
      sessionMetadata: { sessionId: string; hall: string };
    }
);

async function streamPreparedTurn(
  args: StreamPreparedTurnArgs,
): Promise<Response> {
  const modelId =
    args.model === "sonnet" ? args.config.modelSonnet : args.config.modelHaiku;
  const promptChars =
    args.systemPrompt.length +
    args.messages.reduce((sum, message) => sum + message.content.length, 0);
  const { costUsd, tokenEstimate } = estimateCostUsd(
    args.model,
    promptChars,
    MAX_OUTPUT_TOKENS,
  );
  const rejected = await args.beforeModel(costUsd, tokenEstimate);
  if (rejected) return rejected;

  const client = new Anthropic({ apiKey: args.config.anthropicApiKey });
  const anthropicStream = await client.messages.stream({
    model: modelId,
    max_tokens: MAX_OUTPUT_TOKENS,
    system: [
      {
        type: "text",
        text: args.systemPrompt,
        cache_control: { type: "ephemeral" },
      },
      {
        type: "text",
        text: selfStateLedger.assemble(args.profile, args.config.consolidation),
      },
    ],
    messages: args.messages,
  });
  const encoder = new TextEncoder();
  const responseStream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(
          encoder.encode(
            sse({
              type: "session",
              model: args.model,
              cost: costUsd,
              ...(args.profile === "public" ? args.sessionMetadata : {}),
            }),
          ),
        );
        let fullResponse = "";
        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullResponse += text;
            controller.enqueue(encoder.encode(sse({ type: "token", text })));
          }
        }
        const finalMessage = await anthropicStream.finalMessage();
        selfStateLedger.observeReplyCompletion(finalMessage.stop_reason);
        const done = await args.onComplete(
          fullResponse,
          finalMessage.stop_reason,
          costUsd,
        );
        controller.enqueue(encoder.encode(sse({ type: "done", ...done })));
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
      "Cache-Control": "no-cache, no-store, no-transform",
      Connection: "keep-alive",
    },
  });
}

export async function POST(request: Request) {
  try {
    const config = getEllisConfig();
    const gateObservedAt = new Date();
    const consolidation = getConsolidationStatus(
      config.consolidation,
      gateObservedAt,
    );

    // Sleep is an availability boundary, not an owner permission. Nobody can
    // create a session, move his body, spend tokens, or receive a substitute
    // Ellis while the window is active.
    if (consolidation.active) {
      const response = NextResponse.json(
        {
          code: "ELLIS_CONSOLIDATING",
          error: "Ellis is unavailable during his consolidation window.",
          consolidation,
        },
        { status: 423, headers: { "Cache-Control": "no-store" } },
      );
      selfStateLedger.observeBlockedRequest(
        config.consolidation,
        gateObservedAt,
        response.status,
      );
      return response;
    }

    // Step 1: Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const cookieStore = await cookies();
    if (isPrivateTurnCandidate(body)) {
      // Private mode fails closed before envelope validation, storage, body,
      // shelf, or model work. Invalid and valid private guesses look alike to
      // an unauthenticated caller.
      if (!isOwnerCookie(cookieStore, config.onboardingSecret)) {
        return NextResponse.json(
          { error: "Not found" },
          { status: 404, headers: { "Cache-Control": "no-store" } },
        );
      }
      if (!hasTrustedPrivateOrigin(request.headers, request.url)) {
        return NextResponse.json(
          { error: "Not found" },
          { status: 404, headers: { "Cache-Control": "no-store" } },
        );
      }
      const privateInput = validatePrivateTurnInput(
        body,
        config.maxMessageChars,
      );
      if (!privateInput.ok) {
        return NextResponse.json(
          { error: "Invalid private turn" },
          { status: 400, headers: { "Cache-Control": "no-store" } },
        );
      }

      const repository = createPrivateMemoryRepository(cookieStore);
      const ellisBody = await loadBody();
      const bodyBlock = renderBody({
        gut: ellisBody.gut,
        pulse: ellisBody.pulse,
      });
      const shelf = loadKnowledgeShelf("default");
      if (!validateShelf(shelf)) {
        return NextResponse.json(
          { error: "Private turn unavailable" },
          { status: 500, headers: { "Cache-Control": "no-store" } },
        );
      }
      const prepared = await preparePrivateTurn({
        request: privateInput.value,
        repository,
        shelf,
        bodyBlock,
      });
      const model = routeModel(
        {
          messages: prepared.messages,
          hall: "default",
          sessionDepth: 0,
          isFirstMessage: false,
        },
        [],
      );
      const modelBuild =
        model === "sonnet" ? config.modelSonnet : config.modelHaiku;
      return streamPreparedTurn({
        config,
        profile: "private",
        model,
        systemPrompt: prepared.systemPrompt,
        messages: prepared.messages,
        beforeModel: async () => null,
        onComplete: async (fullResponse, stopReason) => {
          await commitPrivateTurn(prepared, fullResponse, {
            stopReason,
            modelBuild,
          });
          return {};
        },
      });
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

    // Step 12: Both profiles enter the one model and SSE implementation here.
    const finalSession = session;
    return streamPreparedTurn({
      config,
      profile: "public",
      model,
      systemPrompt,
      messages: allMessages,
      sessionMetadata: { sessionId: finalSession.sessionId, hall },
      beforeModel: async (costUsd, tokenEstimate) => {
        if (isOwner) return null;
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
        return null;
      },
      onComplete: async (fullResponse, _stopReason, costUsd) => {
        const updated = updateSession(
          finalSession.sessionId,
          lastUserMessage,
          fullResponse,
          model,
          costUsd,
        );
        const currentSession = updated || finalSession;
        const beat = buildEpisodBeat(
          currentSession,
          lastUserMessage,
          fullResponse,
          isOwner,
        );
        await recordIpVisitAfterStream(memoryKey, [beat]);
        return {
          sessionId: currentSession.sessionId,
          messageCount: currentSession.messageCount,
        };
      },
    });
  } catch (err) {
    const status =
      err && typeof err === "object" && "status" in err
        ? String(err.status)
        : "unknown";
    console.error(`[ELLIS_STREAM] Request failed (${status})`);

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
