import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isPublicExpression, parsePublicExpression } from "./publicExpression";

describe("public expression choice", () => {
  it("accepts only the bounded, outward-facing vocabulary", () => {
    for (const expression of ["none", "attentive", "softened", "reserved"]) {
      assert.equal(parsePublicExpression({ expression }), expression);
      assert.equal(isPublicExpression(expression), true);
    }
  });

  it("rejects telemetry, private provenance, and extra fields", () => {
    assert.throws(() => parsePublicExpression({ expression: "anxious" }));
    assert.throws(() =>
      parsePublicExpression({ expression: "softened", reason: "Naym visited" }),
    );
    assert.throws(() =>
      parsePublicExpression({ expression: "attentive", pulse: 0.8 }),
    );
    assert.throws(() => parsePublicExpression(null));
  });
});
