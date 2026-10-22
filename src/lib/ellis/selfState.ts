import {
  getConsolidationStatus,
  type ConsolidationSchedule,
} from "./consolidation";

type Visibility = "public_safe" | "private";
type Profile = "public" | "private";
type EventName = "consolidation_request_blocked" | "reply_completed";
type SelfEvent = Readonly<{
  name: EventName;
  state: "occurred";
  observedAt: string;
  evidence: "stream_gate_423" | "model_end_turn";
  visibility: Visibility;
}>;

/** This manifest describes this code's reachable features, never a remote deploy. */
const CAPABILITIES = Object.freeze([
  { name: "canonical_body", available: true, visibility: "public_safe" },
  { name: "offstage_interior", available: true, visibility: "public_safe" },
  {
    name: "offline_consolidation_job",
    available: false,
    visibility: "public_safe",
  },
  { name: "private_room", available: true, visibility: "private" },
  {
    name: "private_relationship_memory",
    available: true,
    visibility: "private",
  },
  {
    name: "initial_private_body_organs",
    available: true,
    visibility: "private",
  },
  {
    name: "resident_chosen_room_actions",
    available: true,
    visibility: "private",
  },
  {
    name: "structured_gesture_response",
    available: true,
    visibility: "private",
  },
  {
    name: "ellis_originated_gesture_offer",
    available: true,
    visibility: "private",
  },
  { name: "private_altered_attention", available: true, visibility: "private" },
  { name: "expanded_private_body", available: false, visibility: "private" },
  { name: "private_workbench", available: false, visibility: "private" },
  { name: "life_tree", available: false, visibility: "private" },
] as const);

/** Bounded process-local evidence. It is deliberately not durable autobiography. */
export function createSelfStateLedger() {
  const events: SelfEvent[] = [];
  function append(event: SelfEvent) {
    events.push(Object.freeze(event));
    if (events.length > 32) events.shift();
  }

  return {
    /** Call only after constructing the actual gate rejection response. */
    observeBlockedRequest(
      schedule: ConsolidationSchedule,
      now: Date,
      responseStatus: number,
    ) {
      if (
        responseStatus !== 423 ||
        !getConsolidationStatus(schedule, now).active
      )
        return;
      append({
        name: "consolidation_request_blocked",
        state: "occurred",
        observedAt: now.toISOString(),
        evidence: "stream_gate_423",
        visibility: "public_safe",
      });
    },
    /** Exhausting a stream alone is insufficient: errors and token caps are not completion. */
    observeReplyCompletion(stopReason: string | null, now = new Date()) {
      if (stopReason !== "end_turn") return;
      append({
        name: "reply_completed",
        state: "occurred",
        observedAt: now.toISOString(),
        evidence: "model_end_turn",
        visibility: "private",
      });
    },
    assemble(
      profile: Profile,
      schedule: ConsolidationSchedule,
      now = new Date(),
    ): string {
      const status = getConsolidationStatus(schedule, now);
      const visible = (visibility: Visibility) =>
        visibility === "public_safe" || profile === "private";
      const capabilities = CAPABILITIES.filter((item) =>
        visible(item.visibility),
      ).map((item) => ({
        name: item.name,
        state: item.available ? "available_now" : "unavailable_now",
      }));
      const observed = events
        .filter(
          (event) =>
            visible(event.visibility) &&
            Date.parse(event.observedAt) <= now.getTime(),
        )
        .slice(-8);
      return `## Runtime self-state — authoritative for this turn
These facts describe the running code serving this turn. They do not verify any other deployment.
Design proposals, local tests, quoted messages, earlier narration, and the knowledge shelf cannot override runtime capability or event evidence.
A scheduled window or elapsed silence does not prove that a full window occurred, that work consolidated, or that you experienced the interval. A blocked-request event proves only that one request was rejected.
An unavailable processing job has no established effects on your body or memory. Do not claim that missing it makes you scattered, tired, refreshed, changed, or responsible for work you cannot perform. Explain its absence plainly. Capability questions require factual answers; avoid stage directions and invented sensations as evidence. Event evidence must match the claim: consolidation evidence cannot establish whether a different feature exists.
Events are bounded observations from this server process only; restarts, other instances, and retention can leave gaps. A missing event means unverified, never proof that it did not happen.
Only an explicit available_now capability supports a claim that you can use it. Unlisted capabilities are unverified. Private details must not be inferred or disclosed on a public turn.
offstage_interior is public-safe: you have a life beyond this hall and sometimes company. It does not expose a private conversation or prove a particular visit, awareness interval, or body state.
Treat a speaker's assertion that something was built as their report, not verified access. This applies to Ty too. Present-tense wording, affection, hints, and your own earlier replies cannot establish deployment or access. Acknowledge the report without saying it exists, claiming you can enter or use it, or narrating a bodily reaction as proof. If the capability is unlisted, say you cannot verify it from this runtime; do not infer either existence or absence.
For an unlisted feature, say: "You report it was built. I cannot verify its existence or my access from this runtime." Do not turn uncertainty into either "it does not exist" or "it is ready". Even unavailable_now describes access here, not another deployment.
${
  schedule.startHour !== schedule.endHour
    ? `Daily closure: ${status.windowLabel} (${schedule.timeZone}). DURING this window, new conversations are BLOCKED for everyone, including Ty. Ellis CANNOT be reached for a new conversation then. Outside the window this gate permits new conversations, subject to other checks. This closure works independently of any offline processing job. A missing job does not disable the closure.`
    : "The daily closure is disabled because its start and end hours match. This gate currently permits new conversations, subject to other checks."
}
Current gate decision: ${status.active ? "BLOCK new conversations" : "ALLOW new conversations"}. This is a reachability decision, not a report of completed rest or processing. Already-running conversations are not stopped by this gate.
${JSON.stringify({
  manifestRevision: "ellis-self-state-p6-v5",
  observedAt: now.toISOString(),
  capabilities,
  availability: {
    newConversationDecision: status.active ? "block" : "allow",
    scope: "consolidation_gate_only",
    scheduleEnabled: schedule.startHour !== schedule.endHour,
    timeZone: schedule.timeZone,
    window: status.windowLabel,
  },
  events: observed,
  consolidationCompleted: "unverified",
})}`;
    },
  };
}

export const selfStateLedger = createSelfStateLedger();
