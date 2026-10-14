import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      {isEllis ? (
        <div className="ellis-prose max-w-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          {streaming ? (
            <span aria-hidden className="ellis-cursor text-accent ml-0.5">
              ▍
            </span>
          ) : null}
        </div>
      ) : (
        <p className="text-text-primary ml-auto max-w-prose text-right text-[1.05rem] leading-[1.7] whitespace-pre-wrap">
          {content}
        </p>
      )}
    </article>
  );
}
