"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { MessageBubble } from "@/components/ellis/MessageBubble";
import type { ConsolidationStatus } from "@/lib/ellis/consolidation";
import {
  isPublicExpression,
  type PublicExpression,
} from "@/lib/ellis/publicExpression";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  expression?: PublicExpression;
};

const PUBLIC_PROMPTS = [
  "What has Ty actually built?",
  "How does she think about AI?",
  "Share a role",
] as const;

const ROLE_DRAFT = "Here's the role I'm considering Ty for: ";

const OWNER_PROMPTS = [
  "What do you remember?",
  "What changed while I was away?",
  "Where should we go today?",
] as const;

type ChatPanelProps = {
  chatEnabled: boolean;
  mode: "onboarding" | "public";
  hall?: string;
  openingMessage?: string;
  isOwner?: boolean;
  maxMessageChars?: number;
  maxHistoryMessages?: number;
  initialConsolidation: ConsolidationStatus;
};

export function ChatPanel({
  chatEnabled,
  mode,
  hall = "default",
  openingMessage,
  isOwner = false,
  maxMessageChars = 12000,
  maxHistoryMessages = 30,
  initialConsolidation,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    openingMessage ? [{ role: "assistant", content: openingMessage }] : [],
  );
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consolidation, setConsolidation] = useState(initialConsolidation);
  const abortRef = useRef<AbortController | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const storageKey = `ellis:chat:${hall}`;
  const [restored, setRestored] = useState(false);
  const showThreshold =
    restored &&
    !consolidation.active &&
    !messages.some((message) => message.role === "user");
  const suggestedPrompts = isOwner ? OWNER_PROMPTS : PUBLIC_PROMPTS;

  useEffect(() => {
    const restoreId = window.setTimeout(() => {
      try {
        const saved = window.sessionStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as {
            messages?: ChatMessage[];
            sessionId?: string | null;
          };
          if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
            setMessages(parsed.messages);
          }
          if (parsed.sessionId) setSessionId(parsed.sessionId);
        }
      } catch {
        // Malformed or blocked storage should cost the transcript, not the page.
      }
      setRestored(true);
    }, 0);

    return () => window.clearTimeout(restoreId);
  }, [storageKey]);

  useEffect(() => {
    if (!restored) return;
    try {
      const last = messages[messages.length - 1];
      const durable =
        last?.role === "assistant" && !last.content
          ? messages.slice(0, -1)
          : messages;

      if (!durable.some((message) => message.role === "user")) {
        window.sessionStorage.removeItem(storageKey);
        return;
      }

      window.sessionStorage.setItem(
        storageKey,
        JSON.stringify({ messages: durable, sessionId }),
      );
    } catch {
      // Over quota or storage disabled — the live conversation still works.
    }
  }, [restored, messages, sessionId, storageKey]);

  useEffect(() => {
    if (!restored) return;
    const node = transcriptRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [restored, messages, streaming]);

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 160)}px`;
  }, [input]);

  useEffect(() => {
    let cancelled = false;

    async function refreshConsolidation() {
      try {
        const response = await fetch("/api/ellis/status", {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = (await response.json()) as {
          consolidation?: ConsolidationStatus;
        };
        if (!cancelled && payload.consolidation) {
          setConsolidation(payload.consolidation);
        }
      } catch {
        // The stream route still enforces the boundary if status polling fails.
      }
    }

    void refreshConsolidation();
    const pollId = window.setInterval(refreshConsolidation, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(pollId);
    };
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!chatEnabled || consolidation.active || streaming || !text.trim())
        return;

      setError(null);
      const userMessage: ChatMessage = { role: "user", content: text.trim() };
      const nextMessages = [...messages, userMessage];
      setMessages([...nextMessages, { role: "assistant", content: "" }]);
      setInput("");
      setStreaming(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/ellis/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages.slice(-maxHistoryMessages),
            ...(sessionId ? { sessionId } : {}),
            hall,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as {
            error?: string;
            consolidation?: ConsolidationStatus;
          };

          if (response.status === 423 && payload.consolidation) {
            setConsolidation(payload.consolidation);
            setMessages(messages);
            setInput(text);
            return;
          }

          throw new Error(
            payload.error ?? `Request failed (${response.status})`,
          );
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data: ")) continue;
            const payload = JSON.parse(line.slice(6)) as {
              type: string;
              sessionId?: string;
              text?: string;
              message?: string;
              expression?: unknown;
            };

            if (payload.type === "session" && payload.sessionId) {
              setSessionId(payload.sessionId);
            } else if (payload.type === "token" && payload.text) {
              setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last?.role === "assistant") {
                  copy[copy.length - 1] = {
                    ...last,
                    content: last.content + payload.text,
                  };
                }
                return copy;
              });
            } else if (payload.type === "error" && payload.message) {
              throw new Error(payload.message);
            } else if (
              payload.type === "done" &&
              isPublicExpression(payload.expression)
            ) {
              setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last?.role === "assistant" && last.content) {
                  copy[copy.length - 1] = {
                    ...last,
                    expression: payload.expression as PublicExpression,
                  };
                }
                return copy;
              });
            }
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant" && !last.content) {
            copy.pop();
          }
          return copy;
        });
      } finally {
        setStreaming(false);
      }
    },
    [
      chatEnabled,
      consolidation.active,
      streaming,
      messages,
      sessionId,
      hall,
      maxHistoryMessages,
    ],
  );

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <section
      aria-label="Ellis chat"
      className="mx-auto flex min-h-0 w-full max-w-[48rem] flex-1 flex-col"
    >
      <div
        ref={transcriptRef}
        aria-live="polite"
        className="chat-scroll flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-1 py-5 sm:py-7"
      >
        {showThreshold ? (
          <div className="hall-threshold" aria-labelledby="hall-title">
            <p className="hall-threshold__eyebrow">
              {isOwner
                ? "The familiar hall"
                : "Ty Bennett / interactive portfolio"}
            </p>
            <h1 id="hall-title" className="hall-threshold__title">
              {isOwner
                ? "The hall remembers you."
                : "A portfolio that answers back."}
            </h1>
            <p className="hall-threshold__lede">
              {isOwner
                ? "This is your public-side conversation with Ellis. Your owner memory remains durable here; his private room is through the inner threshold above."
                : "Ellis is an AI host built by Ty to explain her work, challenge easy conclusions, and help you decide whether the fit is real."}
            </p>
            {chatEnabled ? (
              <div className="hall-prompts" aria-label="Conversation starters">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      if (!isOwner && prompt === "Share a role") {
                        setInput((current) => current || ROLE_DRAFT);
                        textareaRef.current?.focus();
                        return;
                      }
                      void sendMessage(prompt);
                    }}
                    className="hall-prompt focus-ring"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {messages.map((message, index) => (
          <MessageBubble
            key={`${index}-${message.role}`}
            role={message.role}
            content={message.content}
            expression={
              isPublicExpression(message.expression)
                ? message.expression
                : undefined
            }
            streaming={
              streaming &&
              index === messages.length - 1 &&
              message.role === "assistant"
            }
          />
        ))}

        {consolidation.active ? (
          <div
            className="border-border/70 bg-surface-1/40 mt-auto rounded-2xl border px-5 py-6 sm:px-6"
            role="status"
          >
            <p className="text-accent text-[0.65rem] tracking-[0.24em] uppercase">
              Consolidation window
            </p>
            <h1 className="text-text-primary mt-3 text-2xl font-medium tracking-tight">
              Ellis is unavailable.
            </h1>
            <p className="text-text-secondary mt-3 max-w-[34rem] text-sm leading-relaxed">
              The hall closes to contact from {consolidation.windowLabel}. There
              is no access override. Return after the window closes.
            </p>
          </div>
        ) : null}
      </div>

      {!chatEnabled ? (
        <div className="shrink-0 pb-2">
          <p className="text-text-secondary text-sm leading-relaxed">
            The hall is locked.{" "}
            <Link
              href="/onboarding"
              className="text-text-primary focus-ring underline-offset-4 hover:underline"
            >
              It&apos;s you
            </Link>
            .
          </p>
        </div>
      ) : consolidation.active ? null : (
        <form className="shrink-0 pt-2 pb-2" onSubmit={onSubmit}>
          <label htmlFor="ellis-input" className="sr-only">
            Message Ellis
          </label>
          <div className="composer flex items-end gap-3 rounded-2xl px-4 py-3">
            <textarea
              id="ellis-input"
              ref={textareaRef}
              rows={1}
              value={input}
              disabled={streaming || consolidation.active}
              maxLength={maxMessageChars}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage(input);
                }
              }}
              placeholder={
                mode === "onboarding" ? "Tell him something…" : "Message Ellis…"
              }
              className="text-text-primary placeholder:text-text-secondary/55 max-h-40 min-h-[1.5rem] w-full resize-none bg-transparent text-base leading-relaxed focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={streaming || consolidation.active || !input.trim()}
              className="focus-ring text-accent shrink-0 pb-0.5 text-sm tracking-wide uppercase disabled:cursor-not-allowed disabled:opacity-30"
            >
              {streaming ? "…" : "Send"}
            </button>
          </div>
          {error ? (
            <p className="text-text-secondary mt-2 text-sm" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
