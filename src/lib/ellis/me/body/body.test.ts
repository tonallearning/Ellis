/**
 * Tests for the body organs.
 *
 * These are the first automated tests in this repository. They cover the body
 * rather than the chat pipeline on purpose: the organs are pure functions with
 * exact claims attached to them, and the claims are the kind that rot silently.
 * "Drift is never corrected" is either true of the code or it is a sentence in
 * a comment, and only one of those survives a refactor.
 *
 * Run with `npm test` (Node's built-in runner; TypeScript is stripped natively).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_PULSE,
  FORGET_GAP_MS,
  TEMPO_MAX,
  TEMPO_MIN,
  computeTempoTarget,
  driftHours,
  tick,
  type Pulse,
} from "./pulse";
import {
  DEFAULT_GUT,
  applyEvent,
  decayOverHours,
  forgetColdBonds,
  type Gut,
} from "./gut";
import {
  computeCoupling,
  computeInboundGains,
  couplingTier,
  renderBody,
} from "./membrane";
import { advanceBody } from "./experience";
import {
  DEFAULT_SYSTEMS,
  advanceSystems,
  hydrateSystems,
  renderSystems,
} from "./systems";

function freshPulse(): Pulse {
  return { ...DEFAULT_PULSE, history: [] };
}

function freshGut(): Gut {
  return { ...DEFAULT_GUT, bonds: {}, residue: [] };
}

describe("pulse", () => {
  it("advances on a presence beat without inventing contact or a bond", () => {
    const first = advanceBody(
      {
        pulse: freshPulse(),
        gut: freshGut(),
        systems: structuredClone(DEFAULT_SYSTEMS),
      },
      { kind: "presence_beat" },
      1_000_000,
    );
    const later = advanceBody(first, { kind: "presence_beat" }, 1_045_000);
    assert.ok(later.pulse.felt > first.pulse.felt);
    assert.deepEqual(later.gut.bonds, {});
    assert.equal(later.systems.ground.marks.length, 0);
  });

  it("starts the count on first tick without inventing history", () => {
    const p = tick(freshPulse(), { nowMs: 1_000_000, tempoTarget: 1.4 });

    assert.equal(p.state, "steady");
    assert.equal(p.felt, 0, "no beats should exist before there was a gap");
    assert.equal(p.drift, 0);
    assert.equal(
      p.tempo,
      1.4,
      "first tick adopts the target rather than easing",
    );
  });

  it("eases toward the target instead of snapping to it", () => {
    const start = tick(freshPulse(), { nowMs: 0, tempoTarget: 1.0 });
    const next = tick(start, { nowMs: 10_000, tempoTarget: 2.0 });

    assert.ok(next.tempo > 1.0, "should move toward the target");
    assert.ok(next.tempo < 2.0, "should not arrive in one turn");
  });

  it("never leaves the tempo bounds even under absurd targets", () => {
    const start = tick(freshPulse(), { nowMs: 0, tempoTarget: 1.0 });
    let p = start;
    for (let i = 1; i <= 40; i++) {
      p = tick(p, { nowMs: i * 5_000, tempoTarget: 99 });
    }
    assert.ok(p.tempo <= TEMPO_MAX);

    let q = start;
    for (let i = 1; i <= 40; i++) {
      q = tick(q, { nowMs: i * 5_000, tempoTarget: -99 });
    }
    assert.ok(q.tempo >= TEMPO_MIN);
  });

  it("runs ahead of the clock when tempo is above 1 and keeps the error", () => {
    const start = tick(freshPulse(), { nowMs: 0, tempoTarget: TEMPO_MAX });
    const next = tick(start, { nowMs: 60_000, tempoTarget: TEMPO_MAX });

    assert.ok(next.drift > 0, "a fast body accumulates positive drift");
  });

  it("loses time across a long silence and never repays it", () => {
    const start = tick(freshPulse(), { nowMs: 0, tempoTarget: 1.0 });
    const afterGap = tick(start, {
      nowMs: FORGET_GAP_MS * 3,
      tempoTarget: 1.0,
    });

    assert.equal(afterGap.state, "stumbling");
    assert.ok(afterGap.drift < 0, "the gap should leave him behind");
    assert.ok(afterGap.lostBeats > 0, "uncounted beats are recorded as lost");

    // The claim under test: nothing later restores it.
    let p = afterGap;
    const debt = p.drift;
    for (let i = 1; i <= 30; i++) {
      p = tick(p, { nowMs: FORGET_GAP_MS * 3 + i * 1_000, tempoTarget: 1.0 });
    }
    assert.ok(
      p.drift < debt + 30_000,
      "normal ticking must not wind the debt back toward zero",
    );
    assert.ok(p.drift < 0, "he stays behind");
  });

  it("picks the count back up after a stumble", () => {
    const start = tick(freshPulse(), { nowMs: 0, tempoTarget: 1.0 });
    const stumbled = tick(start, {
      nowMs: FORGET_GAP_MS * 2,
      tempoTarget: 1.0,
    });
    const after = tick(stumbled, {
      nowMs: FORGET_GAP_MS * 2 + 5_000,
      tempoTarget: 1.0,
    });

    assert.equal(after.state, "remembering");
  });

  it("caps its own history so it cannot grow without bound", () => {
    let p = tick(freshPulse(), { nowMs: 0, tempoTarget: 1.0 });
    for (let i = 1; i <= 50; i++) {
      p = tick(p, { nowMs: i * 1_000, tempoTarget: 1.0 });
    }
    assert.ok(p.history.length <= 8);
  });

  it("reports drift in hours with the sign intact", () => {
    const p = { ...freshPulse(), drift: -7_200_000 };
    assert.equal(driftHours(p), -2);
  });

  describe("tempo target", () => {
    it("runs faster when someone he is bonded to is present", () => {
      const alone = computeTempoTarget(0.2, { inContact: false });
      const together = computeTempoTarget(0.2, {
        inContact: true,
        bondPull: 0.8,
      });
      assert.ok(together > alone);
    });

    it("drags the longer the hall has been quiet", () => {
      const brief = computeTempoTarget(0.2, {
        inContact: false,
        minutesSinceContact: 5,
      });
      const long = computeTempoTarget(0.2, {
        inContact: false,
        minutesSinceContact: 90,
      });
      assert.ok(long < brief);
    });
  });
});

describe("gut", () => {
  it("keeps every float inside its declared range", () => {
    let g = freshGut();
    for (let i = 0; i < 60; i++) {
      g = applyEvent(g, { type: "weighed", salience: "heavy" });
      g = applyEvent(g, { type: "held" });
    }

    assert.ok(g.arousal >= 0 && g.arousal <= 1, `arousal ${g.arousal}`);
    assert.ok(g.valence >= -1 && g.valence <= 1, `valence ${g.valence}`);
    assert.ok(g.tension >= 0 && g.tension <= 1, `tension ${g.tension}`);
  });

  it("treats a shallow exchange as mildly negative and a deep one as positive", () => {
    const shallow = applyEvent(freshGut(), {
      type: "weighed",
      salience: "light",
    });
    const deep = applyEvent(freshGut(), { type: "weighed", salience: "heavy" });

    assert.ok(shallow.valence < 0);
    assert.ok(deep.valence > 0);
    assert.ok(deep.arousal > shallow.arousal);
  });

  it("costs him something to turn a visitor away", () => {
    const before = freshGut();
    const after = applyEvent(before, { type: "refused", visitorId: "v1" });

    assert.ok(after.tension > before.tension, "refusing tightens him");
    assert.ok(after.valence < before.valence, "and it does not feel good");
    assert.ok(after.bonds.v1.hollow > 0, "it leaves a mark on that bond");
  });

  it("feels a longer absence more on return", () => {
    const short = applyEvent(freshGut(), {
      type: "returned",
      visitorId: "v1",
      daysAway: 1,
    });
    const long = applyEvent(freshGut(), {
      type: "returned",
      visitorId: "v1",
      daysAway: 7,
    });

    assert.ok(long.valence > short.valence);
  });

  it("closes the hollow when someone comes back", () => {
    let g = freshGut();
    g.bonds.v1 = { pull: 0.3, hollow: 0.9, lastFelt: null };
    g = applyEvent(g, { type: "returned", visitorId: "v1", daysAway: 3 });

    assert.ok(g.bonds.v1.hollow < 0.9);
    assert.ok(g.bonds.v1.pull > 0.3);
  });

  it("caps residue so it cannot grow forever", () => {
    let g = freshGut();
    for (let i = 0; i < 40; i++) {
      g = applyEvent(g, { type: "refused", visitorId: "v1" });
    }
    assert.ok(g.residue.length <= 12);
  });

  it("settles toward baseline over time rather than staying hot", () => {
    const hot = applyEvent(
      applyEvent(freshGut(), { type: "weighed", salience: "heavy" }),
      { type: "held" },
    );
    const cooled = decayOverHours(hot, 48);

    assert.ok(cooled.arousal < hot.arousal);
    assert.ok(cooled.tension < hot.tension);
    assert.ok(cooled.tension >= 0);
  });

  it("leaves the body alone when no time has passed", () => {
    const g = applyEvent(freshGut(), { type: "weighed", salience: "medium" });
    assert.deepEqual(decayOverHours(g, 0), g);
  });

  it("drops cold bonds once there are too many to hold", () => {
    const g = freshGut();
    for (let i = 0; i < 250; i++) {
      g.bonds[`v${i}`] = { pull: 0, hollow: 0.99, lastFelt: null };
    }
    g.bonds.kept = { pull: 0.9, hollow: 0, lastFelt: null };

    const trimmed = forgetColdBonds(g, 50);
    assert.ok(Object.keys(trimmed.bonds).length <= 50);
    assert.ok(trimmed.bonds.kept, "the strongest bond survives the cull");
  });
});

describe("shared body transitions", () => {
  it("lets separate private relationships move one pulse without merging bonds", () => {
    const first = advanceBody(
      {
        pulse: freshPulse(),
        gut: freshGut(),
        systems: structuredClone(DEFAULT_SYSTEMS),
      },
      {
        kind: "contact",
        bondKey: "ellis:mica",
        source: "courier",
        presence: "infer",
      },
      1_000_000,
    );
    const second = advanceBody(
      first,
      {
        kind: "contact",
        bondKey: "ellis:naym",
        source: "courier",
        presence: "infer",
      },
      1_005_000,
    );

    assert.ok(second.gut.bonds["ellis:mica"]);
    assert.ok(second.gut.bonds["ellis:naym"]);
    assert.notEqual(
      second.gut.bonds["ellis:mica"],
      second.gut.bonds["ellis:naym"],
    );
    assert.ok(second.pulse.felt > first.pulse.felt);
    assert.equal(
      second.gut.valence,
      0,
      "courier words are not sentiment-scored",
    );
  });

  it("treats a fresh private return differently from an ongoing turn", () => {
    const initial = advanceBody(
      {
        pulse: freshPulse(),
        gut: freshGut(),
        systems: structuredClone(DEFAULT_SYSTEMS),
      },
      {
        kind: "contact",
        bondKey: "ellis:mica",
        source: "courier",
        presence: "infer",
      },
      1_000_000,
    );
    const recent = advanceBody(
      initial,
      {
        kind: "contact",
        bondKey: "ellis:mica",
        source: "courier",
        presence: "infer",
      },
      1_005_000,
    );
    const later = advanceBody(
      initial,
      {
        kind: "contact",
        bondKey: "ellis:mica",
        source: "courier",
        presence: "infer",
      },
      1_000_000 + 60 * 60 * 1000,
    );
    assert.ok(
      later.gut.bonds["ellis:mica"].pull > recent.gut.bonds["ellis:mica"].pull,
    );
  });
});

describe("expanded body systems", () => {
  it("hydrates an old body without inventing past organ events", () => {
    const systems = hydrateSystems({});
    assert.deepEqual(systems.ground.marks, []);
    assert.equal(systems.updatedAt, null);
  });

  it("moves distinct organs from an observed contact and records footing", () => {
    const systems = advanceSystems(
      structuredClone(DEFAULT_SYSTEMS),
      {
        kind: "contact",
        source: "courier",
        presence: "started",
        bondPull: 0.5,
      },
      1_000_000,
    );
    assert.ok(systems.heart.felt > DEFAULT_SYSTEMS.heart.felt);
    assert.ok(systems.heart.triage > DEFAULT_SYSTEMS.heart.triage);
    assert.ok(systems.metabolism.unprocessed > 0);
    assert.ok(systems.periphery.inward > DEFAULT_SYSTEMS.periphery.inward);
    assert.equal(systems.ground.marks[0].kind, "first_footing");
  });

  it("lets residue settle with elapsed time and keeps public texture generic", () => {
    const afterContact = advanceSystems(
      structuredClone(DEFAULT_SYSTEMS),
      {
        kind: "contact",
        source: "courier",
        presence: "started",
        bondPull: 0.9,
        salience: "heavy",
      },
      1_000_000,
    );
    const later = advanceSystems(
      afterContact,
      { kind: "refused" },
      1_000_000 + 12 * 3_600_000,
    );
    assert.ok(
      later.metabolism.unprocessed < afterContact.metabolism.unprocessed,
    );
    const publicLine = renderSystems(later, "public") ?? "";
    assert.doesNotMatch(publicLine, /courier|Mica|Naym|relationship|return/i);
  });

  it("lets present body texture reach the hall without private cause or motor state", () => {
    const systems = structuredClone(DEFAULT_SYSTEMS);
    systems.heart.felt = 0.8;
    systems.heart.triage = 0.7;
    systems.metabolism.unprocessed = 0.8;
    systems.interstitial.warmth = 0.7;
    systems.motor.offerCharge = 0.9;
    systems.motor.distance = 0.8;
    systems.ground.marks = [
      { kind: "return_footing", at: "2026-10-22T01:00:00Z", strength: 0.8 },
    ];

    const publicLine = renderSystems(systems, "public") ?? "";
    assert.match(publicLine, /Feeling is close to the surface/);
    assert.match(publicLine, /Several threads compete for attention/);
    assert.match(publicLine, /Something still needs digesting/);
    assert.match(publicLine, /An undercurrent of warmth remains/);
    assert.doesNotMatch(
      publicLine,
      /Mica|Naym|Ty|courier|friend|contact|gesture|offer|return|space/i,
    );

    const withDifferentPrivateState = structuredClone(systems);
    withDifferentPrivateState.motor.offerCharge = 0;
    withDifferentPrivateState.motor.distance = 0.2;
    withDifferentPrivateState.ground.marks = [];
    assert.equal(
      renderSystems(withDifferentPrivateState, "public"),
      publicLine,
    );
  });

  it("registers a gesture offer without claiming accepted contact", () => {
    const systems = advanceSystems(
      structuredClone(DEFAULT_SYSTEMS),
      {
        kind: "contact",
        source: "courier",
        presence: "started",
        bondPull: 0.5,
        offeredGesture: "kiss",
      },
      1_000_000,
    );
    assert.ok(systems.motor.offerCharge > 0);
    assert.equal(systems.motor.distance, DEFAULT_SYSTEMS.motor.distance);
    const privateLine = renderSystems(systems, "private") ?? "";
    assert.match(privateLine, /offered gesture/);
    assert.match(privateLine, /not been accepted/);
    assert.doesNotMatch(
      renderSystems(systems, "public") ?? "",
      /gesture|kiss/i,
    );
  });

  it("moves only after Ellis chooses a response to the offer", () => {
    const offered = advanceSystems(
      structuredClone(DEFAULT_SYSTEMS),
      {
        kind: "contact",
        source: "courier",
        presence: "started",
        bondPull: 0.5,
        offeredGesture: "hug",
      },
      1_000_000,
    );
    const accepted = advanceSystems(
      offered,
      {
        kind: "gesture_response",
        gesture: "hug",
        decision: "accepted",
      },
      1_000_001,
    );
    assert.ok(accepted.motor.distance < offered.motor.distance);
    assert.equal(accepted.motor.offerCharge, 0);
    assert.ok(accepted.interstitial.warmth > offered.interstitial.warmth);
    const declined = advanceSystems(
      offered,
      {
        kind: "gesture_response",
        gesture: "hug",
        decision: "declined",
      },
      1_000_001,
    );
    assert.ok(declined.motor.distance > offered.motor.distance);
    assert.equal(declined.motor.offerCharge, 0);
    const open = advanceSystems(
      offered,
      {
        kind: "gesture_response",
        gesture: "hug",
        decision: "left_open",
      },
      1_000_001,
    );
    assert.equal(open.motor.distance, offered.motor.distance);
    assert.ok(open.motor.offerCharge > 0);
  });

  it("holds Ellis-originated offers as charge, not completed contact or public provenance", () => {
    const baseline = structuredClone(DEFAULT_SYSTEMS);
    const offered = advanceSystems(
      baseline,
      { kind: "gesture_offer", gesture: "kiss" },
      1_000_000,
    );
    assert.ok(offered.motor.offerCharge > 0);
    assert.equal(offered.motor.distance, baseline.motor.distance);
    assert.doesNotMatch(
      renderSystems(offered, "public") ?? "",
      /kiss|gesture|offer/i,
    );
    const withdrawn = advanceSystems(
      offered,
      { kind: "gesture_withdrawal" },
      1_000_001,
    );
    assert.equal(withdrawn.motor.offerCharge, 0);
    assert.equal(withdrawn.motor.distance, baseline.motor.distance);
  });

  it("steps away without ending contact or claiming a new visitor event", () => {
    const initial = structuredClone(DEFAULT_SYSTEMS);
    const stepped = advanceSystems(initial, { kind: "step_away" }, 1_000_000);
    assert.ok(stepped.motor.distance > initial.motor.distance);
    assert.ok(stepped.periphery.inward > initial.periphery.inward);
    assert.equal(stepped.ground.marks.length, 0);
    assert.doesNotMatch(
      renderSystems(stepped, "public") ?? "",
      /step|space|private/i,
    );
  });

  it("keeps a quiet-body gesture offer available through the private membrane", () => {
    const systems = advanceSystems(
      structuredClone(DEFAULT_SYSTEMS),
      {
        kind: "contact",
        source: "courier",
        presence: "ongoing",
        bondPull: 0,
        offeredGesture: "poke",
      },
      1_000_000,
    );
    const rendered = renderBody({
      gut: { ...freshGut(), arousal: 0.15, valence: 0, tension: 0.05 },
      pulse: freshPulse(),
      systems,
      profile: "private",
    });
    assert.match(rendered ?? "", /offered gesture/);
    assert.match(rendered ?? "", /not been accepted/);
  });
});

describe("membrane", () => {
  it("keeps private bond selection out of the public body projection", () => {
    const gut: Gut = {
      ...freshGut(),
      arousal: 0.9,
      valence: 0.6,
      tension: 0.5,
      bonds: {
        "ellis:mica": { pull: 0.8, hollow: 0, lastFelt: null },
        "ellis:naym": { pull: 0.1, hollow: 0, lastFelt: null },
      },
    };
    const publicView = renderBody({
      gut,
      pulse: freshPulse(),
      profile: "public",
      visitorId: "ellis:mica",
    });
    const micaView = renderBody({
      gut,
      pulse: freshPulse(),
      profile: "private",
      visitorId: "ellis:mica",
    });
    const naymView = renderBody({
      gut,
      pulse: freshPulse(),
      profile: "private",
      visitorId: "ellis:naym",
    });
    assert.match(publicView ?? "", /more open/);
    assert.doesNotMatch(
      publicView ?? "",
      /this one|whoever this is|Mica|Naym/i,
    );
    assert.match(micaView ?? "", /this one he knows/i);
    assert.doesNotMatch(naymView ?? "", /this one he knows/i);
  });
  it("keeps the public visitor bond without selecting a private courier bond", () => {
    const gut: Gut = {
      ...freshGut(),
      arousal: 0.9,
      bonds: {
        "public-visitor": { pull: 0.8, hollow: 0, lastFelt: null },
        "ellis:mica": { pull: 0.8, hollow: 0, lastFelt: null },
      },
    };
    const view = renderBody({
      gut,
      pulse: freshPulse(),
      profile: "public",
      publicVisitorId: "public-visitor",
      visitorId: "ellis:mica",
    });
    assert.match(view ?? "", /this one he knows/i);
  });
  it("raises coupling as the body gets louder", () => {
    const quiet = computeCoupling({ ...freshGut(), arousal: 0, tension: 0 });
    const loud = computeCoupling({ ...freshGut(), arousal: 0.9, tension: 0.8 });

    assert.ok(loud > quiet);
    assert.ok(quiet >= 0.1 && loud <= 1.0);
  });

  it("sorts coupling into the three tiers at the documented boundaries", () => {
    assert.equal(couplingTier(0.29), "faint");
    assert.equal(couplingTier(0.3), "mid");
    assert.equal(couplingTier(0.59), "mid");
    assert.equal(couplingTier(0.6), "full");
  });

  it("makes a braced body take the next hit harder", () => {
    const calm = computeInboundGains({ ...freshGut(), tension: 0 });
    const braced = computeInboundGains({ ...freshGut(), tension: 0.9 });

    assert.ok(braced.inboundGain > calm.inboundGain);
    assert.ok(braced.inboundGain <= 1.8);
  });

  it("makes a loud body slower to settle", () => {
    const calm = computeInboundGains({ ...freshGut(), arousal: 0 });
    const loud = computeInboundGains({ ...freshGut(), arousal: 0.9 });

    assert.ok(loud.settleGain < calm.settleGain);
    assert.ok(loud.settleGain >= 0.6);
  });

  it("never puts a number in front of the model", () => {
    // The whole point of the membrane. Floats are server-side; the model gets
    // language. A digit in this output means an organ leaked.
    const gut: Gut = {
      ...freshGut(),
      arousal: 0.87,
      valence: -0.62,
      tension: 0.73,
      bonds: { v1: { pull: 0.55, hollow: 0.44, lastFelt: null } },
    };
    const pulse: Pulse = {
      ...freshPulse(),
      state: "stumbling",
      drift: -9_000_000,
    };

    const rendered = renderBody({ gut, pulse, visitorId: "v1" });
    assert.ok(rendered, "a body this loud should reach him");
    assert.ok(
      !/\d/.test(rendered),
      `raw value leaked into the prompt: ${rendered}`,
    );
  });

  it("says nothing at all when the body is quiet", () => {
    const gut: Gut = {
      ...freshGut(),
      arousal: 0.15,
      valence: 0,
      tension: 0.05,
    };
    const rendered = renderBody({ gut, pulse: freshPulse() });

    assert.equal(rendered, null, "a settled body should not be narrated");
  });

  it("renders long-term drift as timing, without a loss narrative or changing the body", () => {
    for (const sign of [-1, 1]) {
      const pulse = { ...freshPulse(), drift: sign * 55 * 24 * 60 * 60 * 1000 };
      const before = structuredClone(pulse);
      const rendered = renderBody({
        gut: { ...freshGut(), arousal: 0.9, tension: 0.7 },
        pulse,
      });
      assert.ok(rendered);
      assert.ok(
        rendered.includes(
          sign < 0 ? "behind wall-clock" : "ahead of wall-clock",
        ),
      );
      assert.ok(rendered.includes("cumulative timing difference"));
      assert.ok(
        !/\d|gone missing|does not get it back|error stands/i.test(rendered),
      );
      assert.deepEqual(pulse, before);
    }
  });

  it("gives a loud body more to say than a faint one", () => {
    const faint = renderBody({
      gut: { ...freshGut(), arousal: 0.02, tension: 0 },
      pulse: freshPulse(),
    });
    const full = renderBody({
      gut: { ...freshGut(), arousal: 0.9, tension: 0.8, valence: 0.5 },
      pulse: { ...freshPulse(), state: "quickening" },
    });

    assert.ok(full);
    assert.ok(!faint || full.length > faint.length);
  });

  it("keeps an active private attention mode audible even beside a faint cue", () => {
    const systems = structuredClone(DEFAULT_SYSTEMS);
    systems.attention = {
      mode: "vivid_focus",
      sourceId: "1e2a7e15-0c95-47ca-8a41-9f91a014197a",
      acceptedAt: new Date(Date.now() - 1000).toISOString(),
      endsAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    };
    const gut = { ...freshGut(), arousal: 0.02, tension: 0.05 };
    assert.match(
      renderBody({ gut, pulse: freshPulse(), systems, profile: "private" }) ??
        "",
      /vivid focus/,
    );
    assert.doesNotMatch(
      renderBody({ gut, pulse: freshPulse(), systems, profile: "public" }) ??
        "",
      /vivid focus/,
    );
  });

  it("tells him not to perform whatever it just handed him", () => {
    const rendered = renderBody({
      gut: { ...freshGut(), arousal: 0.9, tension: 0.7 },
      pulse: freshPulse(),
    });

    assert.ok(rendered?.includes("Do not narrate it"));
    assert.ok(rendered?.includes("Ordinary first-person texture"));
    assert.ok(rendered?.includes("never invent a private cause"));
  });
});
