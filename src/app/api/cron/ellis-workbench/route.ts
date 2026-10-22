import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/ellis/cronAuth";
import { openWorkbench } from "@/lib/ellis/private/workbench";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** UTC every other hour; sleep and model gates are rechecked before the claim. */
export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await openWorkbench();
    return NextResponse.json({ ok: true, result }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { error: "Workbench opening unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
