import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  BUILD_LOG_SOURCES,
  getBuildLogPath,
  type BuildLogKind,
} from "./registry";

export type LoadedBuildLog = {
  sourceId: string;
  kind: BuildLogKind;
  markdown: string;
  relativePath: string;
};

export async function loadBuildLog(
  sourceId: string,
  kind: BuildLogKind,
): Promise<LoadedBuildLog | null> {
  const relativePath = getBuildLogPath(sourceId, kind);
  if (!relativePath) return null;

  const absolutePath = path.join(process.cwd(), relativePath);
  const markdown = await readFile(absolutePath, "utf8");

  return { sourceId, kind, markdown, relativePath };
}

export async function loadAllBuildLogs(): Promise<LoadedBuildLog[]> {
  const loads = BUILD_LOG_SOURCES.flatMap((source) =>
    (["research", "debug"] as const).map((kind) =>
      loadBuildLog(source.id, kind),
    ),
  );

  const results = await Promise.all(loads);
  return results.filter((entry): entry is LoadedBuildLog => entry !== null);
}
