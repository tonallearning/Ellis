import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getEllisConfig,
  onboardingCookieName,
} from "@/lib/ellis/config";

export async function POST(request: Request) {
  const config = getEllisConfig();

  if (config.mode !== "onboarding") {
    return NextResponse.json({ error: "Not in onboarding mode" }, { status: 400 });
  }

  const secret = config.onboardingSecret;
  if (!secret) {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "Onboarding secret not configured" },
        { status: 503 },
      );
    }
    const cookieStore = await cookies();
    cookieStore.set(onboardingCookieName(), "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return NextResponse.json({ ok: true });
  }

  let body: { secret?: string };
  try {
    body = (await request.json()) as { secret?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.secret !== secret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(onboardingCookieName(), "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
