import type { ChatMessage } from "./types";
import type { EllisConfig } from "./config";

export type ValidationResult =
  | { ok: true; messages: ChatMessage[] }
  | { ok: false; error: string; status: number };

export function validateStreamInput(
  body: unknown,
  config: EllisConfig,
): ValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid body", status: 400 };
  }

  const { messages, sessionId, hall } = body as Record<string, unknown>;

  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: "messages required", status: 400 };
  }

  if (messages.length > config.maxHistoryMessages) {
    return {
      ok: false,
      error: `Too many messages (max ${config.maxHistoryMessages})`,
      status: 400,
    };
  }

  const normalized: ChatMessage[] = [];
  for (const item of messages) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: "Invalid message", status: 400 };
    }
    const { role, content } = item as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") {
      return { ok: false, error: "Invalid role", status: 400 };
    }
    if (typeof content !== "string" || !content.trim()) {
      return { ok: false, error: "Empty message", status: 400 };
    }
    if (content.length > config.maxMessageChars) {
      return {
        ok: false,
        error: `Message too long (max ${config.maxMessageChars})`,
        status: 400,
      };
    }
    normalized.push({ role, content: content.trim() });
  }

  if (sessionId != null && typeof sessionId !== "string") {
    return { ok: false, error: "Invalid sessionId", status: 400 };
  }

  if (hall !== undefined && typeof hall !== "string") {
    return { ok: false, error: "Invalid hall", status: 400 };
  }

  return { ok: true, messages: normalized };
}
