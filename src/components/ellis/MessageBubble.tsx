type MessageBubbleProps = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

export function MessageBubble({
  role,
  content,
  streaming,
}: MessageBubbleProps) {
  const isEllis = role === "assistant";

  return (
    <article className={isEllis ? "pr-8 sm:pr-16" : "pl-8 sm:pl-16"}>
      <p
        className={
          isEllis
            ? "text-text-secondary mb-2 text-[0.65rem] tracking-[0.22em] uppercase"
            : "text-text-secondary mb-2 text-right text-[0.65rem] tracking-[0.22em] uppercase"
        }
      >
        {isEllis ? "Ellis" : "You"}
      </p>
      <p
        className={
          isEllis
            ? "text-text-primary max-w-prose text-[1.05rem] leading-[1.7] whitespace-pre-wrap"
            : "text-text-primary ml-auto max-w-prose text-right text-[1.05rem] leading-[1.7] whitespace-pre-wrap"
        }
      >
        {content}
        {streaming ? (
          <span aria-hidden className="text-accent ml-0.5">
            ▍
          </span>
        ) : null}
      </p>
    </article>
  );
}
