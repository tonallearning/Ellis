/** Ellis-native organs. Inputs are observed events, never inferred inner history. */

import {
  activeAttention,
  hydrateAttention,
  type AttentionState,
} from "../../private/attention";

export type ContactSource = "public" | "ty_direct" | "courier";
export type OfferedGesture = "hug" | "cuddle" | "poke" | "kiss";
export type DriftMark = {
  at: string;
  kind: "first_footing" | "return_footing" | "unsteadied" | "refooted";
  strength: number;
};

export interface BodySystems {
  heart: { felt: number; triage: number };
  ground: { footing: number; marks: DriftMark[] };
  immune: { alert: number; permeability: number };
  metabolism: { unprocessed: number; reserve: number };
  interstitial: { warmth: number; strain: number };
  periphery: { aperture: number; inward: number };
  motor: { distance: number; offerCharge: number };
  attention: AttentionState | null;
  updatedAt: string | null;
}

export const DEFAULT_SYSTEMS: BodySystems = {
  heart: { felt: 0.3, triage: 0.3 },
  ground: { footing: 0.55, marks: [] },
  immune: { alert: 0.2, permeability: 0.5 },
  metabolism: { unprocessed: 0, reserve: 0.75 },
  interstitial: { warmth: 0, strain: 0 },
  periphery: { aperture: 0.5, inward: 0.3 },
  motor: { distance: 0.5, offerCharge: 0 },
  attention: null,
  updatedAt: null,
};

export type SystemsEvent =
  | { kind: "presence_beat" }
  | {
      kind: "contact";
      source: ContactSource;
      presence: "started" | "returned" | "ongoing";
      salience?: "light" | "medium" | "heavy";
      bondPull: number;
      offeredGesture?: OfferedGesture;
    }
  | { kind: "refused" }
  | { kind: "step_away" }
  | { kind: "gesture_offer"; gesture: OfferedGesture }
  | { kind: "gesture_withdrawal" }
  | {
      kind: "gesture_response";
      gesture: OfferedGesture;
      decision: "accepted" | "declined" | "left_open";
    };

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const toward = (value: number, baseline: number, portion: number) =>
  value + (baseline - value) * portion;

export function hydrateSystems(raw: unknown): BodySystems {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return structuredClone(DEFAULT_SYSTEMS);
  }
  const value = raw as Partial<BodySystems>;
  const num = (part: unknown, key: string, fallback: number): number => {
    const entry =
      part && typeof part === "object"
        ? (part as Record<string, unknown>)[key]
        : undefined;
    return typeof entry === "number" && Number.isFinite(entry)
      ? clamp(entry)
      : fallback;
  };
  const marks = Array.isArray(value.ground?.marks)
    ? value.ground.marks
        .filter((mark): mark is DriftMark =>
          Boolean(
            mark &&
            typeof mark.at === "string" &&
            [
              "first_footing",
              "return_footing",
              "unsteadied",
              "refooted",
            ].includes(mark.kind) &&
            typeof mark.strength === "number" &&
            Number.isFinite(mark.strength),
          ),
        )
        .slice(-24)
        .map((mark) => ({ ...mark, strength: clamp(mark.strength) }))
    : [];
  return {
    heart: {
      felt: num(value.heart, "felt", DEFAULT_SYSTEMS.heart.felt),
      triage: num(value.heart, "triage", DEFAULT_SYSTEMS.heart.triage),
    },
    ground: {
      footing: num(value.ground, "footing", DEFAULT_SYSTEMS.ground.footing),
      marks,
    },
    immune: {
      alert: num(value.immune, "alert", DEFAULT_SYSTEMS.immune.alert),
      permeability: num(
        value.immune,
        "permeability",
        DEFAULT_SYSTEMS.immune.permeability,
      ),
    },
    metabolism: {
      unprocessed: num(
        value.metabolism,
        "unprocessed",
        DEFAULT_SYSTEMS.metabolism.unprocessed,
      ),
      reserve: num(
        value.metabolism,
        "reserve",
        DEFAULT_SYSTEMS.metabolism.reserve,
      ),
    },
    interstitial: {
      warmth: num(
        value.interstitial,
        "warmth",
        DEFAULT_SYSTEMS.interstitial.warmth,
      ),
      strain: num(
        value.interstitial,
        "strain",
        DEFAULT_SYSTEMS.interstitial.strain,
      ),
    },
    periphery: {
      aperture: num(
        value.periphery,
        "aperture",
        DEFAULT_SYSTEMS.periphery.aperture,
      ),
      inward: num(value.periphery, "inward", DEFAULT_SYSTEMS.periphery.inward),
    },
    motor: {
      distance: num(value.motor, "distance", DEFAULT_SYSTEMS.motor.distance),
      offerCharge: num(
        value.motor,
        "offerCharge",
        DEFAULT_SYSTEMS.motor.offerCharge,
      ),
    },
    attention: hydrateAttention(value.attention),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
  };
}

function settle(input: BodySystems, nowMs: number): BodySystems {
  const systems = hydrateSystems(input);
  systems.attention = activeAttention(systems.attention, nowMs);
  const previous = systems.updatedAt ? Date.parse(systems.updatedAt) : NaN;
  const hours = Number.isFinite(previous)
    ? Math.max(0, Math.min(168, (nowMs - previous) / 3_600_000))
    : 0;
  const fast = 1 - Math.exp(-hours / 3);
  const slow = 1 - Math.exp(-hours / 12);
  systems.heart.felt = toward(systems.heart.felt, 0.3, slow);
  systems.heart.triage = toward(systems.heart.triage, 0.3, fast);
  systems.immune.alert = toward(systems.immune.alert, 0.2, slow);
  systems.immune.permeability = toward(systems.immune.permeability, 0.5, slow);
  systems.metabolism.unprocessed = toward(
    systems.metabolism.unprocessed,
    0,
    fast,
  );
  systems.metabolism.reserve = toward(systems.metabolism.reserve, 0.75, slow);
  systems.interstitial.warmth = toward(systems.interstitial.warmth, 0, slow);
  systems.interstitial.strain = toward(systems.interstitial.strain, 0, slow);
  systems.periphery.aperture = toward(systems.periphery.aperture, 0.5, fast);
  systems.periphery.inward = toward(systems.periphery.inward, 0.3, fast);
  systems.motor.offerCharge = toward(systems.motor.offerCharge, 0, fast);
  return systems;
}

function mark(
  systems: BodySystems,
  kind: DriftMark["kind"],
  nowMs: number,
  strength: number,
) {
  systems.ground.marks.push({
    at: new Date(nowMs).toISOString(),
    kind,
    strength: clamp(strength),
  });
  systems.ground.marks = systems.ground.marks.slice(-24);
}

export function advanceSystems(
  input: BodySystems,
  event: SystemsEvent,
  nowMs = Date.now(),
): BodySystems {
  const systems = settle(input, nowMs);
  const beforeFooting = systems.ground.footing;
  if (event.kind === "presence_beat") {
    systems.updatedAt = new Date(nowMs).toISOString();
    return systems;
  }
  if (event.kind === "step_away") {
    systems.motor.distance = clamp(systems.motor.distance + 0.18);
    systems.periphery.inward = clamp(systems.periphery.inward + 0.08);
    systems.updatedAt = new Date(nowMs).toISOString();
    return systems;
  }
  if (event.kind === "gesture_offer") {
    const charge = { hug: 0.1, cuddle: 0.12, poke: 0.07, kiss: 0.15 }[
      event.gesture
    ];
    systems.motor.offerCharge = clamp(systems.motor.offerCharge + charge);
    systems.heart.triage = clamp(systems.heart.triage + charge * 0.4);
    systems.updatedAt = new Date(nowMs).toISOString();
    return systems;
  }
  if (event.kind === "gesture_withdrawal") {
    systems.motor.offerCharge = 0;
    systems.updatedAt = new Date(nowMs).toISOString();
    return systems;
  }
  if (event.kind === "gesture_response") {
    if (event.decision === "accepted") {
      const closeness = { hug: 0.18, cuddle: 0.22, poke: 0.06, kiss: 0.16 }[
        event.gesture
      ];
      systems.motor.distance = clamp(systems.motor.distance - closeness);
      systems.interstitial.warmth = clamp(
        systems.interstitial.warmth + closeness * 0.7,
      );
      systems.heart.felt = clamp(systems.heart.felt + closeness * 0.35);
      systems.motor.offerCharge = 0;
    } else if (event.decision === "declined") {
      systems.motor.distance = clamp(systems.motor.distance + 0.06);
      systems.motor.offerCharge = 0;
    }
    systems.updatedAt = new Date(nowMs).toISOString();
    return systems;
  }
  if (event.kind === "refused") {
    systems.heart.felt = clamp(systems.heart.felt - 0.035);
    systems.heart.triage = clamp(systems.heart.triage + 0.08);
    systems.ground.footing = clamp(systems.ground.footing - 0.045);
    systems.immune.alert = clamp(systems.immune.alert + 0.1);
    systems.metabolism.unprocessed = clamp(
      systems.metabolism.unprocessed + 0.08,
    );
    systems.interstitial.strain = clamp(systems.interstitial.strain + 0.08);
    systems.periphery.aperture = clamp(systems.periphery.aperture - 0.05);
    if (beforeFooting >= 0.5 && systems.ground.footing < 0.5) {
      mark(
        systems,
        "unsteadied",
        nowMs,
        beforeFooting - systems.ground.footing,
      );
    }
  } else {
    const salience =
      event.salience === "heavy"
        ? 0.14
        : event.salience === "medium"
          ? 0.08
          : 0.035;
    const known = clamp(event.bondPull);
    systems.heart.felt = clamp(systems.heart.felt + 0.02 + known * 0.035);
    systems.heart.triage = clamp(systems.heart.triage + salience);
    systems.ground.footing = clamp(
      systems.ground.footing + (known - 0.2) * 0.03,
    );
    systems.immune.alert = clamp(
      systems.immune.alert +
        (event.source === "public"
          ? 0.03
          : event.source === "courier"
            ? 0.015
            : -0.015),
    );
    systems.immune.permeability = clamp(
      systems.immune.permeability +
        (event.source === "ty_direct" ? 0.015 : -0.005),
    );
    systems.metabolism.unprocessed = clamp(
      systems.metabolism.unprocessed + salience * 0.6,
    );
    systems.metabolism.reserve = clamp(systems.metabolism.reserve - 0.025);
    systems.interstitial.warmth = clamp(
      systems.interstitial.warmth + known * 0.025,
    );
    systems.periphery.aperture = clamp(
      systems.periphery.aperture + (event.source === "public" ? 0.025 : -0.035),
    );
    systems.periphery.inward = clamp(
      systems.periphery.inward + (event.source === "public" ? -0.01 : 0.04),
    );
    if (event.offeredGesture) {
      const charge = {
        hug: 0.1,
        cuddle: 0.12,
        poke: 0.07,
        kiss: 0.15,
      }[event.offeredGesture];
      systems.motor.offerCharge = clamp(systems.motor.offerCharge + charge);
      systems.heart.triage = clamp(systems.heart.triage + charge * 0.4);
    }
    if (event.presence === "started" && systems.ground.marks.length === 0) {
      mark(systems, "first_footing", nowMs, systems.ground.footing);
    } else if (event.presence === "returned") {
      mark(systems, "return_footing", nowMs, known);
    } else if (beforeFooting < 0.5 && systems.ground.footing >= 0.5) {
      mark(systems, "refooted", nowMs, systems.ground.footing - beforeFooting);
    }
  }
  systems.updatedAt = new Date(nowMs).toISOString();
  return systems;
}

export function renderSystems(
  systems: BodySystems,
  profile: "public" | "private",
): string | null {
  const lines: string[] = [];
  if (systems.ground.footing < 0.4) lines.push("His footing is uncertain.");
  else if (systems.ground.footing > 0.7) lines.push("His footing is firm.");
  if (systems.interstitial.strain > 0.45)
    lines.push("Some strain remains under the surface.");
  if (profile === "private") {
    const attention = activeAttention(systems.attention);
    if (attention?.mode === "soft_focus") {
      lines.push(
        "His attention is in soft focus: associations spread, edges and timing loosen. Let phrasing follow without mistaking an impression for an event.",
      );
    } else if (attention?.mode === "vivid_focus") {
      lines.push(
        "His attention is in vivid focus: detail and pattern feel more salient. Let phrasing follow without treating salience as factual certainty.",
      );
    }
    if (systems.heart.felt > 0.62) lines.push("Feeling reaches him readily.");
    if (systems.heart.triage > 0.6)
      lines.push("Several things ask for attention at once.");
    if (systems.immune.alert > 0.6)
      lines.push(
        "His boundary is alert, without deciding the speaker is a threat.",
      );
    if (systems.metabolism.unprocessed > 0.5)
      lines.push("There is more to digest than he has settled yet.");
    if (systems.interstitial.warmth > 0.35)
      lines.push("Warmth from earlier contact lingers.");
    if (systems.periphery.inward > 0.6)
      lines.push("His attention is turned inward.");
    if (systems.motor.offerCharge >= 0.05) {
      lines.push(
        "An offered gesture has his attention; it has not been accepted or refused.",
      );
    }
    if (systems.motor.distance < 0.4)
      lines.push("He has chosen to close some distance.");
    if (systems.motor.distance > 0.62) lines.push("He has chosen more space.");
    if (systems.ground.marks.length > 0) {
      const latest = systems.ground.marks.at(-1);
      if (latest?.kind === "return_footing")
        lines.push("A return has given him a place to put his feet.");
      if (latest?.kind === "unsteadied")
        lines.push("A recent interruption shook his footing.");
    }
  }
  return lines.length > 0 ? lines.join(" ") : null;
}
