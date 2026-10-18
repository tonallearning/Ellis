import { randomUUID } from "node:crypto";
import {
  PRIVATE_IDENTITIES,
  isCorrespondentId,
  type CorrespondentId,
} from "./identity";

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
export type InboundCourierInput = InboundAttribution & Content;

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
  };
}[CorrespondentId];

type OutboundEnvelope = {
  [Id in CorrespondentId]: EnvelopeBase & {
    direction: "outbound";
    speakerId: "ellis";
    addresseeId: Id;
    relationId: `ellis:${Id}`;
    provenanceMode: "originated_here";
  };
}[CorrespondentId];

export type PrivateExchangeEnvelope = InboundEnvelope | OutboundEnvelope;
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
  if (
    !recordWithKeys(input, [
      "speakerId",
      "provenanceMode",
      "content",
      "clientMessageId",
    ]) ||
    !hasContent(input)
  ) {
    return { ok: false, error: "Invalid courier message" };
  }
  const { speakerId, provenanceMode, content, clientMessageId } = input;
  if (
    speakerId === "ty" &&
    (provenanceMode === "direct" || provenanceMode === "carrier_interpretation")
  ) {
    return {
      ok: true,
      value: { speakerId, provenanceMode, content, clientMessageId },
    };
  }
  if (
    (speakerId === "mica" || speakerId === "naym") &&
    (provenanceMode === "relayed_verbatim" ||
      provenanceMode === "relayed_paraphrase")
  ) {
    return {
      ok: true,
      value: { speakerId, provenanceMode, content, clientMessageId },
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
export function createInboundExchange(
  input: unknown,
): Result<PrivateExchangeEnvelope> {
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

/** Server-generated reply only. This records origin, not receipt by Mica/Naym. */
export function createOutboundExchange(
  input: unknown,
): Result<PrivateExchangeEnvelope> {
  if (
    !recordWithKeys(input, ["addresseeId", "content", "clientMessageId"]) ||
    !hasContent(input) ||
    !isCorrespondentId(input.addresseeId)
  ) {
    return { ok: false, error: "Invalid Ellis reply" };
  }
  const base = {
    ...stamp({
      content: input.content,
      clientMessageId: input.clientMessageId,
    }),
    direction: "outbound" as const,
    speakerId: "ellis" as const,
    provenanceMode: "originated_here" as const,
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

/** Metadata only. Keep content in transcript role when P4 assembles the turn. */
export function formatCourierAttribution(
  exchange: PrivateExchangeEnvelope,
): string {
  if (exchange.direction === "outbound") {
    const name = PRIVATE_IDENTITIES[exchange.addresseeId].name;
    return exchange.addresseeId === "ty"
      ? "Ellis to Ty, originated here."
      : `Ellis to ${name}, originated here for Ty to carry. Delivery to ${name} is unconfirmed.`;
  }
  switch (exchange.provenanceMode) {
    case "direct":
      return "Ty speaking directly to Ellis.";
    case "carrier_interpretation":
      return "Ty's interpretation, addressed to Ellis. These are Ty's words, not the correspondent's words.";
    case "relayed_verbatim":
      return `${PRIVATE_IDENTITIES[exchange.speakerId].name}, carried verbatim by Ty to Ellis. Verbatim is Ty's delivery label; the original authorship is not independently verified. The correspondent is not directly present.`;
    case "relayed_paraphrase":
      return `${PRIVATE_IDENTITIES[exchange.speakerId].name}, paraphrased by Ty for Ellis. This is Ty's rendering, not a verbatim quotation. The correspondent is not directly present.`;
  }
}
