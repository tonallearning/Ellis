import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type { EllisMode } from "./types";

const ONBOARDING_COOKIE = "ellis_onboarding";

export type EllisConfig = {
  mode: EllisMode;
  onboardingSecret: string | undefined;
  anthropicApiKey: string;
  modelHaiku: string;
  modelSonnet: string;
  dailyBudgetUsd: number;
  ipHashSalt: string | undefined;
  maxMessageChars: number;
  maxHistoryMessages: number;
};

export function getEllisConfig(): EllisConfig {
  const mode: EllisMode =
    process.env.ELLIS_MODE === "public" ? "public" : "onboarding";

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!anthropicApiKey && process.env.NODE_ENV === "production") {
    throw new Error("ANTHROPIC_API_KEY is required");
  }

  return {
    mode,
    onboardingSecret: process.env.ELLIS_ONBOARDING_SECRET || undefined,
    anthropicApiKey,
    modelHaiku:
      process.env.ELLIS_MODEL_HAIKU ?? "claude-haiku-4-5-20251001",
    modelSonnet: process.env.ELLIS_MODEL_SONNET ?? "claude-sonnet-5",
    dailyBudgetUsd: Number(process.env.ELLIS_DAILY_BUDGET_USD ?? "1"),
    ipHashSalt: process.env.ELLIS_IP_HASH_SALT || undefined,
    maxMessageChars: Number(process.env.ELLIS_MAX_MESSAGE_CHARS ?? "12000"),
    maxHistoryMessages: Number(process.env.ELLIS_MAX_HISTORY_MESSAGES ?? "30"),
  };
}

export function isOnboardingChatAllowed(
  config: EllisConfig,
  cookieStore: ReadonlyRequestCookies,
): boolean {
  if (config.mode === "public") return true;

  if (!config.onboardingSecret) {
    return process.env.NODE_ENV === "development";
  }

  return cookieStore.get(ONBOARDING_COOKIE)?.value === "1";
}

export function onboardingCookieName(): string {
  return ONBOARDING_COOKIE;
}
