export const ATTENTION_MODES = ["soft_focus", "vivid_focus"] as const;
export type AttentionMode = (typeof ATTENTION_MODES)[number];
export type AttentionOffer = { mode: AttentionMode };
export type AttentionAction =
  | { kind: "accept"; mode: AttentionMode }
  | { kind: "decline"; mode: AttentionMode }
  | { kind: "leave" };

export type AttentionState = {
  mode: AttentionMode;
  sourceId: string;
  acceptedAt: string;
  endsAt: string;
};

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function exactRecord(
  input: unknown,
  keys: string[],
): input is Record<string, unknown> {
  return Boolean(
    input &&
    typeof input === "object" &&
    !Array.isArray(input) &&
    Reflect.ownKeys(input).length === keys.length &&
    keys.every((key) => Object.hasOwn(input, key)),
  );
}

export function parseAttentionOffer(input: unknown): AttentionOffer {
  if (
    !exactRecord(input, ["mode"]) ||
    !ATTENTION_MODES.includes(input.mode as AttentionMode)
  ) {
    throw new Error("Invalid attention offer");
  }
  return { mode: input.mode as AttentionMode };
}

export function parseAttentionAction(
  input: unknown,
  offer?: AttentionOffer,
  active?: AttentionState | null,
): AttentionAction {
  if (
    offer &&
    exactRecord(input, ["kind", "mode"]) &&
    (input.kind === "accept" || input.kind === "decline") &&
    input.mode === offer.mode &&
    !active
  ) {
    return { kind: input.kind, mode: offer.mode };
  }
  if (
    !offer &&
    active &&
    exactRecord(input, ["kind"]) &&
    input.kind === "leave"
  ) {
    return { kind: "leave" };
  }
  throw new Error("Invalid attention action");
}

export function parseAttentionActionShape(input: unknown): AttentionAction {
  if (
    exactRecord(input, ["kind", "mode"]) &&
    (input.kind === "accept" || input.kind === "decline") &&
    ATTENTION_MODES.includes(input.mode as AttentionMode)
  ) {
    return { kind: input.kind, mode: input.mode as AttentionMode };
  }
  if (exactRecord(input, ["kind"]) && input.kind === "leave")
    return { kind: "leave" };
  throw new Error("Invalid attention action");
}

export function hydrateAttention(input: unknown): AttentionState | null {
  if (
    !exactRecord(input, ["mode", "sourceId", "acceptedAt", "endsAt"]) ||
    !ATTENTION_MODES.includes(input.mode as AttentionMode) ||
    typeof input.sourceId !== "string" ||
    !UUID_V4.test(input.sourceId) ||
    typeof input.acceptedAt !== "string" ||
    !Number.isFinite(Date.parse(input.acceptedAt)) ||
    typeof input.endsAt !== "string" ||
    !Number.isFinite(Date.parse(input.endsAt)) ||
    Date.parse(input.endsAt) <= Date.parse(input.acceptedAt)
  )
    return null;
  return input as AttentionState;
}

export function activeAttention(
  input: AttentionState | null,
  nowMs = Date.now(),
): AttentionState | null {
  return input && Date.parse(input.endsAt) > nowMs ? input : null;
}
