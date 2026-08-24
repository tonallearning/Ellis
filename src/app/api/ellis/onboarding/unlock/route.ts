import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getEllisConfig, onboardingCookieName } from "@/lib/ellis/config";
import { OWNER_COOKIE, ownerCookieOptions } from "@/lib/ellis/owner";

function setTyCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  secure: boolean,
) {
  cookieStore.set(onboardingCookieName(), "1", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  cookieStore.set(OWNER_COOKIE, "1", ownerCookieOptions(secure));
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
    setTyCookies(cookieStore, false);
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
  setTyCookies(cookieStore, secure);

  return NextResponse.json({ ok: true });
}
