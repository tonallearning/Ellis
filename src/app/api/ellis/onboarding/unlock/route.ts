import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getEllisConfig, onboardingCookieName } from "@/lib/ellis/config";
import {
  OWNER_COOKIE,
  createOnboardingCookieValue,
  createOwnerCookieValue,
  ownerCookieOptions,
} from "@/lib/ellis/owner";

function setTyCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  secure: boolean,
  secret: string,
) {
  cookieStore.set(onboardingCookieName(), createOnboardingCookieValue(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  cookieStore.set(
    OWNER_COOKIE,
    createOwnerCookieValue(secret),
    ownerCookieOptions(secure),
  );
}

function secretsMatch(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

/**
 * Unlock as Ty. Works in onboarding and public — the secret is how she is
 * recognized, not a mode flag. Sets a short onboarding cookie and a long
 * owner cookie so decay and the spend ceiling never treat her as a stranger.
 */
export async function POST(request: Request) {
  const config = getEllisConfig();
  const secret = config.onboardingSecret;
  const secure = process.env.NODE_ENV === "production";

  if (!secret) {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "Onboarding secret not configured" },
        { status: 503 },
      );
    }
    const cookieStore = await cookies();
    // Development-only convenience when no secret exists. These cookies are
    // intentionally not accepted by the signed-cookie verifier.
    cookieStore.set(onboardingCookieName(), "development", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 24,
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

  if (
    typeof body.secret !== "string" ||
    body.secret.length > 1024 ||
    !secretsMatch(body.secret, secret)
  ) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const cookieStore = await cookies();
  setTyCookies(cookieStore, secure, secret);

  return NextResponse.json({ ok: true });
}
