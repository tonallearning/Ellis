import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { PublicExpression } from "@/lib/ellis/publicExpression";

type MessageBubbleProps = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  label?: string;
  expression?: PublicExpression;
};

function ExpressionMark({ expression }: { expression: PublicExpression }) {
  if (expression === "none") return null;

  const form = {
    attentive: { arc: "M2 10 Q12 1 22 10", dot: 12, opacity: 0.8 },
    softened: { arc: "M2 9 Q12 4 22 9", dot: 12, opacity: 0.56 },
    reserved: { arc: "M2 8 Q12 6 22 8", dot: 8, opacity: 0.46 },
  }[expression];

  return (
    <span
      role="img"
      aria-label={`Ellis chose an expression: ${expression}`}
      className="text-accent inline-flex h-4 w-6 items-center justify-center"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 14"
        width="24"
        height="14"
        fill="none"
        style={{ opacity: form.opacity }}
      >
        <path d={form.arc} stroke="currentColor" strokeWidth="1.2" />
        <circle cx={form.dot} cy="9" r="1.25" fill="currentColor" />
      </svg>
    </span>
  );
}

export function MessageBubble({
  role,
  content,
  streaming,
  label,
  expression,
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
        <span className="inline-flex items-center gap-2">
          {label ?? (isEllis ? "Ellis" : "You")}
          {isEllis && expression ? (
            <ExpressionMark expression={expression} />
          ) : null}
        </span>
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
