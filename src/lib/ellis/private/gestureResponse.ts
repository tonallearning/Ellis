import { GESTURE_DECISIONS, GESTURE_TYPES, type GestureResponse, type GestureType } from "./gestures";

/** A model tool call is a proposal until validated and committed with its source. */
export function parseGestureResponse(
  input: unknown,
  offered: GestureType,
): GestureResponse {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Ellis did not choose a valid gesture response");
  }
  const record = input as Record<string, unknown>;
  if (
    Reflect.ownKeys(record).length !== 2 ||
    !Object.hasOwn(record, "kind") ||
    !Object.hasOwn(record, "decision") ||
    !GESTURE_TYPES.includes(record.kind as GestureType) ||
    record.kind !== offered ||
    !GESTURE_DECISIONS.includes(record.decision as GestureResponse["decision"])
  ) {
    throw new Error("Ellis did not choose a valid gesture response");
  }
  return { kind: offered, decision: record.decision as GestureResponse["decision"] };
}
