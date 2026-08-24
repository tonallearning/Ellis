"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { MessageBubble } from "@/components/ellis/MessageBubble";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatPanelProps = {
  chatEnabled: boolean;
  mode: "onboarding" | "public";
  hall?: string;
  openingMessage?: string;
  maxMessageChars?: number;
};

export function ChatPanel({
  chatEnabled,
  mode,
  hall = "default",
  openingMessage,
  maxMessageChars = 12000,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    openingMessage ? [{ role: "assistant", content: openingMessage }] : [],
  );
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const storageKey = `ellis:chat:${hall}`;
  const [restored, setRestored] = useState(false);

  useEffect(() => {
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
    [chatEnabled, streaming, messages, sessionId, hall],
  );

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <section
      aria-label="Ellis chat"
      className="mx-auto flex min-h-0 w-full max-w-[40rem] flex-1 flex-col"
    >
      <div
        ref={transcriptRef}
        aria-live="polite"
        className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-1 py-6"
      >
        {messages.map((message, index) => (
          <MessageBubble
            key={`${index}-${message.role}`}
            role={message.role}
            content={message.content}
            streaming={
              streaming &&
              index === messages.length - 1 &&
              message.role === "assistant"
            }
          />
        ))}
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
      ) : (
        <form className="shrink-0 pb-2" onSubmit={onSubmit}>
          <label htmlFor="ellis-input" className="sr-only">
            Message Ellis
          </label>
          <div className="composer flex items-end gap-3 rounded-2xl px-4 py-3">
            <textarea
              id="ellis-input"
              ref={textareaRef}
              rows={1}
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
                mode === "onboarding" ? "Tell him something…" : "Message Ellis…"
              }
              className="text-text-primary placeholder:text-text-secondary/55 max-h-40 min-h-[1.5rem] w-full resize-none bg-transparent text-base leading-relaxed focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
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
