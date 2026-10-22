import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getEllisConfig } from "@/lib/ellis/config";
import { getConsolidationStatus } from "@/lib/ellis/consolidation";
import { moveBody } from "@/lib/ellis/me/body/store";
import { isCurrentModelBuild } from "@/lib/ellis/modelContinuity";
import { isOwnerCookie } from "@/lib/ellis/owner";
import { createPrivateMemoryRepository } from "@/lib/ellis/private/memory";
import { hasTrustedPrivateOrigin } from "@/lib/ellis/private/turn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/** A visible private tab advances the body, never a model turn or transcript. */
export async function POST(request: Request) {
  const config = getEllisConfig();
  const cookieStore = await cookies();
  if (
    !isOwnerCookie(cookieStore, config.onboardingSecret) ||
    !hasTrustedPrivateOrigin(request.headers, request.url)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  }
  if (
    getConsolidationStatus(config.consolidation).active ||
    !isCurrentModelBuild(config.modelHaiku)
  ) {
    return new Response(null, { status: 204, headers: NO_STORE });
  }

  try {
    const gate = await createPrivateMemoryRepository(cookieStore).gate("ellis:ty");
    if (gate.privateUntil && Date.parse(gate.privateUntil) > Date.now()) {
      return new Response(null, { status: 204, headers: NO_STORE });
    }
    const result = await moveBody({ kind: "presence_beat" });
    return new Response(null, {
      status: result.persisted ? 204 : 503,
      headers: NO_STORE,
    });
  } catch {
    return new Response(null, { status: 503, headers: NO_STORE });
  }
}
