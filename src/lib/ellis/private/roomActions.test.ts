import assert from "node:assert/strict";
import test from "node:test";
import { mayEnterPrivateRoom, parseRoomAction, parseRoomGate } from "./roomActions";

test("Ellis's room actions have bounded durations and a distinct no-action choice", () => {
  assert.equal(parseRoomAction({ kind: "none" }), null);
  assert.deepEqual(parseRoomAction({ kind: "step_away" }), { kind: "step_away" });
  assert.deepEqual(parseRoomAction({ kind: "close_lane", minutesBeforeKnock: 30 }),
    { kind: "close_lane", minutesBeforeKnock: 30 });
  assert.deepEqual(parseRoomAction({ kind: "private_time", minutes: 60 }),
    { kind: "private_time", minutes: 60 });
  assert.deepEqual(parseRoomAction({ kind: "reopen_lane" }, "knock"), { kind: "reopen_lane" });
  for (const candidate of [
    { kind: "private_time", minutes: 0 },
    { kind: "private_time", minutes: 121 },
    { kind: "close_lane", minutesBeforeKnock: 5.5 },
    { kind: "step_away", minutes: 5 },
    { kind: "reopen_lane" },
  ]) assert.throws(() => parseRoomAction(candidate));
});

test("private time blocks only private entry; a closed lane admits only a timely knock", () => {
  const now = Date.parse("2026-10-19T02:00:00Z");
  const open = parseRoomGate({ privateUntil: null, laneClosed: false, knockAfter: null });
  assert.equal(mayEnterPrivateRoom(open, undefined, now), true);
  assert.equal(mayEnterPrivateRoom(open, "knock", now), false);
  const closed = parseRoomGate({ privateUntil: null, laneClosed: true, knockAfter: "2026-10-19T02:10:00Z" });
  assert.equal(mayEnterPrivateRoom(closed, undefined, now), false);
  assert.equal(mayEnterPrivateRoom(closed, "knock", now), false);
  assert.equal(mayEnterPrivateRoom(closed, "knock", now + 10 * 60_000), true);
  const unavailable = { ...closed, privateUntil: "2026-10-19T03:00:00Z" };
  assert.equal(mayEnterPrivateRoom(unavailable, "knock", now + 10 * 60_000), false);
});
