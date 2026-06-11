"use client";

import { useMemo, useState } from "react";
import { BuildLogMarkdown } from "@/components/build-log/BuildLogMarkdown";
import { extractLogBody } from "@/lib/buildLogs/extractLogBody";
import {
  BUILD_LOG_SOURCES,
  type BuildLogKind,
} from "@/lib/buildLogs/registry";

export type BuildLogPanelProps = {
  logs: Array<{
    sourceId: string;
    kind: BuildLogKind;
    markdown: string;
    relativePath: string;
  }>;
};

const KIND_LABELS: Record<BuildLogKind, string> = {
  research: "Research log",
  debug: "Debug log",
};

export function BuildLogPanel({ logs }: BuildLogPanelProps) {
  const [sourceId, setSourceId] = useState(BUILD_LOG_SOURCES[0]?.id ?? "ellis");
  const [kind, setKind] = useState<BuildLogKind>("research");

  const active = useMemo(
    () => logs.find((entry) => entry.sourceId === sourceId && entry.kind === kind),
    [logs, sourceId, kind],
  );

  const source = BUILD_LOG_SOURCES.find((s) => s.id === sourceId);
  const body = active ? extractLogBody(active.markdown) : "";

  return (
    <section
      aria-label="Build logs"
      className="glass-panel flex w-full max-w-4xl flex-col rounded-3xl p-6 sm:p-8"
    >
      <header className="border-glass-border border-b pb-5">
        <p className="font-display text-text-secondary text-xs tracking-[0.28em] uppercase">
          Log
        </p>
        <h2 className="text-text-primary mt-2 text-2xl font-medium tracking-tight">
          Think in writing. Build in slices. Log the friction.
        </h2>
        <p className="text-text-secondary mt-2 max-w-2xl text-sm leading-relaxed">
          Ty keeps a research log (decisions + why) and a debug log (symptom →
          fix) for shipped work. Not performative — these files are how she
          re-enters after four kids and four hours of sleep.
        </p>
      </header>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Project"
        >
          {BUILD_LOG_SOURCES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={sourceId === item.id}
              onClick={() => setSourceId(item.id)}
              className={
                sourceId === item.id
                  ? "focus-ring bg-accent rounded-full px-4 py-2 text-sm font-medium text-white"
                  : "focus-ring border-glass-border text-text-secondary hover:text-text-primary rounded-full border px-4 py-2 text-sm"
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          className="flex flex-wrap gap-2 sm:ml-auto"
          role="tablist"
          aria-label="Log type"
        >
          {(["research", "debug"] as const).map((logKind) => (
            <button
              key={logKind}
              type="button"
              role="tab"
              aria-selected={kind === logKind}
              onClick={() => setKind(logKind)}
              className={
                kind === logKind
                  ? "focus-ring bg-surface-2 text-text-primary rounded-full px-4 py-2 text-sm font-medium shadow-sm"
                  : "focus-ring border-glass-border text-text-secondary hover:text-text-primary rounded-full border px-4 py-2 text-sm"
              }
            >
              {KIND_LABELS[logKind]}
            </button>
          ))}
        </div>
      </div>

      {source ? (
        <p className="text-text-secondary mt-4 text-sm">{source.tagline}</p>
      ) : null}

      <div className="border-glass-border mt-5 max-h-[min(62vh,680px)] flex-1 overflow-y-auto border-t pt-5">
        {active ? (
          <>
            <p className="text-text-secondary mb-4 font-mono text-xs">
              {active.relativePath}
            </p>
            <BuildLogMarkdown markdown={body} />
          </>
        ) : (
          <p className="text-text-secondary text-sm">Log file not found.</p>
        )}
      </div>
    </section>
  );
}
