export type BuildLogKind = "research" | "debug";

export type BuildLogSource = {
  id: string;
  label: string;
  tagline: string;
  researchPath: string;
  debugPath: string;
};

/** Portfolio-visible build logs — synced snapshots for deploy. */
export const BUILD_LOG_SOURCES: BuildLogSource[] = [
  {
    id: "ellis",
    label: "tybuilds · Ellis",
    tagline: "Portfolio host — decisions and debug while shipping this site.",
    researchPath: "docs/building/RESEARCH_LOG.md",
    debugPath: "docs/building/DEBUG_LOG.md",
  },
  {
    id: "goe",
    label: "Gardens of Eridu",
    tagline:
      "Inhabited-agent house — world container, ME interior, workshop, Comms office.",
    researchPath: "docs/building/goe/RESEARCH_LOG.md",
    debugPath: "docs/building/goe/DEBUG_LOG.md",
  },
];

export function getBuildLogPath(
  sourceId: string,
  kind: BuildLogKind,
): string | null {
  const source = BUILD_LOG_SOURCES.find((s) => s.id === sourceId);
  if (!source) return null;
  return kind === "research" ? source.researchPath : source.debugPath;
}
