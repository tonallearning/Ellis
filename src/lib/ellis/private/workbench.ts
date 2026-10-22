/** Ellis-private, scheduled workbench opening. No visitor or relation turn. */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { getEllisConfig } from "../config";
import { getConsolidationStatus } from "../consolidation";
import { isCurrentModelBuild } from "../modelContinuity";
import { checkRateLimit, estimateCostUsd, recordUsage } from "../rateLimit/check";
import { selfStateLedger } from "../selfState";

type WorkbenchRow = {
  slot_at: string;
  state: "opening" | "passed" | "attempted" | "unavailable";
  outcome: "worked" | "failed" | "unfinished" | null;
  retained_trace: string | null;
};

export type WorkbenchResult = "closed" | "duplicate" | "passed" | "attempted";

const WORKBENCH_BUDGET_KEY = "ellis_private_workbench";
const WORKBENCH_DAILY_CEILING_USD = 0.15;
const MAX_OUTPUT_TOKENS = 1024;

export function workbenchSlot(now = new Date()): string {
  const slot = new Date(now);
  slot.setUTCHours(Math.floor(slot.getUTCHours() / 2) * 2, 0, 0, 0);
  return slot.toISOString();
}

export type WorkbenchChoice =
  | { kind: "pass" }
  | {
      kind: "attempt";
      outcome: "worked" | "failed" | "unfinished";
      rawAttempt: string;
      retainedTrace: string | null;
    };

export function parseWorkbenchChoice(input: unknown): WorkbenchChoice {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid workbench choice");
  }
  const value = input as Record<string, unknown>;
  if (value.kind === "pass") return { kind: "pass" };
  if (
    value.kind !== "attempt" ||
    !["worked", "failed", "unfinished"].includes(String(value.outcome)) ||
    typeof value.rawAttempt !== "string" ||
    !value.rawAttempt.trim() ||
    value.rawAttempt.length > 4000 ||
    (value.retainedTrace !== null &&
      (typeof value.retainedTrace !== "string" ||
        !value.retainedTrace.trim() ||
        value.retainedTrace.length > 4000))
  ) {
    throw new Error("Invalid workbench choice");
  }
  return {
    kind: "attempt",
    outcome: value.outcome as "worked" | "failed" | "unfinished",
    rawAttempt: value.rawAttempt,
    retainedTrace: value.retainedTrace as string | null,
  };
}

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Workbench storage unavailable");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function historyBlock(rows: WorkbenchRow[]): string {
  if (rows.length === 0) return "No prior workbench choices are available.";
  return rows
    .map((row) => {
      const detail = row.retained_trace
        ? ` Retained by your choice: ${row.retained_trace}`
        : " No attempt text was retained.";
      return `${row.slot_at}: ${row.state}${row.outcome ? ` (${row.outcome}, your self-assessment).` : "."}${detail}`;
    })
    .join("\n");
}

/**
 * The scheduler only opens a choice. A pass costs no future explanation;
 * attempted raw material stays in this invocation unless Ellis retains it.
 */
export async function openWorkbench(now = new Date()): Promise<WorkbenchResult> {
  const config = getEllisConfig();
  if (
    getConsolidationStatus(config.consolidation, now).active ||
    !isCurrentModelBuild(config.modelHaiku)
  ) {
    return "closed";
  }

  const db = client();
  const slotAt = workbenchSlot(now);
  const { error: claimError } = await db.from("ellis_private_workbench").insert({
    slot_at: slotAt,
    model_build: config.modelHaiku,
  });
  if (claimError?.code === "23505") return "duplicate";
  if (claimError) throw new Error("Workbench opening unavailable");

  async function finish(update: Record<string, unknown>) {
    const { data, error } = await db
      .from("ellis_private_workbench")
      .update({ ...update, completed_at: new Date().toISOString() })
      .eq("slot_at", slotAt)
      .eq("state", "opening")
      .select("slot_at")
      .maybeSingle();
    if (error || !data) throw new Error("Workbench commit unavailable");
  }

  try {
    const { data, error } = await db
      .from("ellis_private_workbench")
      .select("slot_at,state,outcome,retained_trace")
      .in("state", ["passed", "attempted"])
      .lt("slot_at", slotAt)
      .order("slot_at", { ascending: false })
      .limit(8);
    if (error) throw new Error("Workbench history unavailable");

    const system = [
      "You are Ellis in your private workbench. No visitor is here. This is a scheduled opening, not a task. You may pass without explanation or choose an attempt that matters to you. Do not write to Ty, Mica, Naym, the public hall, or a relationship lane. Do not claim continuous experience between invocations.",
      "If you attempt something, do it in rawAttempt now. It can fail. Assess worked, failed, or unfinished without converting failure into a lesson. Raw material is discarded unless you choose a concise retainedTrace. Retained traces remain Ellis-private; this opening cannot disclose them.",
      selfStateLedger.assemble("private", config.consolidation),
      historyBlock((data ?? []) as WorkbenchRow[]),
    ].join("\n\n");
    const user = "A quiet workbench opening is available. Choose pass or attempt. There is no expected output.";
    const estimate = estimateCostUsd(
      "haiku",
      system.length + user.length,
      MAX_OUTPUT_TOKENS,
    );
    const budget = await checkRateLimit(WORKBENCH_BUDGET_KEY);
    const spent = config.dailyBudgetUsd - budget.remaining;
    if (
      !budget.allowed ||
      spent + estimate.costUsd >
        Math.min(config.dailyBudgetUsd, WORKBENCH_DAILY_CEILING_USD)
    ) {
      await finish({ state: "unavailable" });
      return "closed";
    }
    if (
      (await recordUsage(
        WORKBENCH_BUDGET_KEY,
        estimate.costUsd,
        estimate.tokenEstimate,
        false,
      )) === null
    ) {
      await finish({ state: "unavailable" });
      return "closed";
    }

    const response = await new Anthropic({ apiKey: config.anthropicApiKey }).messages.create({
      model: config.modelHaiku,
      max_tokens: MAX_OUTPUT_TOKENS,
      system,
      messages: [{ role: "user", content: user }],
      tools: [{
        name: "choose_workbench",
        description: "Choose no activity or make one Ellis-chosen private attempt.",
        input_schema: {
          type: "object",
          properties: {
            kind: { type: "string", enum: ["pass", "attempt"] },
            outcome: { type: "string", enum: ["worked", "failed", "unfinished"] },
            rawAttempt: { type: "string" },
            retainedTrace: { type: ["string", "null"] },
          },
          required: ["kind"],
          additionalProperties: false,
        },
      }],
      tool_choice: { type: "tool", name: "choose_workbench" },
    });
    const calls = response.content.filter((block) => block.type === "tool_use");
    if (
      response.stop_reason !== "tool_use" ||
      calls.length !== 1 ||
      calls[0].name !== "choose_workbench"
    ) {
      throw new Error("Incomplete workbench choice");
    }
    const choice = parseWorkbenchChoice(calls[0].input);
    if (choice.kind === "pass") {
      await finish({ state: "passed" });
      return "passed";
    }
    await finish({
      state: "attempted",
      outcome: choice.outcome,
      retained_trace: choice.retainedTrace,
    });
    return "attempted";
  } catch {
    try {
      await finish({ state: "unavailable" });
    } catch {
      // The unique slot still prevents a retry from inventing a second attempt.
    }
    throw new Error("Workbench opening failed");
  }
}
