import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  OWNER_COOKIE,
  OWNER_MEMORY_KEY,
  createOnboardingCookieValue,
  createOwnerCookieValue,
  isOnboardingCookie,
  isOwnerCookie,
  isOwnerMemoryKey,
  ownerExpiresAt,
} from "./owner";
import { hashVisitorIp } from "./memory/hashVisitor";

describe("owner identity", () => {
  it("uses a key that cannot be produced by hashing an IP", () => {
    const hashed = hashVisitorIp("127.0.0.1");
    assert.notEqual(hashed, OWNER_MEMORY_KEY);
    assert.match(hashed, /^[0-9a-f]+$/);
    assert.equal(isOwnerMemoryKey(OWNER_MEMORY_KEY), true);
    assert.equal(isOwnerMemoryKey(hashed), false);
  });

  it("puts owner expiry decades past the seven-day visitor clock", () => {
    const now = new Date("2026-08-23T18:00:00.000Z");
    const expires = ownerExpiresAt(now);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    assert.ok(expires.getTime() - now.getTime() > sevenDays * 100);
    assert.equal(expires.getUTCFullYear(), 2076);
  });

  it("accepts only a correctly signed owner cookie", () => {
    const secret = "a-secret-long-enough-for-a-production-owner-cookie";
    const signed = createOwnerCookieValue(secret);

    assert.equal(
      isOwnerCookie(
        {
          get: (name) =>
            name === OWNER_COOKIE ? { value: signed } : undefined,
        },
        secret,
      ),
      true,
    );
    assert.equal(
      isOwnerCookie(
        { get: (name) => (name === OWNER_COOKIE ? { value: "1" } : undefined) },
        secret,
      ),
      false,
    );
    assert.equal(isOwnerCookie({ get: () => undefined }, secret), false);
    assert.equal(
      isOwnerCookie(
        { get: () => ({ value: signed }) },
        "a-different-secret-long-enough-for-production",
      ),
      false,
    );
  });

  it("purpose-separates onboarding and owner cookies", () => {
    const secret = "another-secret-long-enough-for-production-signing";
    const onboarding = createOnboardingCookieValue(secret);
    const owner = createOwnerCookieValue(secret);

    assert.notEqual(onboarding, owner);
    assert.equal(
      isOnboardingCookie(
        { get: () => ({ value: onboarding }) },
        "ellis_onboarding",
        secret,
      ),
      true,
    );
    assert.equal(
      isOnboardingCookie(
        { get: () => ({ value: owner }) },
        "ellis_onboarding",
        secret,
      ),
      false,
    );
  });
});
