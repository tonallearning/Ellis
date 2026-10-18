import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type { ConsolidationSchedule } from "./consolidation";
import type { EllisMode } from "./types";
import { isOnboardingCookie, isOwnerCookie } from "./owner";

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
  consolidation: ConsolidationSchedule;
};

function positiveNumber(
  name: string,
  fallback: number,
  maximum = Number.POSITIVE_INFINITY,
): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;

  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0 || value > maximum) {
    throw new Error(
      `${name} must be a positive number no greater than ${maximum}`,
    );
  }
  return value;
}

function hour(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || value > 23) {
    throw new Error(`${name} must be a whole hour from 0 through 23`);
  }
  return value;
}

function timeZone(name: string, fallback: string): string {
  const value = process.env[name]?.trim() || fallback;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return value;
  } catch {
    throw new Error(`${name} must be a valid IANA time zone`);
  }
}

export function getEllisConfig(): EllisConfig {
  const mode: EllisMode =
    process.env.ELLIS_MODE === "public" ? "public" : "onboarding";

  const onboardingSecret =
    process.env.ELLIS_ONBOARDING_SECRET?.trim() || undefined;
  if (
    process.env.NODE_ENV === "production" &&
    (!onboardingSecret || onboardingSecret.length < 32)
  ) {
    throw new Error(
      "ELLIS_ONBOARDING_SECRET must contain at least 32 characters in production",
    );
  }

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!anthropicApiKey && process.env.NODE_ENV === "production") {
    throw new Error("ANTHROPIC_API_KEY is required");
  }

  return {
    mode,
    onboardingSecret,
    anthropicApiKey,
    modelHaiku: process.env.ELLIS_MODEL_HAIKU ?? "claude-haiku-4-5-20251001",
    modelSonnet: process.env.ELLIS_MODEL_SONNET ?? "claude-sonnet-5",
    dailyBudgetUsd: positiveNumber("ELLIS_DAILY_BUDGET_USD", 1),
    ipHashSalt: process.env.ELLIS_IP_HASH_SALT || undefined,
    maxMessageChars: positiveNumber("ELLIS_MAX_MESSAGE_CHARS", 12000, 50000),
    maxHistoryMessages: positiveNumber("ELLIS_MAX_HISTORY_MESSAGES", 30, 50),
    consolidation: {
      timeZone: timeZone("ELLIS_TIME_ZONE", "America/Chicago"),
      startHour: hour("ELLIS_CONSOLIDATION_START_HOUR", 2),
      endHour: hour("ELLIS_CONSOLIDATION_END_HOUR", 4),
    },
  };
}

export function isOnboardingChatAllowed(
  config: EllisConfig,
  cookieStore: ReadonlyRequestCookies,
): boolean {
  if (config.mode === "public") return true;

  if (isOwnerCookie(cookieStore, config.onboardingSecret)) return true;

  if (!config.onboardingSecret) {
    return process.env.NODE_ENV === "development";
  }

  return isOnboardingCookie(
    cookieStore,
    ONBOARDING_COOKIE,
    config.onboardingSecret,
  );
}

export function onboardingCookieName(): string {
  return ONBOARDING_COOKIE;
}
