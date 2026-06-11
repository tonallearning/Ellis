import { ProjectCard } from "@/components/hall/ProjectCard";
import { PROJECTS } from "@/lib/site";

const OPENING =
  "I'm Ellis — I host conversations here so you can assess whether Ty is a fit. I don't know her work yet; she's still walking me through it. Ask anyway — I'll be honest about what I don't know.";

export function ChatPanelShell() {
  return (
    <section
      aria-label="Ellis chat"
      className="glass-panel mx-auto flex w-full max-w-2xl flex-col rounded-3xl p-6 sm:p-8"
    >
      <header className="border-glass-border border-b pb-5">
        <p className="font-display text-text-secondary text-xs tracking-[0.28em] uppercase">
          Ellis
        </p>
        <h1 className="text-text-primary mt-2 text-2xl font-medium tracking-tight sm:text-3xl">
          Ellis Hall
        </h1>
        <p className="text-text-secondary mt-1 text-sm">
          Chat ships in Phase B — this is the shell.
        </p>
      </header>

      <div aria-live="polite" className="flex flex-1 flex-col gap-4 py-6">
        <article className="bg-surface-1/60 rounded-2xl px-4 py-4 sm:px-5">
          <div className="mb-3 flex items-center gap-2">
            <span
              aria-hidden
              className="stream-pulse bg-accent h-2 w-2 rounded-full"
            />
            <span className="text-text-secondary text-xs tracking-wide uppercase">
              Ellis
            </span>
          </div>
          <p className="text-text-primary max-w-prose text-base leading-relaxed">
            {OPENING}
          </p>
        </article>

        <div className="grid gap-3 sm:grid-cols-1">
          <p className="text-text-secondary text-xs tracking-wide uppercase">
            Project rooms
          </p>
          {PROJECTS.map((project) => (
            <ProjectCard key={project.slug} {...project} />
          ))}
        </div>
      </div>

      <div
        aria-disabled="true"
        className="border-glass-border mt-auto border-t pt-5"
      >
        <label htmlFor="ellis-input" className="sr-only">
          Message Ellis
        </label>
        <div className="chat-input-wrap rounded-2xl px-4 py-3">
          <textarea
            id="ellis-input"
            rows={2}
            disabled
            placeholder="Message Ellis — streaming in Phase B"
            className="text-text-primary placeholder:text-text-secondary/70 w-full resize-none bg-transparent text-base focus:outline-none disabled:cursor-not-allowed"
          />
        </div>
        <p className="text-text-secondary mt-2 text-xs">
          Session-only. No cross-visit memory.
        </p>
      </div>
    </section>
  );
}
