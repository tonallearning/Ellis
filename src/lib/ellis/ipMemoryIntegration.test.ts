import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { summarizeExchange } from "./memory/summarizeExchange";

describe("episodic memory summaries", () => {
  it("keeps both sides of an exchange and labels owner turns as Ty", () => {
    const summary = summarizeExchange(
      "I want this role because it is outside what I do now.",
      "That changes the assessment.",
      true,
    );

    assert.equal(
      summary,
      "Ty: I want this role because it is outside what I do now. | Ellis: That changes the assessment.",
    );
  });

  it("normalizes whitespace and bounds each side of the remembered exchange", () => {
    const summary = summarizeExchange("  hello\n\nthere  ", "x".repeat(400));

    assert.match(summary, /^Visitor: hello there \| Ellis: /);
    assert.ok(summary.endsWith("…"));
    assert.ok(summary.length < 600);
  });
});
