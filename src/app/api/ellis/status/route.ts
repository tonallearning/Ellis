import { NextResponse } from "next/server";
import { getEllisConfig } from "@/lib/ellis/config";
import { getConsolidationStatus } from "@/lib/ellis/consolidation";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getEllisConfig();

  return NextResponse.json(
    { consolidation: getConsolidationStatus(config.consolidation) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
