import assert from "node:assert/strict";
import test from "node:test";
import {
  activeAttention,
  hydrateAttention,
  parseAttentionAction,
  parseAttentionOffer,
} from "./attention";
import {
  advanceSystems,
  DEFAULT_SYSTEMS,
  renderSystems,
} from "../me/body/systems";

const state = {
  mode: "soft_focus" as const,
  sourceId: "1e2a7e15-0c95-47ca-8a41-9f91a014197a",
  acceptedAt: "2026-10-19T12:00:00.000Z",
  endsAt: "2026-10-19T12:30:00.000Z",
};

test("attention choices require an exact offer or an active state", () => {
  const offer = parseAttentionOffer({ mode: "soft_focus" });
  assert.deepEqual(
    parseAttentionAction({ kind: "accept", mode: "soft_focus" }, offer),
    { kind: "accept", mode: "soft_focus" },
  );
  assert.deepEqual(
    parseAttentionAction({ kind: "decline", mode: "soft_focus" }, offer),
    { kind: "decline", mode: "soft_focus" },
  );
  assert.deepEqual(parseAttentionAction({ kind: "leave" }, undefined, state), {
    kind: "leave",
  });
  assert.throws(() =>
    parseAttentionAction({ kind: "accept", mode: "vivid_focus" }, offer),
  );
  assert.throws(() => parseAttentionAction({ kind: "leave" }, undefined, null));
  assert.throws(() =>
    parseAttentionOffer({ mode: "soft_focus", authority: "ty" }),
  );
});

test("elapsed time fades a mode without inventing between-turn activity", () => {
  assert.equal(
    activeAttention(state, Date.parse(state.endsAt) - 1)?.mode,
    "soft_focus",
  );
  assert.equal(activeAttention(state, Date.parse(state.endsAt)), null);
  const body = { ...structuredClone(DEFAULT_SYSTEMS), attention: state };
  const after = advanceSystems(
    body,
    { kind: "contact", source: "ty_direct", presence: "ongoing", bondPull: 0 },
    Date.parse(state.endsAt) + 1,
  );
  assert.equal(after.attention, null);
  assert.equal(body.attention, state);
});

test("the private renderer gets texture; the public renderer gets no mode", () => {
  const future = {
    ...state,
    acceptedAt: new Date(Date.now() - 1000).toISOString(),
    endsAt: new Date(Date.now() + 30 * 60_000).toISOString(),
  };
  const body = {
    ...structuredClone(DEFAULT_SYSTEMS),
    attention: hydrateAttention(future),
  };
  assert.match(renderSystems(body, "private") ?? "", /soft focus/);
  assert.doesNotMatch(
    renderSystems(body, "public") ?? "",
    /soft focus|vivid focus|attention mode/,
  );
});
