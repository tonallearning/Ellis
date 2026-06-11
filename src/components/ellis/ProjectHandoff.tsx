import Link from "next/link";
import { PROJECTS } from "@/lib/site";

export type ProjectHandoffItem = (typeof PROJECTS)[number];

const PROJECT_HINTS = [
  { pattern: /basement crt|teaching console|crt demo/i, slug: "basement-crt" },
  { pattern: /tonal learning|lexi|lumi|tonallearning/i, slug: "tonal-learning" },
  { pattern: /\bgoe\b|garden of ellis|inhabited agent/i, slug: "goe" },
] as const;

export function detectProjectHandoffs(text: string): ProjectHandoffItem[] {
  const slugs = new Set<string>();
  const matched: ProjectHandoffItem[] = [];
  for (const { pattern, slug } of PROJECT_HINTS) {
    if (pattern.test(text) && !slugs.has(slug)) {
      slugs.add(slug);
      const project = PROJECTS.find((p) => p.slug === slug);
      if (project) matched.push(project);
    }
  }
  return matched;
}

type ProjectHandoffProps = {
  projects: ProjectHandoffItem[];
};

/** Inline room link when Ellis mentions work — not a permanent hall grid. */
export function ProjectHandoff({ projects }: ProjectHandoffProps) {
  if (projects.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {projects.map((project) => (
        <Link
          key={project.slug}
          href={project.href}
          className="focus-ring border-glass-border text-text-primary hover:border-accent/40 inline-flex min-h-11 items-center rounded-full border bg-surface-1/50 px-4 py-2 text-sm transition hover:bg-surface-1"
        >
          Open {project.title} →
        </Link>
      ))}
    </div>
  );
}
