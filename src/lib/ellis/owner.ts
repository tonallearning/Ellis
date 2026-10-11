import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Owner identity — Ty, not the house IP.
 *
 * The household shares a connection. Keying "never decay" to an IP hash would
 * hand Pete and the kids her memory. Owner is a cookie she sets by knowing the
 * onboarding secret, and a memory row that is not an address.
 */

export const OWNER_MEMORY_KEY = "owner";

export const OWNER_COOKIE = "ellis_owner";

const COOKIE_VERSION = "v1";
const OWNER_PURPOSE = "ellis-owner";
const ONBOARDING_PURPOSE = "ellis-onboarding";

type CookieStore = {
  get(name: string): { value: string } | undefined;
};

function signedCookieValue(secret: string, purpose: string): string {
  const digest = createHmac("sha256", secret)
    .update(`${COOKIE_VERSION}:${purpose}`)
    .digest("base64url");
  return `${COOKIE_VERSION}.${digest}`;
}

function validSignedCookie(
  value: string | undefined,
  secret: string | undefined,
  purpose: string,
): boolean {
  if (!value || !secret) return false;

  const expected = signedCookieValue(secret, purpose);
  const providedBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export function createOwnerCookieValue(secret: string): string {
  return signedCookieValue(secret, OWNER_PURPOSE);
}

export function createOnboardingCookieValue(secret: string): string {
  return signedCookieValue(secret, ONBOARDING_PURPOSE);
}

/** A bit over a year. She re-unlocks at `/onboarding` if it lapses. */
export const OWNER_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export function isOwnerMemoryKey(key: string): boolean {
  return key === OWNER_MEMORY_KEY;
}

/**
 * expires_at is NOT NULL on the table. Fifty years is "not the seven-day
 * clock," not a claim that the row is immortal — decay also skips this key.
 */
export function ownerExpiresAt(now: Date = new Date()): Date {
  const expires = new Date(now);
  expires.setUTCFullYear(expires.getUTCFullYear() + 50);
  return expires;
}

export function isOwnerCookie(
  cookieStore: CookieStore,
  secret: string | undefined = process.env.ELLIS_ONBOARDING_SECRET,
): boolean {
  return validSignedCookie(
    cookieStore.get(OWNER_COOKIE)?.value,
    secret,
    OWNER_PURPOSE,
  );
}

export function isOnboardingCookie(
  cookieStore: CookieStore,
  cookieName: string,
  secret: string | undefined = process.env.ELLIS_ONBOARDING_SECRET,
): boolean {
  return validSignedCookie(
    cookieStore.get(cookieName)?.value,
    secret,
    ONBOARDING_PURPOSE,
  );
}

export function ownerCookieOptions(secure: boolean): {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  maxAge: number;
  path: string;
} {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: OWNER_COOKIE_MAX_AGE,
    path: "/",
  };
}
