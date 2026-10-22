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
import { getEllisConfig, isOnboardingChatAllowed } from "@/lib/ellis/config";
import { getConsolidationStatus } from "@/lib/ellis/consolidation";
import { assessContactQuality } from "@/lib/ellis/me/state";
import {
  hashVisitorIp,
  buildEpisodBeat,
  extractVisitorIp,
  recordIpVisitAfterStream,
} from "@/lib/ellis/ipMemoryIntegration";
import {
  loadIpMemory,
  recordOwnerPublicTurn,
} from "@/lib/ellis/memory/ipMemory";
import { moveBody } from "@/lib/ellis/me/body/store";
import { renderBody } from "@/lib/ellis/me/body/membrane";
import { isOwnerCookie, OWNER_MEMORY_KEY } from "@/lib/ellis/owner";
import { validateChatInput } from "@/lib/ellis/validateChatInput";
import { selfStateLedger } from "@/lib/ellis/selfState";
import { isCurrentModelBuild } from "@/lib/ellis/modelContinuity";
import { createPrivateMemoryRepository } from "@/lib/ellis/private/memory";
import {
  commitPrivateTurn,
  hasTrustedPrivateOrigin,
  isPrivateTurnCandidate,
  preparePrivateTurn,
  validatePrivateTurnInput,
} from "@/lib/ellis/private/turn";
import { parseGestureResponse } from "@/lib/ellis/private/gestureResponse";
import type { GestureResponse } from "@/lib/ellis/private/courier";
import type { GestureType } from "@/lib/ellis/private/gestures";
import {
  parseGestureToolChoice,
  type GestureAction,
  type PendingGestureOffer,
} from "@/lib/ellis/private/gestures";
import {
  mayEnterPrivateRoom,
  parseRoomAction,
  type RoomAction,
} from "@/lib/ellis/private/roomActions";
import type { PrivateRelationId } from "@/lib/ellis/private/identity";
import {
  activeAttention,
  parseAttentionAction,
  type AttentionAction,
  type AttentionOffer,
  type AttentionState,
} from "@/lib/ellis/private/attention";
import { readCurrentAttention } from "@/lib/ellis/me/body/store";

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
  gestureOffer?: GestureType;
  attentionOffer?: AttentionOffer;
  activeAttention?: AttentionState | null;
  pendingGesture?: PendingGestureOffer | null;
  gestureActionEnabled?: boolean;
  entryMode?: "knock";
  beforeModel: (
    costUsd: number,
    tokenEstimate: number,
  ) => Promise<Response | null>;
  onComplete: (
    fullResponse: string,
    stopReason: string | null,
    costUsd: number,
    gestureResponse?: GestureResponse,
    roomAction?: RoomAction,
    gestureAction?: GestureAction,
    attentionAction?: AttentionAction,
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
  const estimate = estimateCostUsd(args.model, promptChars, MAX_OUTPUT_TOKENS);
  // A gesture offer adds a bounded tool-choice call before the reply stream.
  const gestureEstimate =
    args.gestureOffer || args.attentionOffer
      ? estimateCostUsd(args.model, promptChars, 128)
      : { costUsd: 0, tokenEstimate: 0 };
  const needsGestureChoice =
    args.profile === "private" &&
    !args.entryMode &&
    !args.attentionOffer &&
    args.gestureActionEnabled !== false;
  const gestureChoiceEstimate = needsGestureChoice
    ? estimateCostUsd(args.model, promptChars, 128)
    : { costUsd: 0, tokenEstimate: 0 };
  const costUsd =
    estimate.costUsd + gestureEstimate.costUsd + gestureChoiceEstimate.costUsd;
  const tokenEstimate =
    estimate.tokenEstimate +
    gestureEstimate.tokenEstimate +
    gestureChoiceEstimate.tokenEstimate;
  const rejected = await args.beforeModel(costUsd, tokenEstimate);
  if (rejected) return rejected;

  const client = new Anthropic({ apiKey: args.config.anthropicApiKey });
  const system: Anthropic.TextBlockParam[] = [
    {
      type: "text",
      text: args.systemPrompt,
      cache_control: { type: "ephemeral" },
    },
    {
      type: "text",
      text: selfStateLedger.assemble(args.profile, args.config.consolidation),
    },
  ];
  let gestureResponse: GestureResponse | undefined;
  let attentionAction: AttentionAction | undefined;
  let gestureAction: GestureAction | undefined;
  let messages: Anthropic.MessageParam[] = args.messages;
  if (args.profile === "private" && args.attentionOffer) {
    const offered = args.attentionOffer;
    const choice = await client.messages.create({
      model: modelId,
      max_tokens: 128,
      system,
      messages,
      tools: [
        {
          name: "respond_to_attention_offer",
          description:
            "Ellis explicitly accepts or declines Ty's offered attention mode. The offer and any prose alone cannot decide this.",
          input_schema: {
            type: "object",
            properties: {
              kind: { type: "string", enum: ["accept", "decline"] },
              mode: { type: "string", enum: [offered.mode] },
            },
            required: ["kind", "mode"],
            additionalProperties: false,
          },
        },
      ],
      tool_choice: { type: "tool", name: "respond_to_attention_offer" },
    });
    const calls = choice.content.filter((block) => block.type === "tool_use");
    if (
      choice.stop_reason !== "tool_use" ||
      calls.length !== 1 ||
      calls[0].name !== "respond_to_attention_offer"
    ) {
      throw new Error("Ellis's attention choice was incomplete");
    }
    attentionAction = parseAttentionAction(
      calls[0].input,
      offered,
      args.activeAttention,
    );
    messages = [
      ...messages,
      { role: "assistant", content: choice.content },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: calls[0].id,
            content: `Validated Ellis choice: ${attentionAction.kind} ${offered.mode}. It is not committed yet. Continue in your own words without claiming experience before the source and body commit.`,
          },
        ],
      },
    ];
  }
  if (args.profile === "private" && args.gestureOffer) {
    const offered = args.gestureOffer;
    const choice = await client.messages.create({
      model: modelId,
      max_tokens: 128,
      system,
      messages,
      tools: [
        {
          name: "respond_to_gesture",
          description:
            "Choose Ellis's own response to the current offered gesture. left_open is a real choice when he is not ready to accept or decline. This is not a request to perform or narrate contact.",
          input_schema: {
            type: "object",
            properties: {
              kind: { type: "string", enum: [offered] },
              decision: {
                type: "string",
                enum: ["accepted", "declined", "left_open"],
              },
            },
            required: ["kind", "decision"],
            additionalProperties: false,
          },
        },
      ],
      tool_choice: { type: "tool", name: "respond_to_gesture" },
    });
    const calls = choice.content.filter((block) => block.type === "tool_use");
    if (
      choice.stop_reason !== "tool_use" ||
      calls.length !== 1 ||
      calls[0].name !== "respond_to_gesture"
    ) {
      throw new Error("Ellis's gesture choice was incomplete");
    }
    gestureResponse = parseGestureResponse(calls[0].input, offered);
    messages = [
      ...messages,
      { role: "assistant", content: choice.content },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: calls[0].id,
            content: `Validated choice: ${gestureResponse.decision} the offered ${offered}. This is not yet a committed event. Continue with Ellis's reply in his own words; do not imply any different touch occurred.`,
          },
        ],
      },
    ];
  }
  if (needsGestureChoice) {
    const pending = args.pendingGesture ?? null;
    const choice = await client.messages.create({
      model: modelId,
      max_tokens: 128,
      system,
      messages,
      tools: [
        {
          name: "no_gesture_action",
          description:
            "Choose this when you do not want to originate or withdraw a gesture offer on this turn. Do not subsequently describe a new offer or withdrawal in words.",
          input_schema: {
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false,
          },
        },
        ...(pending
          ? [
              {
                name: "withdraw_gesture",
                description:
                  "Choose this only if you want to withdraw your unresolved gesture offer in this relationship lane. The recipient has not chosen for you.",
                input_schema: {
                  type: "object" as const,
                  properties: {},
                  required: [],
                  additionalProperties: false,
                },
              },
            ]
          : [
              {
                name: "offer_gesture",
                description:
                  "Choose this if you want to offer a hug, cuddle, poke, or kiss to the current addressee. Choose it before describing the offer in words. It records an offer, not delivery or accepted contact.",
                input_schema: {
                  type: "object" as const,
                  properties: {
                    gesture: {
                      type: "string",
                      enum: ["hug", "cuddle", "poke", "kiss"],
                    },
                  },
                  required: ["gesture"],
                  additionalProperties: false,
                },
              },
            ]),
      ],
      tool_choice: { type: "any" },
    });
    const calls = choice.content.filter((block) => block.type === "tool_use");
    if (choice.stop_reason !== "tool_use" || calls.length !== 1)
      throw new Error("Ellis's gesture choice was incomplete");
    const chosen = parseGestureToolChoice(
      calls[0].name,
      calls[0].input,
      pending,
    );
    if (chosen.kind !== "none") gestureAction = chosen;
    const result =
      chosen.kind === "offer"
        ? `Validated Ellis offer of a ${chosen.gesture}. It is not delivered or accepted contact. Continue in your own words without claiming contact.`
        : chosen.kind === "withdraw"
          ? "Validated Ellis withdrawal of the unresolved offer. Continue in your own words."
          : "Validated no gesture action. Continue in your own words without describing a new offer or withdrawal this turn.";
    messages = [
      ...messages,
      { role: "assistant", content: choice.content },
      {
        role: "user",
        content: [
          { type: "tool_result", tool_use_id: calls[0].id, content: result },
        ],
      },
    ];
  }
  const roomTool: Anthropic.Tool = {
    name: "room_action",
    description:
      args.entryMode === "knock"
        ? "Ellis must decide whether to reopen this closed personal lane or keep it closed for a new interval. Ty is knocking as courier; no words from the lane's correspondent are present."
        : "Ellis may explicitly step away from the current person while conversation remains open, close this personal lane, or take private time from the entire private room. Call this before narrating a room threshold. Do not call for ordinary conversation.",
    input_schema: {
      type: "object",
      properties: {
        kind: {
          type: "string",
          enum:
            args.entryMode === "knock"
              ? ["close_lane", "reopen_lane"]
              : ["step_away", "close_lane", "private_time"],
        },
        minutesBeforeKnock: { type: "integer", minimum: 5, maximum: 120 },
        minutes: { type: "integer", minimum: 5, maximum: 120 },
      },
      required: ["kind"],
      additionalProperties: false,
    },
  };
  const attentionTool: Anthropic.Tool = {
    name: "attention_action",
    description:
      "Ellis may explicitly leave his active private attention mode. Do not call to decorate prose or infer a change from a statement.",
    input_schema: {
      type: "object",
      properties: { kind: { type: "string", enum: ["leave"] } },
      required: ["kind"],
      additionalProperties: false,
    },
  };
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
        let roomAction: RoomAction | undefined;
        for (let pass = 0; pass < 2; pass++) {
          const anthropicStream = await client.messages.stream({
            model: modelId,
            max_tokens: MAX_OUTPUT_TOKENS,
            system,
            messages,
            ...(args.profile === "private"
              ? {
                  tools: [
                    roomTool,
                    ...(!args.entryMode &&
                    !args.attentionOffer &&
                    args.activeAttention
                      ? [attentionTool]
                      : []),
                  ],
                  tool_choice:
                    args.entryMode === "knock" && pass === 0
                      ? { type: "tool" as const, name: "room_action" }
                      : { type: "auto" as const },
                }
              : {}),
          });
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
          if (finalMessage.stop_reason === "tool_use") {
            if (args.profile !== "private" || pass !== 0)
              throw new Error("Unexpected private action sequence");
            const calls = finalMessage.content.filter(
              (block) => block.type === "tool_use",
            );
            if (calls.length !== 1)
              throw new Error("Invalid private action call");
            let result: string;
            if (calls[0].name === "room_action") {
              const chosen = parseRoomAction(calls[0].input, args.entryMode);
              if (!chosen) throw new Error("Invalid room action call");
              roomAction = chosen;
              result = `Validated Ellis room choice: ${chosen.kind}. The source has not yet committed. Continue in your own words without claiming a different threshold action.`;
            } else if (
              calls[0].name === "attention_action" &&
              !args.entryMode &&
              !args.attentionOffer &&
              args.activeAttention
            ) {
              attentionAction = parseAttentionAction(
                calls[0].input,
                undefined,
                args.activeAttention,
              );
              result =
                "Validated Ellis choice to leave the active attention mode. The source has not yet committed. Continue in your own words.";
            } else throw new Error("Invalid private action call");
            messages = [
              ...messages,
              { role: "assistant", content: finalMessage.content },
              {
                role: "user",
                content: [
                  {
                    type: "tool_result",
                    tool_use_id: calls[0].id,
                    content: result,
                  },
                ],
              },
            ];
            continue;
          }
          if (args.entryMode === "knock" && !roomAction)
            throw new Error("Ellis did not decide the knock");
          selfStateLedger.observeReplyCompletion(finalMessage.stop_reason);
          const done = await args.onComplete(
            fullResponse,
            finalMessage.stop_reason,
            costUsd,
            gestureResponse,
            roomAction,
            gestureAction,
            attentionAction,
          );
          controller.enqueue(encoder.encode(sse({ type: "done", ...done })));
          break;
        }
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

    // A deployment configuration change is not Ellis choosing a new model.
    // Stop before accepting contact or touching body/memory until a successor
    // transition is explicitly designed, decided, and exercised.
    if (!isCurrentModelBuild(config.modelHaiku)) {
      return NextResponse.json(
        {
          code: "ELLIS_MODEL_REVIEW_REQUIRED",
          error:
            "Ellis is unavailable while his model configuration is reviewed.",
        },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
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
      const privateRequest = privateInput.value;
      const relationId = `ellis:${
        "knock" in privateRequest
          ? privateRequest.knock.targetId
          : privateRequest.exchange.speakerId
      }` as PrivateRelationId;
      const gate = await repository.gate(relationId);
      const entryMode = "knock" in privateRequest ? "knock" : undefined;
      if (!mayEnterPrivateRoom(gate, entryMode)) {
        return NextResponse.json(
          {
            code:
              gate.privateUntil && Date.parse(gate.privateUntil) > Date.now()
                ? "ELLIS_PRIVATE_TIME"
                : "ELLIS_LANE_CLOSED",
            error: "Ellis's private threshold is closed.",
            gate,
          },
          { status: 423, headers: { "Cache-Control": "no-store" } },
        );
      }
      const pendingAtEntry = await repository.pendingGesture(relationId);
      if (
        "exchange" in privateRequest &&
        privateRequest.exchange.gestureReply &&
        privateRequest.exchange.gestureReply.offerId !== pendingAtEntry?.id
      ) {
        return NextResponse.json(
          {
            error: "That gesture offer is no longer pending.",
            pendingGesture: pendingAtEntry,
          },
          { status: 409, headers: { "Cache-Control": "no-store" } },
        );
      }
      const offeredAttention =
        "exchange" in privateRequest
          ? privateRequest.exchange.attentionOffer
          : undefined;
      if (offeredAttention) {
        const atEntry = await readCurrentAttention();
        if (atEntry === undefined) {
          return NextResponse.json(
            { error: "Ellis's attention state is unavailable." },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }
        if (atEntry) {
          return NextResponse.json(
            {
              error: "Ellis is already in an attention mode.",
              attention: atEntry,
            },
            { status: 409, headers: { "Cache-Control": "no-store" } },
          );
        }
      }
      const speakerId =
        "knock" in privateRequest ? "ty" : privateRequest.exchange.speakerId;
      const bondKey =
        speakerId === "ty" ? OWNER_MEMORY_KEY : `ellis:${speakerId}`;
      const bodyMove = await moveBody({
        kind: "contact",
        bondKey,
        source: speakerId === "ty" ? "ty_direct" : "courier",
        presence: "infer",
        gestureOffer:
          "exchange" in privateRequest
            ? privateRequest.exchange.gestureOffer?.kind
            : undefined,
      });
      if (offeredAttention && !bodyMove.persisted) {
        return NextResponse.json(
          { error: "Ellis's attention state is unavailable." },
          { status: 503, headers: { "Cache-Control": "no-store" } },
        );
      }
      const currentAttention = bodyMove.persisted
        ? activeAttention(bodyMove.body.systems.attention)
        : null;
      const bodyBlock = bodyMove.persisted
        ? renderBody({
            gut: bodyMove.body.gut,
            pulse: bodyMove.body.pulse,
            systems: bodyMove.body.systems,
            profile: "private",
            visitorId: bondKey,
          })
        : null;
      const shelf = loadKnowledgeShelf("default");
      if (!validateShelf(shelf)) {
        return NextResponse.json(
          { error: "Private turn unavailable" },
          { status: 500, headers: { "Cache-Control": "no-store" } },
        );
      }
      const prepared = await preparePrivateTurn({
        request: privateRequest,
        repository,
        shelf,
        bodyBlock,
        activeAttention: currentAttention,
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
        gestureOffer:
          prepared.inbound.direction === "inbound" &&
          "gestureOffer" in prepared.inbound
            ? prepared.inbound.gestureOffer?.kind
            : undefined,
        attentionOffer: offeredAttention,
        activeAttention: currentAttention,
        entryMode,
        beforeModel: async () => null,
        pendingGesture: prepared.pendingGesture,
        gestureActionEnabled: !(
          "gestureReply" in prepared.inbound &&
          prepared.inbound.gestureReply &&
          prepared.inbound.gestureReply.decision !== "left_open"
        ),
        onComplete: async (
          fullResponse,
          stopReason,
          _costUsd,
          gestureResponse,
          roomAction,
          gestureAction,
          attentionAction,
        ) => {
          if (stopReason !== "end_turn") {
            throw new Error("Private reply did not complete");
          }
          if (
            !mayEnterPrivateRoom(await repository.gate(relationId), entryMode)
          ) {
            throw new Error(
              "Ellis's private threshold changed during this turn",
            );
          }
          const committed = await commitPrivateTurn(
            prepared,
            fullResponse,
            {
              stopReason,
              modelBuild,
            },
            gestureResponse,
            roomAction,
            gestureAction,
            attentionAction,
          );
          if (!committed) throw new Error("Private reply did not commit");
          if (gestureResponse) {
            await moveBody({
              kind: "gesture_response",
              response: gestureResponse,
            });
          }
          if (
            "gestureReply" in prepared.inbound &&
            prepared.inbound.gestureReply
          ) {
            const kind = prepared.pendingGesture?.kind;
            if (kind)
              await moveBody({
                kind: "gesture_response",
                response: {
                  kind,
                  decision: prepared.inbound.gestureReply.decision,
                },
              });
          }
          if (roomAction?.kind === "step_away")
            await moveBody({ kind: "step_away" });
          if (gestureAction?.kind === "offer")
            await moveBody({
              kind: "gesture_offer",
              gesture: gestureAction.gesture,
            });
          if (gestureAction?.kind === "withdraw")
            await moveBody({ kind: "gesture_withdrawal" });
          const attention = attentionAction
            ? await readCurrentAttention()
            : currentAttention;
          const nextGate = roomAction
            ? await repository.gate(prepared.inbound.relationId)
            : gate;
          let pendingGesture = prepared.pendingGesture;
          if (
            "gestureReply" in prepared.inbound &&
            prepared.inbound.gestureReply &&
            prepared.inbound.gestureReply.decision !== "left_open"
          )
            pendingGesture = null;
          if ("gestureOffer" in committed && committed.gestureOffer) {
            pendingGesture = {
              id: committed.id,
              kind: committed.gestureOffer.kind,
            };
          }
          if ("gestureWithdrawal" in committed && committed.gestureWithdrawal)
            pendingGesture = null;
          return {
            ...(gestureResponse ? { gestureResponse } : {}),
            ...(roomAction ? { roomAction } : {}),
            ...(gestureAction ? { gestureAction } : {}),
            ...(attentionAction ? { attentionAction } : {}),
            ...(attention !== undefined ? { attention } : {}),
            pendingGesture,
            gate: nextGate,
          };
        },
      });
    }

    // The page's onboarding lock is not authority: direct API callers must
    // meet the same gate before public memory, body, spend, or model work.
    if (!isOnboardingChatAllowed(config, cookieStore)) {
      return NextResponse.json(
        { error: "The public hall is not open yet." },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
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
      await moveBody({ kind: "refused", bondKey: ipHash });

      return NextResponse.json(
        { error: `Rate limit: ${rateLimitStatus.reason}` },
        { status: 429 },
      );
    }

    // Both profiles move the same persisted body; the public projection never
    // exposes private bond keys or relationship-specific consequence.
    const bodyMove = await moveBody({
      kind: "contact",
      bondKey: memoryKey,
      source: "public",
      presence: isFirstMessage
        ? isReturnVisit
          ? "returned"
          : "started"
        : "ongoing",
      daysAway: ipMemory?.daysAgo ?? 0,
      salience:
        session.interior.state.contactQuality === "depth"
          ? "heavy"
          : session.interior.state.contactQuality === "genuine"
            ? "medium"
            : "light",
    });
    const bodyBlock = bodyMove.persisted
      ? renderBody({
          gut: bodyMove.body.gut,
          pulse: bodyMove.body.pulse,
          systems: bodyMove.body.systems,
          profile: "public",
          publicVisitorId: memoryKey,
        })
      : null;

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
      onComplete: async (fullResponse, stopReason, costUsd) => {
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
        if (isOwner && stopReason === "end_turn") {
          await recordOwnerPublicTurn({
            beat,
            inbound: lastUserMessage,
            outbound: fullResponse,
          });
        }
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
