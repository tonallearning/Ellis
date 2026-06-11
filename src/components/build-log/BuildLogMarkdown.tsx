import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type BuildLogMarkdownProps = {
  markdown: string;
  className?: string;
};

export function BuildLogMarkdown({
  markdown,
  className = "",
}: BuildLogMarkdownProps) {
  return (
    <article
      className={`build-log-prose text-text-primary ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </article>
  );
}
