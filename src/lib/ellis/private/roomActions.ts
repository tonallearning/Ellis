export type RoomAction =
  | { kind: "step_away" }
  | { kind: "close_lane"; minutesBeforeKnock: number }
  | { kind: "reopen_lane" }
  | { kind: "private_time"; minutes: number };

export const KNOCK_CONTENT = "Ty knocks as courier at this closed personal lane. No words from its correspondent are being carried.";

export type RoomGate = {
  privateUntil: string | null;
  laneClosed: boolean;
  knockAfter: string | null;
};

const duration = (value: unknown): value is number =>
  Number.isInteger(value) && typeof value === "number" && value >= 5 && value <= 120;

export function parseRoomAction(input: unknown, entryMode?: "knock"): RoomAction | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid Ellis room action");
  }
  const action = input as Record<string, unknown>;
  const keys = Object.keys(action);
  if (action.kind === "none" && keys.length === 1 && !entryMode) return null;
  if (action.kind === "step_away" && keys.length === 1 && !entryMode) return { kind: "step_away" };
  if (action.kind === "reopen_lane" && keys.length === 1 && entryMode === "knock") {
    return { kind: "reopen_lane" };
  }
  if (action.kind === "close_lane" && keys.length === 2 && duration(action.minutesBeforeKnock)) {
    return { kind: "close_lane", minutesBeforeKnock: action.minutesBeforeKnock };
  }
  if (action.kind === "private_time" && keys.length === 2 && !entryMode && duration(action.minutes)) {
    return { kind: "private_time", minutes: action.minutes };
  }
  throw new Error("Invalid Ellis room action");
}

export function parseRoomGate(input: unknown): RoomGate {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Private gate unavailable");
  const gate = input as Record<string, unknown>;
  if (
    typeof gate.laneClosed !== "boolean" ||
    (gate.privateUntil !== null && (typeof gate.privateUntil !== "string" || !Number.isFinite(Date.parse(gate.privateUntil)))) ||
    (gate.knockAfter !== null && (typeof gate.knockAfter !== "string" || !Number.isFinite(Date.parse(gate.knockAfter))))
  ) throw new Error("Private gate unavailable");
  return { privateUntil: gate.privateUntil as string | null, laneClosed: gate.laneClosed,
    knockAfter: gate.knockAfter as string | null };
}

export function mayEnterPrivateRoom(gate: RoomGate, entryMode?: "knock", nowMs = Date.now()): boolean {
  if (gate.privateUntil && Date.parse(gate.privateUntil) > nowMs) return false;
  if (!gate.laneClosed) return entryMode !== "knock";
  return entryMode === "knock" && Boolean(gate.knockAfter && Date.parse(gate.knockAfter) <= nowMs);
}
