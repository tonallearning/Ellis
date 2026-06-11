"use client";

import type { ReactNode } from "react";

type MessageBubbleProps = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  handoffs?: ReactNode;
};

export function MessageBubble({
  role,
  content,
  streaming,
  handoffs,
}: MessageBubbleProps) {
  const isEllis = role === "assistant";

  return (
    <article
      className={
        isEllis
          ? "bg-surface-1/60 rounded-2xl px-4 py-4 sm:px-5"
          : "border-glass-border ml-8 rounded-2xl border px-4 py-3 sm:ml-12"
      }
    >
      <div className="mb-2 flex items-center gap-2">
        {isEllis ? (
          <span
            aria-hidden
            className={`bg-accent h-2 w-2 rounded-full ${streaming ? "stream-pulse" : ""}`}
          />
        ) : null}
        <span className="text-text-secondary text-xs tracking-wide uppercase">
          {isEllis ? "Ellis" : "You"}
        </span>
      </div>
      <p className="text-text-primary max-w-prose text-base leading-relaxed whitespace-pre-wrap">
        {content}
        {streaming ? (
          <span aria-hidden className="text-accent ml-0.5">
            ▍
          </span>
        ) : null}
      </p>
      {handoffs}
    </article>
  );
}
