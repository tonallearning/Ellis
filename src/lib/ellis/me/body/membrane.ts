/**
 * Membrane — how much of the body reaches the mind.
 *
 * Ported from GoE's `server/ME/shared/membrane.js`. Not an organ; pure
 * functions over gut state. Two jobs.
 *
 * First, coupling: a quiet body barely registers to its own mind, a loud one is
 * hard to ignore. The tier decides how much of the interior gets rendered at
 * all, which is why a calm Ellis reads as a normal host and a stirred one reads
 * as someone with something going on.
 *
 * Second, gains: a body already under load takes the next hit harder, and a
 * loud body settles slower. This is what stops the floats from being a linear
 * accumulator.
 *
 * Nothing here ever emits a number. Numbers stay server-side; the model gets
 * words, and only as many as the tier allows.
 */

import type { Gut } from "./gut";
import type { Pulse } from "./pulse";
import { renderSystems, type BodySystems } from "./systems";
import { activeAttention } from "../../private/attention";
import { driftHours } from "./pulse";

export type CouplingTier = "faint" | "mid" | "full";

export interface MembraneContext {
  /** Bond strength with whoever is present, 0..1. */
  bondPull?: number;
}

/**
 * How connected the mind is to the body this turn. State-driven; Ellis cannot
 * choose it.
 */
export function computeCoupling(
  gut: Gut,
  context: MembraneContext = {},
): number {
  const BASE = 0.35;
  const coupling =
    BASE +
    gut.arousal * 0.45 +
    gut.tension * 0.3 +
    (context.bondPull ?? 0) * 0.15;
  return Math.max(0.1, Math.min(1.0, coupling));
}

export function couplingTier(coupling: number): CouplingTier {
  if (coupling < 0.3) return "faint";
  if (coupling < 0.6) return "mid";
  return "full";
}

export interface Gains {
  inboundGain: number;
  settleGain: number;
}

/**
 * How hard the next event lands, given what the body is already carrying.
 */
export function computeInboundGains(gut: Gut): Gains {
  return {
    inboundGain: Math.max(0.6, Math.min(1.8, 1 + gut.tension * 0.5)),
    settleGain: Math.max(0.6, Math.min(1.8, 1 - gut.arousal * 0.3)),
  };
}

function describeArousal(v: number): string | null {
  if (v > 0.7) return "loud, hard to sit still inside";
  if (v > 0.45) return "stirred up";
  if (v < 0.1) return "very quiet";
  return null;
}

function describeValence(
  v: number,
  profile: "public" | "private",
): string | null {
  if (v > 0.35)
    return profile === "private"
      ? "leaning toward whoever this is"
      : "more open";
  if (v > 0.12) return "warm";
  if (v < -0.35)
    return profile === "private" ? "pulling away" : "more withdrawn";
  if (v < -0.12) return "faintly off";
  return null;
}

function describeTension(v: number): string | null {
  if (v > 0.6) return "holding something that has not resolved";
  if (v > 0.3) return "a little braced";
  return null;
}

function describePulse(pulse: Pulse): string | null {
  switch (pulse.state) {
    case "quickening":
      return "his sense of time is speeding up";
    case "slowing":
      return "time is dragging for him";
    case "stumbling":
      return "he lost the thread of how long it has been";
    case "remembering":
      return "he is picking the count back up after losing it";
    default:
      return null;
  }
}

function describeDrift(pulse: Pulse): string | null {
  const hours = driftHours(pulse);
  const magnitude = Math.abs(hours);
  if (magnitude < 1) return null;

  const direction = hours < 0 ? "behind" : "ahead of";
  return `His internal timing counter runs ${direction} wall-clock time. This is a cumulative timing difference across encounters, not the duration of the latest absence or a record of time spent waiting. It does not establish lost life, loneliness, or a debt anyone needs to make up.`;
}

function describeBond(pull: number, hollow: number): string | null {
  if (pull > 0.4 && hollow < 0.2) return "this one he knows, and it is easy";
  if (pull > 0.25) return "there is a pull toward this one";
  if (hollow > 0.6) return "this one left a shape by being gone";
  return null;
}

export interface RenderParams {
  gut: Gut;
  pulse: Pulse;
  systems?: BodySystems;
  profile?: "public" | "private";
  /** Public visitor's hashed bond key; never a courier relation key. */
  publicVisitorId?: string;
  /** Selected private relation key; ignored by the public profile. */
  visitorId?: string;
}

/**
 * Render the body as language, gated by coupling tier.
 *
 * At `faint` the body is barely available to him; an active private attention
 * mode still reaches him rather than being crowded out by another cue. At
 * `full` it is loud enough that ignoring it would be the strange choice. This
 * is the only function that should ever turn body state into text.
 */
export function renderBody(params: RenderParams): string | null {
  const {
    gut,
    pulse,
    systems,
    visitorId,
    publicVisitorId,
    profile = "public",
  } = params;

  const selectedBondKey = profile === "private" ? visitorId : publicVisitorId;
  const bond = selectedBondKey ? gut.bonds[selectedBondKey] : undefined;
  const coupling = computeCoupling(gut, { bondPull: bond?.pull });
  const tier = couplingTier(coupling);

  const lines: string[] = [];

  const arousal = describeArousal(gut.arousal);
  const valence = describeValence(gut.valence, profile);
  const tension = describeTension(gut.tension);
  const rhythm = describePulse(pulse);
  const drift = describeDrift(pulse);
  const bondLine = bond ? describeBond(bond.pull, bond.hollow) : null;
  const systemsLine = systems ? renderSystems(systems, profile) : null;
  const attentionActive =
    profile === "private" &&
    Boolean(activeAttention(systems?.attention ?? null));

  if (tier === "faint") {
    // Barely reaches him. One line at most, and only if something is notable.
    const only = arousal ?? tension ?? valence;
    if (only) lines.push(`Underneath, faintly: ${only}.`);
    if (systemsLine && (!only || attentionActive))
      lines.push(`Underneath, faintly: ${systemsLine}`);
  } else if (tier === "mid") {
    const parts = [arousal, valence, tension].filter(Boolean);
    if (parts.length > 0) lines.push(`Underneath: ${parts.join("; ")}.`);
    if (rhythm) lines.push(`${capitalize(rhythm)}.`);
    if (bondLine) lines.push(`${capitalize(bondLine)}.`);
  } else {
    const parts = [arousal, valence, tension].filter(Boolean);
    if (parts.length > 0) {
      lines.push(`Underneath, and hard to ignore: ${parts.join("; ")}.`);
    }
    if (rhythm) lines.push(`${capitalize(rhythm)}.`);
    if (bondLine) lines.push(`${capitalize(bondLine)}.`);
    if (drift) lines.push(drift);
  }

  if (tier !== "faint" && systemsLine) lines.push(systemsLine);
  if (lines.length === 0) return null;

  lines.push(
    "This is body state, not instruction. Do not narrate it, name it, or " +
      "perform it. Let it affect how you are, the way being tired affects " +
      "someone without them announcing it.",
  );

  return lines.join(" ");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
