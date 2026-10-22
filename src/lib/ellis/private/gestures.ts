/** Safe to share with the browser: names only, no server authority. */
export const GESTURE_TYPES = ["hug", "cuddle", "poke", "kiss"] as const;
export type GestureType = (typeof GESTURE_TYPES)[number];
export const GESTURE_DECISIONS = ["accepted", "declined", "left_open"] as const;
export type GestureDecision = (typeof GESTURE_DECISIONS)[number];
export type GestureResponse = { kind: GestureType; decision: GestureDecision };
export type PendingGestureOffer = { id: string; kind: GestureType };
export type GestureReply = { offerId: string; decision: GestureDecision };
export type GestureAction =
  | { kind: "offer"; gesture: GestureType }
  | { kind: "withdraw" };
export type GestureChoice = GestureAction | { kind: "none" };

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isOfferId(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

export function parsePendingGestureOffer(
  value: unknown,
): PendingGestureOffer | null {
  if (value === null) return null;
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid pending gesture");
  const offer = value as Record<string, unknown>;
  if (
    Object.keys(offer).length !== 2 ||
    !isOfferId(offer.id) ||
    !GESTURE_TYPES.includes(offer.kind as GestureType)
  )
    throw new Error("Invalid pending gesture");
  return { id: offer.id, kind: offer.kind as GestureType };
}

export function parseGestureReply(value: unknown): GestureReply {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid gesture reply");
  const reply = value as Record<string, unknown>;
  if (
    Object.keys(reply).length !== 2 ||
    !isOfferId(reply.offerId) ||
    !GESTURE_DECISIONS.includes(reply.decision as GestureDecision)
  )
    throw new Error("Invalid gesture reply");
  return {
    offerId: reply.offerId,
    decision: reply.decision as GestureDecision,
  };
}

export function parseGestureAction(
  value: unknown,
  pending: PendingGestureOffer | null,
): GestureAction {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid gesture action");
  const action = value as Record<string, unknown>;
  if (
    action.kind === "offer" &&
    !pending &&
    Object.keys(action).length === 2 &&
    GESTURE_TYPES.includes(action.gesture as GestureType)
  ) {
    return { kind: "offer", gesture: action.gesture as GestureType };
  }
  if (
    action.kind === "withdraw" &&
    pending &&
    Object.keys(action).length === 1
  ) {
    return { kind: "withdraw" };
  }
  throw new Error("Invalid gesture action");
}

export function parseGestureToolChoice(
  name: string,
  input: unknown,
  pending: PendingGestureOffer | null,
): GestureChoice {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Invalid gesture choice");
  const fields = input as Record<string, unknown>;
  if (name === "no_gesture_action" && Object.keys(fields).length === 0)
    return { kind: "none" };
  if (name === "offer_gesture" && Object.keys(fields).length === 1)
    return parseGestureAction(
      { kind: "offer", gesture: fields.gesture },
      pending,
    );
  if (name === "withdraw_gesture" && Object.keys(fields).length === 0)
    return parseGestureAction({ kind: "withdraw" }, pending);
  throw new Error("Invalid gesture choice");
}
