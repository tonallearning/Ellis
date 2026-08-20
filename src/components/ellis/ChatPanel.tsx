"use client";

import Link from "next/link";
import { FormEvent, useCallback, useRef, useState } from "react";
import { MessageBubble } from "@/components/ellis/MessageBubble";
import {
  detectProjectHandoffs,
  ProjectHandoff,
} from "@/components/ellis/ProjectHandoff";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatPanelProps = {
  chatEnabled: boolean;
  mode: "onboarding" | "public";
  hall?: string;
  variant?: "default" | "anthropic";
  title?: string;
  subtitle?: string;
  openingMessage?: string;
  maxMessageChars?: number;
};

export function ChatPanel({
  chatEnabled,
  mode,
  hall = "default",
  variant = "default",
  title,
  subtitle,
  openingMessage,
  maxMessageChars = 12000,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    openingMessage
      ? [{ role: "assistant", content: openingMessage }]
      : [],
  );
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!chatEnabled || streaming || !text.trim()) return;

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
            messages: nextMessages,
            ...(sessionId ? { sessionId } : {}),
            hall,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(payload.error ?? `Request failed (${response.status})`);
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
            }
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : "Something went wrong";
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
    [chatEnabled, streaming, messages, sessionId, hall],
  );

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  const panelClass =
    variant === "anthropic"
      ? "anthropic-chat-panel glass-panel mx-auto flex w-full max-w-2xl flex-col rounded-3xl p-6 sm:p-8"
      : "glass-panel mx-auto flex w-full max-w-2xl flex-col rounded-3xl p-6 sm:p-8";

  const headerLabel = variant === "anthropic" ? "Anthropic" : "Ellis";
  const headerTitle = title ?? (variant === "anthropic" ? "Claude?" : "Ellis Hall");
  const headerSubtitle =
    subtitle ??
    (mode === "onboarding"
      ? "Onboarding mode — Ty teaches Ellis"
      : "Ellis may remember this conversation for up to 7 days if you return");

  return (
    <section aria-label="Ellis chat" className={panelClass}>
      <header className="border-glass-border border-b pb-5">
        <p className="font-display text-text-secondary text-xs tracking-[0.28em] uppercase">
          {headerLabel}
        </p>
        <h1 className="text-text-primary mt-2 text-2xl font-medium tracking-tight sm:text-3xl">
          {headerTitle}
        </h1>
        <p className="text-text-secondary mt-1 text-sm">{headerSubtitle}</p>
      </header>

      <div aria-live="polite" className="flex max-h-[min(52vh,520px)] flex-1 flex-col gap-4 overflow-y-auto py-6">
        {messages.map((message, index) => {
          const showHandoffs =
            message.role === "assistant" &&
            message.content.length > 0 &&
            !(streaming && index === messages.length - 1);

          const handoffs = showHandoffs
            ? detectProjectHandoffs(message.content)
            : [];

          return (
            <MessageBubble
              key={`${index}-${message.role}`}
              role={message.role}
              content={message.content}
              streaming={
                streaming &&
                index === messages.length - 1 &&
                message.role === "assistant"
              }
              handoffs={
                handoffs.length > 0 ? (
                  <ProjectHandoff projects={handoffs} />
                ) : null
              }
            />
          );
        })}
      </div>

      {!chatEnabled ? (
        <div className="border-glass-border mt-auto border-t pt-5">
          <p className="text-text-secondary text-sm leading-relaxed">
            Ellis is in onboarding mode. Ty can unlock chat at{" "}
            <Link href="/onboarding" className="text-accent focus-ring underline-offset-4 hover:underline">
              /onboarding
            </Link>
            .
          </p>
        </div>
      ) : (
        <form className="border-glass-border mt-auto border-t pt-5" onSubmit={onSubmit}>
          <label htmlFor="ellis-input" className="sr-only">
            Message Ellis
          </label>
          <div className="chat-input-wrap rounded-2xl px-4 py-3">
            <textarea
              id="ellis-input"
              rows={4}
              value={input}
              disabled={streaming}
              maxLength={maxMessageChars}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage(input);
                }
              }}
              placeholder={
                mode === "onboarding"
                  ? "Ty — teach Ellis…"
                  : "Message Ellis…"
              }
              className="text-text-primary placeholder:text-text-secondary/70 w-full resize-none bg-transparent text-base focus:outline-none disabled:opacity-60"
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-text-secondary text-xs">
              {input.length > 0
                ? `${input.length.toLocaleString()} / ${maxMessageChars.toLocaleString()}`
                : "7-day recall from this connection. No profile."}
            </p>
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="focus-ring bg-accent min-h-11 rounded-full px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {streaming ? "Ellis is typing…" : "Send"}
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
