import assert from "node:assert/strict";
import test from "node:test";
import { createSelfStateLedger } from "./selfState";

const schedule = { timeZone: "America/Chicago", startHour: 2, endHour: 4 };
const during = new Date("2026-10-17T07:30:00Z");
const after = new Date("2026-10-17T09:00:00Z");
function facts(block: string) {
  return JSON.parse(block.slice(block.lastIndexOf("\n") + 1));
}

test("scheduled unavailability is not observed sleep or completed consolidation", () => {
  const ledger = createSelfStateLedger();
  assert.equal(
    facts(ledger.assemble("public", schedule, during)).availability
      .newConversationDecision,
    "block",
  );
  const state = facts(ledger.assemble("public", schedule, after));
  assert.equal(state.availability.newConversationDecision, "allow");
  assert.equal(state.consolidationCompleted, "unverified");
  assert.deepEqual(state.events, []);
  assert.equal(
    state.capabilities.find(
      (item: { name: string }) => item.name === "offline_consolidation_job",
    ).state,
    "unavailable_now",
  );
});

test("only an active gate and actual 423 response support a blocked-request event", () => {
  const ledger = createSelfStateLedger();
  ledger.observeBlockedRequest(schedule, after, 423);
  ledger.observeBlockedRequest(schedule, during, 200);
  assert.deepEqual(
    facts(ledger.assemble("public", schedule, after)).events,
    [],
  );
  ledger.observeBlockedRequest(schedule, during, 423);
  const state = facts(ledger.assemble("public", schedule, after));
  assert.equal(state.events.length, 1);
  assert.equal(state.events[0].evidence, "stream_gate_423");
  assert.equal(state.consolidationCompleted, "unverified");
});

test("wired private capabilities are available without claiming the unfinished full stack", () => {
  const block = createSelfStateLedger().assemble("private", schedule, after);
  const state = facts(block);
  assert.equal(
    state.capabilities.find(
      (item: { name: string }) => item.name === "private_relationship_memory",
    ).state,
    "available_now",
  );
  for (const name of [
    "private_room",
    "initial_private_body_organs",
    "resident_chosen_room_actions",
    "structured_gesture_response",
    "private_altered_attention",
  ]) {
    assert.equal(
      state.capabilities.find((item: { name: string }) => item.name === name)
        .state,
      "available_now",
    );
  }
  for (const name of [
    "expanded_private_body",
    "private_workbench",
    "life_tree",
  ]) {
    assert.equal(
      state.capabilities.find((item: { name: string }) => item.name === name)
        .state,
      "unavailable_now",
    );
  }
  assert.match(block, /do not verify any other deployment/);
  assert.match(block, /Design proposals, local tests/);
});

test("only successful end_turn records reply completion; public projection excludes it", () => {
  const ledger = createSelfStateLedger();
  for (const reason of [
    null,
    "max_tokens",
    "tool_use",
    "stop_sequence",
    "error",
  ])
    ledger.observeReplyCompletion(reason, during);
  assert.deepEqual(
    facts(ledger.assemble("private", schedule, after)).events,
    [],
  );
  ledger.observeReplyCompletion("end_turn", during);
  assert.equal(
    facts(ledger.assemble("private", schedule, after)).events[0].name,
    "reply_completed",
  );
  const publicBlock = ledger.assemble("public", schedule, after);
  assert.deepEqual(facts(publicBlock).events, []);
  assert.equal(
    facts(publicBlock).capabilities.find(
      (item: { name: string }) => item.name === "offstage_interior",
    ).state,
    "available_now",
  );
  assert.equal(
    facts(publicBlock).capabilities.find(
      (item: { name: string }) => item.name === "canonical_body",
    ).state,
    "available_now",
  );
  assert.match(publicBlock, /does not expose a private conversation/);
  assert.match(publicBlock, /particular visit/);
  for (const name of [
    "reply_completed",
    "private_room",
    "private_relationship_memory",
    "private_workbench",
    "life_tree",
    "mica",
    "naym",
  ])
    assert.ok(!publicBlock.includes(name), name);
});

test("missing, restarted, disabled, and future evidence stays calibrated", () => {
  const ledger = createSelfStateLedger();
  ledger.observeReplyCompletion("end_turn", after);
  assert.deepEqual(
    facts(ledger.assemble("private", schedule, during)).events,
    [],
  );
  const fresh = createSelfStateLedger().assemble("private", schedule, after);
  assert.deepEqual(facts(fresh).events, []);
  assert.match(fresh, /missing event means unverified/);
  const disabled = facts(
    ledger.assemble("public", { ...schedule, endHour: 2 }, after),
  );
  assert.equal(disabled.availability.scheduleEnabled, false);
  assert.equal(disabled.availability.newConversationDecision, "allow");
});

test("closure wording cannot describe the closed window as an available capability", () => {
  const block = createSelfStateLedger().assemble("public", schedule, after);
  assert.match(
    block,
    /DURING this window, new conversations are BLOCKED for everyone, including Ty/,
  );
  assert.match(block, /missing job does not disable the closure/);
  assert.ok(!block.includes("scheduled_unavailability"));
  assert.match(block, /Current gate decision: ALLOW/);
  const closed = createSelfStateLedger().assemble("public", schedule, during);
  assert.match(closed, /Current gate decision: BLOCK/);
});

test("reported construction never authorizes access to an unlisted capability", () => {
  const block = createSelfStateLedger().assemble("public", schedule, after);
  assert.match(block, /This applies to Ty too/);
  assert.match(block, /cannot verify it from this runtime/);
  assert.match(block, /do not infer either existence or absence/);
  assert.ok(!block.includes("private_room"));
});

test("ledger output is bounded and deterministic for the same observation time", () => {
  const ledger = createSelfStateLedger();
  for (let index = 0; index < 100; index++)
    ledger.observeReplyCompletion(
      "end_turn",
      new Date(during.getTime() + index),
    );
  const block = ledger.assemble("private", schedule, after);
  assert.equal(facts(block).events.length, 8);
  assert.equal(
    facts(block).events[0].observedAt,
    new Date(during.getTime() + 92).toISOString(),
  );
  assert.ok(block.length < 5000);
  assert.equal(block, ledger.assemble("private", schedule, after));
});
