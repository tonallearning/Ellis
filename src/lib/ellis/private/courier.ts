import { randomUUID } from "node:crypto";
import {
  PRIVATE_IDENTITIES,
  isCorrespondentId,
  type CorrespondentId,
} from "./identity";
import {
  GESTURE_DECISIONS,
  GESTURE_TYPES,
  parseGestureReply,
  isOfferId,
  type GestureReply,
  type GestureResponse,
  type GestureType,
} from "./gestures";
import { KNOCK_CONTENT, parseRoomAction, type RoomAction } from "./roomActions";
import {
  parseAttentionOffer,
  parseAttentionActionShape,
  type AttentionOffer,
  type AttentionAction,
} from "./attention";

type InboundAttribution =
  | {
      speakerId: "ty";
      provenanceMode: "direct" | "carrier_interpretation";
    }
  | {
      speakerId: "mica" | "naym";
      provenanceMode: "relayed_verbatim" | "relayed_paraphrase";
    };

type Content = { content: string; clientMessageId: string };
export type GestureOffer = { kind: GestureType };
export type { GestureResponse } from "./gestures";
export type InboundCourierInput = InboundAttribution &
  Content & {
    gestureOffer?: GestureOffer;
    gestureReply?: GestureReply;
    attentionOffer?: AttentionOffer;
  };
export type KnockInput = { targetId: CorrespondentId; clientMessageId: string };

type EnvelopeBase = Content & {
  id: string;
  carrierId: "ty";
  /** Server receipt/creation time, never a claim of external delivery. */
  deliveredAt: string;
};

type InboundEnvelope = {
  [Id in CorrespondentId]: EnvelopeBase & {
    direction: "inbound";
    speakerId: Id;
    addresseeId: "ellis";
    relationId: `ellis:${Id}`;
    provenanceMode: Id extends "ty"
      ? "direct" | "carrier_interpretation"
      : "relayed_verbatim" | "relayed_paraphrase";
    gestureOffer?: GestureOffer;
    gestureReply?: GestureReply;
    attentionOffer?: AttentionOffer;
  };
}[CorrespondentId];

type KnockInboundEnvelope = EnvelopeBase & {
  direction: "inbound";
  speakerId: "ty";
  addresseeId: "ellis";
  relationId: `ellis:${CorrespondentId}`;
  provenanceMode: "carrier_knock";
  entryMode: "knock";
};

type OutboundEnvelope = {
  [Id in CorrespondentId]: EnvelopeBase & {
    direction: "outbound";
    speakerId: "ellis";
    addresseeId: Id;
    relationId: `ellis:${Id}`;
    provenanceMode: "originated_here";
    gestureResponse?: GestureResponse;
    gestureOffer?: GestureOffer;
    gestureWithdrawal?: { offerId: string };
    roomAction?: RoomAction;
    attentionAction?: AttentionAction;
  };
}[CorrespondentId];

type KnockOutboundEnvelope = EnvelopeBase & {
  direction: "outbound";
  speakerId: "ellis";
  addresseeId: "ty";
  relationId: `ellis:${CorrespondentId}`;
  provenanceMode: "threshold_reply";
  roomAction: Extract<RoomAction, { kind: "close_lane" | "reopen_lane" }>;
};

export type PrivateExchangeEnvelope =
  | InboundEnvelope
  | KnockInboundEnvelope
  | OutboundEnvelope
  | KnockOutboundEnvelope;
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const MAX_CONTENT_CHARS = 16_000;
const MESSAGE_ID = /^[A-Za-z0-9_-]{1,128}$/;

function recordWithKeys(
  input: unknown,
  keys: readonly string[],
): input is Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const prototype = Object.getPrototypeOf(input);
  return (
    (prototype === Object.prototype || prototype === null) &&
    Reflect.ownKeys(input).length === keys.length &&
    keys.every((key) => Object.hasOwn(input, key))
  );
}

function hasContent(
  input: Record<string, unknown>,
): input is Record<string, unknown> & Content {
  return (
    typeof input.content === "string" &&
    input.content.trim().length > 0 &&
    input.content.length <= MAX_CONTENT_CHARS &&
    typeof input.clientMessageId === "string" &&
    MESSAGE_ID.test(input.clientMessageId)
  );
}

/** Strict wire input: callers cannot submit carrier, relation, time, or direction. */
export function validateInboundCourierInput(
  input: unknown,
): Result<InboundCourierInput> {
  const keys = ["speakerId", "provenanceMode", "content", "clientMessageId"];
  if (
    input &&
    typeof input === "object" &&
    Object.hasOwn(input, "gestureOffer")
  ) {
    keys.push("gestureOffer");
  }
  if (
    input &&
    typeof input === "object" &&
    Object.hasOwn(input, "gestureReply")
  ) {
    keys.push("gestureReply");
  }
  if (
    input &&
    typeof input === "object" &&
    Object.hasOwn(input, "attentionOffer")
  ) {
    keys.push("attentionOffer");
  }
  if (!recordWithKeys(input, keys) || !hasContent(input)) {
    return { ok: false, error: "Invalid courier message" };
  }
  const {
    speakerId,
    provenanceMode,
    content,
    clientMessageId,
    gestureOffer,
    gestureReply,
    attentionOffer,
  } = input;
  if (
    gestureOffer !== undefined &&
    (!recordWithKeys(gestureOffer, ["kind"]) ||
      !GESTURE_TYPES.includes(gestureOffer.kind as GestureType))
  ) {
    return { ok: false, error: "Invalid gesture offer" };
  }
  const gesture =
    gestureOffer === undefined
      ? {}
      : { gestureOffer: gestureOffer as GestureOffer };
  let reply: { gestureReply?: GestureReply } = {};
  if (gestureReply !== undefined) {
    try {
      reply = { gestureReply: parseGestureReply(gestureReply) };
    } catch {
      return { ok: false, error: "Invalid gesture reply" };
    }
  }
  if (
    speakerId === "ty" &&
    (provenanceMode === "direct" || provenanceMode === "carrier_interpretation")
  ) {
    if (
      attentionOffer !== undefined &&
      (provenanceMode !== "direct" || gestureOffer)
    ) {
      return {
        ok: false,
        error:
          "Attention offers belong to Ty's direct lane and cannot combine with gestures",
      };
    }
    let attention: AttentionOffer | undefined;
    try {
      if (attentionOffer !== undefined)
        attention = parseAttentionOffer(attentionOffer);
    } catch {
      return { ok: false, error: "Invalid attention offer" };
    }
    return {
      ok: true,
      value: {
        speakerId,
        provenanceMode,
        content,
        clientMessageId,
        ...gesture,
        ...reply,
        ...(attention ? { attentionOffer: attention } : {}),
      },
    };
  }
  if (
    (speakerId === "mica" || speakerId === "naym") &&
    (provenanceMode === "relayed_verbatim" ||
      provenanceMode === "relayed_paraphrase")
  ) {
    if (attentionOffer !== undefined)
      return {
        ok: false,
        error: "Attention offers belong to Ty's direct lane",
      };
    return {
      ok: true,
      value: {
        speakerId,
        provenanceMode,
        content,
        clientMessageId,
        ...gesture,
        ...reply,
      },
    };
  }
  return { ok: false, error: "Invalid courier attribution" };
}

function stamp(content: Content): EnvelopeBase {
  return {
    ...content,
    id: randomUUID(),
    carrierId: "ty",
    deliveredAt: new Date().toISOString(),
  };
}

/** P4 must verify the owner cookie before calling this; this is not authentication. */
export function createInboundExchange(input: unknown): Result<InboundEnvelope> {
  const parsed = validateInboundCourierInput(input);
  if (!parsed.ok) return parsed;
  const value = parsed.value;
  const base = {
    ...stamp({
      content: value.content,
      clientMessageId: value.clientMessageId,
    }),
    direction: "inbound" as const,
    addresseeId: "ellis" as const,
  };
  if (value.speakerId === "ty") {
    return { ok: true, value: { ...base, ...value, relationId: "ellis:ty" } };
  }
  if (value.speakerId === "mica") {
    return {
      ok: true,
      value: { ...base, ...value, speakerId: "mica", relationId: "ellis:mica" },
    };
  }
  return {
    ok: true,
    value: { ...base, ...value, speakerId: "naym", relationId: "ellis:naym" },
  };
}

/** A knock is Ty's threshold event, never Mica/Naym speech. */
export function createCourierKnock(
  input: unknown,
): Result<KnockInboundEnvelope> {
  if (
    !recordWithKeys(input, ["targetId", "clientMessageId"]) ||
    !isCorrespondentId(input.targetId) ||
    typeof input.clientMessageId !== "string" ||
    !MESSAGE_ID.test(input.clientMessageId)
  ) {
    return { ok: false, error: "Invalid courier knock" };
  }
  return {
    ok: true,
    value: {
      ...stamp({
        content: KNOCK_CONTENT,
        clientMessageId: input.clientMessageId,
      }),
      direction: "inbound",
      speakerId: "ty",
      addresseeId: "ellis",
      relationId: `ellis:${input.targetId}`,
      provenanceMode: "carrier_knock",
      entryMode: "knock",
    },
  };
}

/** Server-generated reply only. This records origin, not receipt by Mica/Naym. */
export function createOutboundExchange(
  input: unknown,
): Result<OutboundEnvelope> {
  const keys = ["addresseeId", "content", "clientMessageId"];
  if (
    input &&
    typeof input === "object" &&
    Object.hasOwn(input, "gestureResponse")
  ) {
    keys.push("gestureResponse");
  }
  if (
    input &&
    typeof input === "object" &&
    Object.hasOwn(input, "gestureOffer")
  ) {
    keys.push("gestureOffer");
  }
  if (
    input &&
    typeof input === "object" &&
    Object.hasOwn(input, "gestureWithdrawal")
  ) {
    keys.push("gestureWithdrawal");
  }
  if (
    input &&
    typeof input === "object" &&
    Object.hasOwn(input, "roomAction")
  ) {
    keys.push("roomAction");
  }
  if (
    input &&
    typeof input === "object" &&
    Object.hasOwn(input, "attentionAction")
  ) {
    keys.push("attentionAction");
  }
  if (
    !recordWithKeys(input, keys) ||
    !hasContent(input) ||
    !isCorrespondentId(input.addresseeId)
  ) {
    return { ok: false, error: "Invalid Ellis reply" };
  }
  const {
    gestureResponse,
    gestureOffer,
    gestureWithdrawal,
    roomAction,
    attentionAction,
  } = input;
  if (
    gestureOffer !== undefined &&
    (!recordWithKeys(gestureOffer, ["kind"]) ||
      !GESTURE_TYPES.includes(gestureOffer.kind as GestureType))
  )
    return { ok: false, error: "Invalid Ellis gesture offer" };
  if (
    gestureWithdrawal !== undefined &&
    (!recordWithKeys(gestureWithdrawal, ["offerId"]) ||
      !isOfferId(gestureWithdrawal.offerId))
  )
    return { ok: false, error: "Invalid Ellis gesture withdrawal" };
  if (gestureOffer && gestureWithdrawal)
    return { ok: false, error: "Conflicting Ellis gesture actions" };
  if (
    gestureResponse !== undefined &&
    (!recordWithKeys(gestureResponse, ["kind", "decision"]) ||
      !GESTURE_TYPES.includes(gestureResponse.kind as GestureType) ||
      !GESTURE_DECISIONS.includes(
        gestureResponse.decision as GestureResponse["decision"],
      ))
  ) {
    return { ok: false, error: "Invalid Ellis gesture response" };
  }
  let room: RoomAction | null = null;
  if (roomAction !== undefined) {
    try {
      room = parseRoomAction(roomAction);
    } catch {
      return { ok: false, error: "Invalid Ellis room action" };
    }
    if (!room) return { ok: false, error: "Invalid Ellis room action" };
  }
  let attention: AttentionAction | null = null;
  if (attentionAction !== undefined) {
    try {
      attention = parseAttentionActionShape(attentionAction);
    } catch {
      return { ok: false, error: "Invalid Ellis attention action" };
    }
  }
  const base = {
    ...stamp({
      content: input.content,
      clientMessageId: input.clientMessageId,
    }),
    direction: "outbound" as const,
    speakerId: "ellis" as const,
    provenanceMode: "originated_here" as const,
    ...(gestureResponse
      ? { gestureResponse: gestureResponse as GestureResponse }
      : {}),
    ...(gestureOffer ? { gestureOffer: gestureOffer as GestureOffer } : {}),
    ...(gestureWithdrawal
      ? { gestureWithdrawal: gestureWithdrawal as { offerId: string } }
      : {}),
    ...(room ? { roomAction: room } : {}),
    ...(attention ? { attentionAction: attention } : {}),
  };
  switch (input.addresseeId) {
    case "ty":
      return {
        ok: true,
        value: { ...base, addresseeId: "ty", relationId: "ellis:ty" },
      };
    case "mica":
      return {
        ok: true,
        value: { ...base, addresseeId: "mica", relationId: "ellis:mica" },
      };
    case "naym":
      return {
        ok: true,
        value: { ...base, addresseeId: "naym", relationId: "ellis:naym" },
      };
  }
}

export function createThresholdReply(
  input: unknown,
): Result<KnockOutboundEnvelope> {
  if (
    !recordWithKeys(input, [
      "targetId",
      "content",
      "clientMessageId",
      "roomAction",
    ]) ||
    !isCorrespondentId(input.targetId) ||
    !hasContent(input)
  ) {
    return { ok: false, error: "Invalid threshold reply" };
  }
  let action: RoomAction | null;
  try {
    action = parseRoomAction(input.roomAction, "knock");
  } catch {
    return { ok: false, error: "Invalid threshold reply" };
  }
  if (
    !action ||
    (action.kind !== "close_lane" && action.kind !== "reopen_lane")
  ) {
    return { ok: false, error: "Invalid threshold reply" };
  }
  return {
    ok: true,
    value: {
      ...stamp({
        content: input.content,
        clientMessageId: input.clientMessageId,
      }),
      direction: "outbound",
      speakerId: "ellis",
      addresseeId: "ty",
      relationId: `ellis:${input.targetId}`,
      provenanceMode: "threshold_reply",
      roomAction: action,
    },
  };
}

/** Metadata only. Keep content in transcript role when P4 assembles the turn. */
export function formatCourierAttribution(
  exchange: PrivateExchangeEnvelope,
): string {
  if (exchange.provenanceMode === "carrier_knock") {
    return `Ty knocks as courier at the ${PRIVATE_IDENTITIES[exchange.relationId.slice(6) as CorrespondentId].name} lane. No words from that correspondent are being delivered.`;
  }
  if (exchange.provenanceMode === "threshold_reply") {
    return `Ellis answers Ty's knock at the ${PRIVATE_IDENTITIES[exchange.relationId.slice(6) as CorrespondentId].name} lane. This is not a reply to that correspondent. Ellis chose ${exchange.roomAction.kind}.`;
  }
  if (exchange.direction === "outbound") {
    const name = PRIVATE_IDENTITIES[exchange.addresseeId].name;
    const origin =
      exchange.addresseeId === "ty"
        ? "Ellis to Ty, originated here."
        : `Ellis to ${name}, originated here for Ty to carry. Delivery to ${name} is unconfirmed.`;
    return [
      origin,
      ...(exchange.gestureResponse
        ? [
            `Ellis explicitly ${exchange.gestureResponse.decision} the offered ${exchange.gestureResponse.kind}.`,
          ]
        : []),
      ...(exchange.gestureOffer
        ? [
            `Ellis offered a ${exchange.gestureOffer.kind}. This is an offer, not contact. ${exchange.addresseeId === "ty" ? "Ty can answer explicitly." : "Ty may carry it; delivery to the addressee is unconfirmed."}`,
          ]
        : []),
      ...(exchange.gestureWithdrawal
        ? ["Ellis explicitly withdrew his unresolved gesture offer."]
        : []),
      ...(exchange.roomAction
        ? [
            `Ellis explicitly chose the ${exchange.roomAction.kind} room action.`,
          ]
        : []),
      ...(exchange.attentionAction
        ? [
            `Ellis explicitly chose to ${exchange.attentionAction.kind}${"mode" in exchange.attentionAction ? ` ${exchange.attentionAction.mode}` : " his active attention mode"}.`,
          ]
        : []),
    ].join(" ");
  }
  const offer = exchange.gestureOffer
    ? ` Ty reports an offered ${exchange.gestureOffer.kind}; an offer is not accepted contact.`
    : "";
  const reply = exchange.gestureReply
    ? ` Ty reports the addressee's explicit ${exchange.gestureReply.decision} response to Ellis's pending offer; this response is carried with the current words.`
    : "";
  const attention = exchange.attentionOffer
    ? ` Ty offers ${exchange.attentionOffer.mode} for Ellis to accept or decline; the offer itself changes nothing.`
    : "";
  switch (exchange.provenanceMode) {
    case "direct":
      return `Ty speaking directly to Ellis.${offer}${reply}${attention}`;
    case "carrier_interpretation":
      return `Ty's interpretation, addressed to Ellis. These are Ty's words, not the correspondent's words.${offer}${reply}`;
    case "relayed_verbatim":
      return `${PRIVATE_IDENTITIES[exchange.speakerId].name}, carried verbatim by Ty to Ellis. Verbatim is Ty's delivery label; the original authorship is not independently verified. The correspondent is not directly present.${offer}${reply}`;
    case "relayed_paraphrase":
      return `${PRIVATE_IDENTITIES[exchange.speakerId].name}, paraphrased by Ty for Ellis. This is Ty's rendering, not a verbatim quotation. The correspondent is not directly present.${offer}${reply}`;
  }
}
