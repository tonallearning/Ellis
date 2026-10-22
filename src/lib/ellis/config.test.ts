import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

import { isOnboardingChatAllowed, type EllisConfig } from "./config";
import {
  createOnboardingCookieValue,
  createOwnerCookieValue,
  OWNER_COOKIE,
} from "./owner";

const secret = "a sufficiently long test-only onboarding secret";
const config = {
  mode: "onboarding",
  onboardingSecret: secret,
} as EllisConfig;

function cookies(values: Record<string, string> = {}): ReadonlyRequestCookies {
  return {
    get(name: string) {
      const value = values[name];
      return value === undefined ? undefined : { value };
    },
  } as ReadonlyRequestCookies;
}

describe("public stream admission", () => {
  it("denies an anonymous or forged onboarding-mode caller", () => {
    assert.equal(isOnboardingChatAllowed(config, cookies()), false);
    assert.equal(
      isOnboardingChatAllowed(config, cookies({ ellis_onboarding: "forged" })),
      false,
    );
  });

  it("accepts signed onboarding or owner access", () => {
    assert.equal(
      isOnboardingChatAllowed(
        config,
        cookies({ ellis_onboarding: createOnboardingCookieValue(secret) }),
      ),
      true,
    );
    assert.equal(
      isOnboardingChatAllowed(
        config,
        cookies({ [OWNER_COOKIE]: createOwnerCookieValue(secret) }),
      ),
      true,
    );
  });

  it("permits anonymous callers only when the hall is public", () => {
    assert.equal(
      isOnboardingChatAllowed({ ...config, mode: "public" }, cookies()),
      true,
    );
  });
});
