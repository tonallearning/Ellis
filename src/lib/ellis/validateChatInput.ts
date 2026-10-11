import { isValidHall } from "./halls/registry";

export type ValidatedChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ValidatedChatRequest = {
  messages: ValidatedChatMessage[];
  sessionId?: string;
  hall: string;
};

export type ChatInputLimits = {
  maxMessageChars: number;
  maxHistoryMessages: number;
};

type ValidationResult =
  | { ok: true; value: ValidatedChatRequest }
  | { ok: false; error: string };

const SESSION_ID_PATTERN =
  /^session-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateChatInput(
  input: unknown,
  limits: ChatInputLimits,
): ValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Request body must be an object" };
  }

  const candidate = input as Record<string, unknown>;
  if (!Array.isArray(candidate.messages) || candidate.messages.length === 0) {
    return { ok: false, error: "Messages required" };
  }
  if (candidate.messages.length > limits.maxHistoryMessages) {
    return { ok: false, error: "Conversation history is too long" };
  }

  const messages: ValidatedChatMessage[] = [];
  for (const [index, message] of candidate.messages.entries()) {
    if (!message || typeof message !== "object" || Array.isArray(message)) {
      return { ok: false, error: "Invalid message" };
    }

    const item = message as Record<string, unknown>;
    if (item.role !== "user" && item.role !== "assistant") {
      return { ok: false, error: "Invalid message role" };
    }
    if (
      typeof item.content !== "string" ||
      item.content.trim().length === 0 ||
      item.content.length > limits.maxMessageChars
    ) {
      return { ok: false, error: "Invalid message content" };
    }
    if (index > 0 && messages[index - 1]?.role === item.role) {
      return { ok: false, error: "Message roles must alternate" };
    }

    messages.push({ role: item.role, content: item.content });
  }

  if (messages[messages.length - 1]?.role !== "user") {
    return { ok: false, error: "The last message must be from the user" };
  }

  const hall = typeof candidate.hall === "string" ? candidate.hall : "default";
  if (!isValidHall(hall)) {
    return { ok: false, error: "Invalid hall" };
  }

  let sessionId: string | undefined;
  if (candidate.sessionId !== undefined) {
    if (
      typeof candidate.sessionId !== "string" ||
      !SESSION_ID_PATTERN.test(candidate.sessionId)
    ) {
      return { ok: false, error: "Invalid session" };
    }
    sessionId = candidate.sessionId;
  }

  return { ok: true, value: { messages, sessionId, hall } };
}
