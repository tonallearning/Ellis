import type { CorrespondentId } from "./identity";
import type { InboundCourierInput } from "./courier";
import {
  GESTURE_DECISIONS,
  GESTURE_TYPES,
  type GestureResponse,
  type GestureType,
} from "./gestures";
import { parseRoomAction, type RoomAction } from "./roomActions";
import {
  parseAttentionActionShape,
  parseAttentionOffer,
  type AttentionAction,
  type AttentionOffer,
} from "./attention";

export type PrivateRoomMessage = {
  role: "correspondent" | "ellis";
  content: string;
  gestureOffer?: GestureType;
  gestureResponse?: GestureResponse;
  gestureReply?: GestureResponse;
  gestureWithdrawal?: true;
  roomAction?: RoomAction;
  attentionOffer?: AttentionOffer;
  attentionAction?: AttentionAction;
  knock?: true;
  thresholdReply?: true;
};

export type PrivateRoomDeliveryOption = {
  value: InboundCourierInput["provenanceMode"];
  label: string;
  description: string;
};

export type PrivateRoomCorrespondent = {
  id: CorrespondentId;
  name: string;
  deliveryOptions: PrivateRoomDeliveryOption[];
};

const CACHE_VERSION = 1;
const MAX_CACHED_MESSAGES = 50;
const MAX_CACHED_MESSAGE_CHARS = 50_000;

export const PRIVATE_ROOM_ACTIVE_KEY = "ellis:private-room:v1:active";

export function privateRoomStorageKey(relationId: string): string {
  return `ellis:private-room:v1:transcript:${encodeURIComponent(relationId)}`;
}

export function serializePrivateRoomTranscript(
  relationId: string,
  messages: PrivateRoomMessage[],
): string {
  return JSON.stringify({
    version: CACHE_VERSION,
    relationId,
    messages: messages.slice(-MAX_CACHED_MESSAGES),
  });
}

export function parsePrivateRoomTranscript(
  raw: string | null,
  expectedRelationId: string,
): PrivateRoomMessage[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return [];
    const cache = parsed as Record<string, unknown>;
    if (
      cache.version !== CACHE_VERSION ||
      cache.relationId !== expectedRelationId ||
      !Array.isArray(cache.messages) ||
      cache.messages.length > MAX_CACHED_MESSAGES
    ) {
      return [];
    }

    const messages: PrivateRoomMessage[] = [];
    for (const candidate of cache.messages) {
      if (
        !candidate ||
        typeof candidate !== "object" ||
        Array.isArray(candidate)
      ) {
        return [];
      }
      const message = candidate as Record<string, unknown>;
      if (
        (message.role !== "correspondent" && message.role !== "ellis") ||
        typeof message.content !== "string" ||
        message.content.length === 0 ||
        message.content.length > MAX_CACHED_MESSAGE_CHARS
      ) {
        return [];
      }
      if (
        message.gestureOffer !== undefined &&
        !GESTURE_TYPES.includes(message.gestureOffer as GestureType)
      )
        return [];
      if (
        message.gestureReply !== undefined &&
        (message.role !== "correspondent" ||
          !message.gestureReply ||
          typeof message.gestureReply !== "object" ||
          Array.isArray(message.gestureReply) ||
          Object.keys(message.gestureReply).length !== 2 ||
          !GESTURE_TYPES.includes(
            (message.gestureReply as GestureResponse).kind,
          ) ||
          !GESTURE_DECISIONS.includes(
            (message.gestureReply as GestureResponse).decision,
          ))
      )
        return [];
      if (
        message.gestureWithdrawal !== undefined &&
        (message.role !== "ellis" || message.gestureWithdrawal !== true)
      )
        return [];
      if (
        message.gestureResponse !== undefined &&
        (message.role !== "ellis" ||
          !message.gestureResponse ||
          typeof message.gestureResponse !== "object" ||
          Array.isArray(message.gestureResponse) ||
          Object.keys(message.gestureResponse).length !== 2 ||
          !GESTURE_TYPES.includes(
            (message.gestureResponse as GestureResponse).kind,
          ) ||
          !["accepted", "declined", "left_open"].includes(
            (message.gestureResponse as GestureResponse).decision,
          ))
      )
        return [];
      if (
        message.knock !== undefined &&
        (message.role !== "correspondent" || message.knock !== true)
      )
        return [];
      if (
        message.thresholdReply !== undefined &&
        (message.role !== "ellis" || message.thresholdReply !== true)
      )
        return [];
      let roomAction: RoomAction | null = null;
      if (message.roomAction !== undefined) {
        if (message.role !== "ellis") return [];
        try {
          roomAction = parseRoomAction(
            message.roomAction,
            message.thresholdReply ? "knock" : undefined,
          );
        } catch {
          return [];
        }
        if (!roomAction) return [];
        if (
          message.thresholdReply &&
          roomAction.kind !== "reopen_lane" &&
          roomAction.kind !== "close_lane"
        )
          return [];
      }
      let attentionOffer: AttentionOffer | null = null;
      let attentionAction: AttentionAction | null = null;
      try {
        if (message.attentionOffer !== undefined) {
          if (message.role !== "correspondent" || expectedRelationId !== "ty")
            return [];
          attentionOffer = parseAttentionOffer(message.attentionOffer);
        }
        if (message.attentionAction !== undefined) {
          if (message.role !== "ellis") return [];
          attentionAction = parseAttentionActionShape(message.attentionAction);
        }
      } catch {
        return [];
      }
      messages.push({
        role: message.role,
        content: message.content,
        ...(message.gestureOffer
          ? { gestureOffer: message.gestureOffer as GestureType }
          : {}),
        ...(message.gestureResponse
          ? { gestureResponse: message.gestureResponse as GestureResponse }
          : {}),
        ...(message.gestureReply
          ? { gestureReply: message.gestureReply as GestureResponse }
          : {}),
        ...(message.gestureWithdrawal
          ? { gestureWithdrawal: true as const }
          : {}),
        ...(message.knock ? { knock: true as const } : {}),
        ...(message.thresholdReply ? { thresholdReply: true as const } : {}),
        ...(roomAction ? { roomAction } : {}),
        ...(attentionOffer ? { attentionOffer } : {}),
        ...(attentionAction ? { attentionAction } : {}),
      });
    }
    return messages;
  } catch {
    return [];
  }
}
