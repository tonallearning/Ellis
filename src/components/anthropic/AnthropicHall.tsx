"use client";

import Link from "next/link";
import { useSyncExternalStore, useState } from "react";
import { ProjectCard } from "@/components/hall/ProjectCard";
import { ChatPanel } from "@/components/ellis/ChatPanel";
import { BuildLogPanel, type BuildLogPanelProps } from "@/components/build-log/BuildLogPanel";
import { PROJECTS } from "@/lib/site";

const OVERLAY_KEY = "ellis-anthropic-overlay";

function getOverlaySnapshot(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(OVERLAY_KEY) !== "off";
}

function subscribeOverlay(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("ellis-anthropic-overlay", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("ellis-anthropic-overlay", handler);
  };
}

type AnthropicTab = "think" | "build" | "log";

type AnthropicHallProps = {
  chatEnabled: boolean;
  mode: "onboarding" | "public";
  openingMessage: string;
  maxMessageChars: number;
  logs: BuildLogPanelProps["logs"];
};

export function AnthropicHall({
  chatEnabled,
  mode,
  openingMessage,
  maxMessageChars,
  logs,
}: AnthropicHallProps) {
  const [tab, setTab] = useState<AnthropicTab>("think");
  const overlayOn = useSyncExternalStore(
    subscribeOverlay,
    getOverlaySnapshot,
    () => true,
  );

  function toggleOverlay() {
    const next = !overlayOn;
    localStorage.setItem(OVERLAY_KEY, next ? "on" : "off");
    window.dispatchEvent(new Event("ellis-anthropic-overlay"));
  }

  return (
    <div
      className={
        overlayOn
          ? "anthropic-hall flex flex-1 flex-col px-4 pb-8 pt-2 sm:px-6"
          : "flex flex-1 flex-col px-4 pb-8 pt-2 sm:px-6"
      }
      data-overlay={overlayOn ? "on" : "off"}
    >
      <div className="mx-auto mb-4 flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-text-secondary text-xs tracking-[0.28em] uppercase">
            {overlayOn ? "Anthropic hall" : "Ellis · Anthropic context"}
          </p>
          <h1 className="text-text-primary mt-1 text-2xl font-medium tracking-tight sm:text-3xl">
            Think · Build · Log
          </h1>
          <p className="text-text-secondary mt-1 max-w-xl text-sm leading-relaxed">
            Ty&apos;s Fellows URL — talk to Ellis, see what she ships, read how
            she documents it.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleOverlay}
          className="focus-ring border-glass-border text-text-secondary hover:text-text-primary self-start rounded-full border px-4 py-2 text-sm sm:self-auto"
        >
          {overlayOn ? "Show Ellis chrome" : "Claude look"}
        </button>
      </div>

      <nav
        className="mx-auto mb-6 flex w-full max-w-4xl gap-2"
        aria-label="Anthropic hall sections"
      >
        {(
          [
            ["think", "Think", "Talk to Ellis"],
            ["build", "Build", "Projects"],
            ["log", "Log", "Research + debug"],
          ] as const
        ).map(([id, label, hint]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id ? "page" : undefined}
            className={
              tab === id
                ? "focus-ring bg-accent flex min-h-11 flex-1 flex-col items-center justify-center rounded-2xl px-3 py-2 text-white"
                : "focus-ring border-glass-border text-text-secondary hover:text-text-primary flex min-h-11 flex-1 flex-col items-center justify-center rounded-2xl border px-3 py-2"
            }
          >
            <span className="text-sm font-medium">{label}</span>
            <span
              className={
                tab === id
                  ? "text-xs text-white/80"
                  : "text-text-secondary text-xs"
              }
            >
              {hint}
            </span>
          </button>
        ))}
      </nav>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        {tab === "think" ? (
          <ChatPanel
            chatEnabled={chatEnabled}
            mode={mode}
            hall="anthropic"
            maxMessageChars={maxMessageChars}
            variant={overlayOn ? "anthropic" : "default"}
            title={overlayOn ? "Claude?" : "Ellis"}
            subtitle={
              overlayOn
                ? "Hook first — then honest disclosure. Session-only this visit."
                : "Anthropic context — enthusiasm without cosplay."
            }
            openingMessage={openingMessage}
          />
        ) : null}

        {tab === "build" ? (
          <section className="glass-panel rounded-3xl p-6 sm:p-8">
            <header className="border-glass-border border-b pb-5">
              <p className="font-display text-text-secondary text-xs tracking-[0.28em] uppercase">
                Build
              </p>
              <h2 className="text-text-primary mt-2 text-2xl font-medium tracking-tight">
                What Ty ships
              </h2>
              <p className="text-text-secondary mt-2 max-w-2xl text-sm leading-relaxed">
                Next.js, TypeScript, Supabase, Vercel — same stack defaults.
                Ellis is the portfolio host; GoE is the inhabited-agent lab
                (teased publicly, not leaked).
              </p>
            </header>
            <ul className="mt-6 grid gap-4">
              {PROJECTS.map((project) => (
                <li key={project.slug}>
                  <ProjectCard {...project} />
                </li>
              ))}
            </ul>
            <p className="text-text-secondary mt-6 text-sm">
              Full decision history lives under{" "}
              <button
                type="button"
                onClick={() => setTab("log")}
                className="text-accent focus-ring underline-offset-4 hover:underline"
              >
                Log
              </button>
              . Generic applications use{" "}
              <Link
                href="/"
                className="text-accent focus-ring underline-offset-4 hover:underline"
              >
                tybuilds.tech/
              </Link>
              .
            </p>
          </section>
        ) : null}

        {tab === "log" ? <BuildLogPanel logs={logs} /> : null}
      </main>
    </div>
  );
}
