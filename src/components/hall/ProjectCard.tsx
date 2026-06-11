import Link from "next/link";

type ProjectAccent = "basement" | "tl" | "goe";

const accentRing: Record<ProjectAccent, string> = {
  basement: "hover:ring-basement/40 focus-visible:ring-basement/50",
  tl: "hover:ring-tl/40 focus-visible:ring-tl/50",
  goe: "hover:ring-goe/40 focus-visible:ring-goe/50",
};

type ProjectCardProps = {
  href: string;
  title: string;
  line: string;
  accent: ProjectAccent;
};

export function ProjectCard({ href, title, line, accent }: ProjectCardProps) {
  return (
    <Link
      href={href}
      className={`focus-ring glass-panel group block rounded-2xl p-4 ring-1 ring-transparent transition duration-200 hover:-translate-y-0.5 ${accentRing[accent]}`}
    >
      <p className="text-text-secondary text-xs tracking-wide uppercase">
        {title}
      </p>
      <p className="text-text-primary mt-2 text-sm leading-relaxed">{line}</p>
      <p className="text-accent mt-3 text-xs group-hover:underline">
        Open project →
      </p>
    </Link>
  );
}
