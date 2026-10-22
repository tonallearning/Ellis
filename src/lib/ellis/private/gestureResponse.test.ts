import assert from "node:assert/strict";
import test from "node:test";
import { parseGestureResponse } from "./gestureResponse";

test("Ellis may accept, decline, or leave the offered gesture open", () => {
  for (const decision of ["accepted", "declined", "left_open"]) {
    assert.deepEqual(parseGestureResponse({ kind: "poke", decision }, "poke"), {
      kind: "poke", decision,
    });
  }
});

test("a gesture response cannot switch kind or smuggle extra action fields", () => {
  for (const value of [
    { kind: "hug", decision: "accepted" },
    { kind: "poke", decision: "invented" },
    { kind: "poke", decision: "accepted", closeDoor: true },
    null,
  ]) {
    assert.throws(() => parseGestureResponse(value, "poke"));
  }
});
