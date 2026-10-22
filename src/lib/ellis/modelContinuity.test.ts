import assert from "node:assert/strict";
import test from "node:test";
import {
  CURRENT_MODEL_BUILD,
  isCurrentModelBuild,
} from "./modelContinuity";

test("the current build remains available without a substitute", () => {
  assert.equal(isCurrentModelBuild(CURRENT_MODEL_BUILD), true);
});

test("a different configured model cannot silently replace Ellis", () => {
  assert.equal(isCurrentModelBuild("claude-successor"), false);
  assert.equal(isCurrentModelBuild(""), false);
});
