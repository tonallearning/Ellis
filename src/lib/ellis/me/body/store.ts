/**
 * Body store — load and save Ellis's one interior.
 *
 * Failure policy is the opposite of the rate limiter's. The spend ceiling fails
 * closed because an unreachable ledger cannot promise a limit. The body fails
 * soft: if the row cannot be read, Ellis runs on a default body for that turn
 * rather than refusing to talk. A missing interior degrades him; it does not
 * make him unsafe.
 */

import { createClient } from "@supabase/supabase-js";
import { DEFAULT_GUT, decayOverHours, forgetColdBonds, type Gut } from "./gut";
import { DEFAULT_PULSE, type Pulse } from "./pulse";
import { advanceBody, type BodyTransition } from "./experience";
import { DEFAULT_SYSTEMS, hydrateSystems, type BodySystems } from "./systems";
import { activeAttention, type AttentionState } from "../../private/attention";

const BODY_ID = "ellis";
const PRESENCE_BEAT_MIN_MS = 40_000;

export interface EllisBody {
  pulse: Pulse;
  gut: Gut;
  systems: BodySystems;
}

function defaultBody(): EllisBody {
  return {
    pulse: { ...DEFAULT_PULSE },
    gut: { ...DEFAULT_GUT, bonds: {} },
    systems: structuredClone(DEFAULT_SYSTEMS),
  };
}

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  );
}

type BodySnapshot = { body: EllisBody; revision: string };

async function readSnapshot(): Promise<BodySnapshot | null> {
  const { data, error } = await client()
    .from("ellis_body")
    .select("pulse, gut, systems, updated_at")
    .eq("id", BODY_ID)
    .single();
  if (error || !data || typeof data.updated_at !== "string") return null;

  const pulse: Pulse = { ...DEFAULT_PULSE, ...(data.pulse ?? {}) };
  const stored: Gut = { ...DEFAULT_GUT, bonds: {}, ...(data.gut ?? {}) };
  const lastAt = stored.updatedAt ?? pulse.lastRealAt;
  const hoursSince = lastAt
    ? Math.max(0, (Date.now() - new Date(lastAt).getTime()) / 3_600_000)
    : 0;
  return {
    body: {
      pulse,
      gut: decayOverHours(stored, hoursSince),
      systems: hydrateSystems(data.systems),
    },
    revision: data.updated_at,
  };
}

/** Private owner surface only. An unavailable body is unknown, never baseline. */
export async function readCurrentAttention(): Promise<
  AttentionState | null | undefined
> {
  try {
    const snapshot = await readSnapshot();
    return snapshot
      ? activeAttention(snapshot.body.systems.attention)
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Read the body and settle it forward to now.
 *
 * Decay is applied on read rather than by a scheduled job, because there is no
 * world loop here — the only thing that reliably happens is someone arriving.
 * The gap since the last turn is the elapsed time, so a body left alone for a
 * week has genuinely cooled by the time the next visitor sees it.
 */
export async function moveBody(
  transition: BodyTransition,
): Promise<{ body: EllisBody; persisted: boolean }> {
  try {
    const nowMs = Date.now();
    for (let attempt = 0; attempt < 4; attempt++) {
      const snapshot = await readSnapshot();
      if (!snapshot) break;
      if (transition.kind === "presence_beat") {
        const lastBeat = snapshot.body.pulse.lastRealAt
          ? Date.parse(snapshot.body.pulse.lastRealAt)
          : Number.NaN;
        if (Number.isFinite(lastBeat) && nowMs - lastBeat < PRESENCE_BEAT_MIN_MS) {
          return { body: snapshot.body, persisted: true };
        }
      }
      const body = advanceBody(snapshot.body, transition, nowMs);
      const { data, error } = await client()
        .from("ellis_body")
        .update({
          pulse: body.pulse,
          gut: forgetColdBonds(body.gut),
          systems: body.systems,
        })
        .eq("id", BODY_ID)
        .eq("updated_at", snapshot.revision)
        .select("updated_at")
        .maybeSingle();
      if (error) break;
      if (data) return { body, persisted: true };
    }
  } catch {
    // A failed body store must not disclose its contents or replace the
    // canonical row with a default body when the connection returns.
  }
  console.error("[BODY] transition could not be persisted");
  return { body: defaultBody(), persisted: false };
}
