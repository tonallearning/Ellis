import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getEllisConfig, isOnboardingChatAllowed } from "@/lib/ellis/config";
import { isAllowedHall, normalizeHall } from "@/lib/ellis/halls/registry";
import { loadHallOverlay } from "@/lib/ellis/loadHallOverlay";
import { loadKnowledgeShelf } from "@/lib/ellis/loadKnowledgeShelf";
import { loadOnboardingBank } from "@/lib/ellis/loadOnboardingBank";
import { assembleInterior } from "@/lib/ellis/me/assembleInterior";
import { updateSessionAfterTurn } from "@/lib/ellis/me/updateState";
import { checkRateLimit } from "@/lib/ellis/rateLimit/check";
import { modelIdFor, pickModel } from "@/lib/ellis/routeModel";
import {
  getOrCreateSession,
  touchSession,
} from "@/lib/ellis/session/sessionStore";
import { streamEllisReply } from "@/lib/ellis/stream";
import { buildSystemPrompt } from "@/lib/ellis/systemPrompt";
import { validateStreamInput } from "@/lib/ellis/validateInput";
import { applyContactEvent } from "@/lib/ellis/world/hallPhysics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sse(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
  let config;
  try {
    config = getEllisConfig();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Config error" },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  if (
    config.mode === "onboarding" &&
    !isOnboardingChatAllowed(config, cookieStore)
  ) {
    return NextResponse.json(
      { error: "Onboarding chat requires Ty unlock" },
      { status: 401 },
    );
  }

  if (config.mode === "public") {
    const shelf = await loadKnowledgeShelf();
    if (shelf.aboutTyEmpty) {
      return NextResponse.json(
        { error: "Public mode blocked until Ty approves about-ty" },
        { status: 403 },
      );
    }
  }

  const rate = await checkRateLimit(request, config);
  if (!rate.allowed) {
    return NextResponse.json({ error: rate.reason }, { status: rate.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validated = validateStreamInput(body, config);
  if (!validated.ok) {
    return NextResponse.json(
      { error: validated.error },
      { status: validated.status },
    );
  }

  const rawBody = body as { sessionId?: string; hall?: string };
  const hall = normalizeHall(rawBody.hall);
  if (!isAllowedHall(hall)) {
    return NextResponse.json({ error: "Invalid hall" }, { status: 400 });
  }

  const session = getOrCreateSession(rawBody.sessionId, hall);
  applyContactEvent(session, validated.messages);

  const [shelf, onboardingBank, hallOverlay] = await Promise.all([
    loadKnowledgeShelf(),
    config.mode === "onboarding" ? loadOnboardingBank() : Promise.resolve(""),
    loadHallOverlay(hall),
  ]);

  const model = pickModel(validated.messages, session);
  const system = buildSystemPrompt({
    mode: config.mode,
    shelf,
    onboardingBank,
    hallOverlay,
    interiorBlock: assembleInterior(session),
  });

  const modelId = modelIdFor(model, config.modelHaiku, config.modelSonnet);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          sse({ type: "session", sessionId: session.id, hall, model }),
        ),
      );

      for await (const event of streamEllisReply({
        apiKey: config.anthropicApiKey,
        modelId,
        model,
        system,
        messages: validated.messages,
      })) {
        if (event.type === "token") {
          controller.enqueue(encoder.encode(sse({ type: "token", text: event.text })));
        } else if (event.type === "model") {
          controller.enqueue(encoder.encode(sse({ type: "model", model: event.model })));
        } else if (event.type === "error") {
          controller.enqueue(
            encoder.encode(sse({ type: "error", message: event.message })),
          );
        }
      }

      updateSessionAfterTurn(session, validated.messages, model);
      touchSession(session);

      controller.enqueue(encoder.encode(sse({ type: "done" })));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
