import assert from "node:assert/strict";
import test from "node:test";
import {
  parseGestureAction,
  parseGestureToolChoice,
  parseGestureReply,
  parsePendingGestureOffer,
} from "./gestures";

const pending = {
  id: "f9ccf733-c94f-433e-8c99-3b6b4b7612a2",
  kind: "hug" as const,
};

test("Ellis may offer only when the lane has no unresolved offer", () => {
  assert.deepEqual(
    parseGestureAction({ kind: "offer", gesture: "poke" }, null),
    { kind: "offer", gesture: "poke" },
  );
  assert.throws(() =>
    parseGestureAction({ kind: "offer", gesture: "poke" }, pending),
  );
  assert.throws(() =>
    parseGestureAction({ kind: "offer", gesture: "imagined" }, null),
  );
  assert.throws(() =>
    parseGestureAction(
      { kind: "offer", gesture: "hug", recipient: "naym" },
      null,
    ),
  );
});

test("Ellis withdraws only an existing offer, without choosing for its recipient", () => {
  assert.deepEqual(parseGestureAction({ kind: "withdraw" }, pending), {
    kind: "withdraw",
  });
  assert.throws(() => parseGestureAction({ kind: "withdraw" }, null));
  assert.throws(() =>
    parseGestureAction({ kind: "withdraw", decision: "declined" }, pending),
  );
});

test("a required gesture choice may be none without inventing an offer", () => {
  assert.deepEqual(parseGestureToolChoice("no_gesture_action", {}, null), {
    kind: "none",
  });
  assert.deepEqual(parseGestureToolChoice("no_gesture_action", {}, pending), {
    kind: "none",
  });
  assert.deepEqual(
    parseGestureToolChoice("offer_gesture", { gesture: "kiss" }, null),
    {
      kind: "offer",
      gesture: "kiss",
    },
  );
  assert.deepEqual(parseGestureToolChoice("withdraw_gesture", {}, pending), {
    kind: "withdraw",
  });
  assert.throws(() =>
    parseGestureToolChoice("no_gesture_action", { gesture: "hug" }, null),
  );
  assert.throws(() => parseGestureToolChoice("offer_gesture", {}, null));
  assert.throws(() => parseGestureToolChoice("withdraw_gesture", {}, null));
  assert.throws(() =>
    parseGestureToolChoice("offer_gesture", { gesture: "hug" }, pending),
  );
  assert.throws(() =>
    parseGestureToolChoice(
      "offer_gesture",
      { gesture: "hug", kind: "none" },
      null,
    ),
  );
});

test("recipient replies and pending offers require exact IDs and decisions", () => {
  assert.deepEqual(parsePendingGestureOffer(pending), pending);
  assert.deepEqual(
    parseGestureReply({ offerId: pending.id, decision: "left_open" }),
    { offerId: pending.id, decision: "left_open" },
  );
  assert.throws(() =>
    parseGestureReply({ offerId: "not-an-id", decision: "accepted" }),
  );
  assert.throws(() =>
    parseGestureReply({ offerId: pending.id, decision: "yes" }),
  );
  assert.throws(() =>
    parsePendingGestureOffer({ ...pending, sourceId: pending.id }),
  );
});
