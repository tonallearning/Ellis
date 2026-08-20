/**
 * Rate limit gate — daily spend ceiling per visitor IP.
 * Bill protection only: IP-hashed counters, no visitor profiling.
 */

import { createClient } from '@supabase/supabase-js';
import { getEllisConfig } from '../config';

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  warned?: boolean;
  reason?: string;
}

export type EllisModel = 'haiku' | 'sonnet';

/** USD per million tokens. */
const PRICING: Record<EllisModel, { input: number; output: number }> = {
  haiku: { input: 1.0, output: 5.0 },
  sonnet: { input: 3.0, output: 15.0 },
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

const supabase = isConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string)
  : null;

function endOfUtcDay(now: Date): Date {
  const resetAt = new Date(now);
  resetAt.setUTCHours(24, 0, 0, 0);
  return resetAt;
}

function dayUtc(now: Date): string {
  return now.toISOString().split('T')[0];
}

/**
 * Conservative pre-charge: bill the full output allowance rather than the
 * tokens actually produced, so a visitor can never exceed the ceiling mid-turn.
 */
export function estimateCostUsd(
  model: EllisModel,
  promptChars: number,
  maxOutputTokens: number
): { costUsd: number; tokenEstimate: number } {
  const inputTokens = Math.ceil(promptChars / 4);
  const price = PRICING[model];
  const costUsd =
    (inputTokens / 1_000_000) * price.input +
    (maxOutputTokens / 1_000_000) * price.output;

  return {
    costUsd: Number(costUsd.toFixed(6)),
    tokenEstimate: inputTokens + maxOutputTokens,
  };
}

/**
 * Check remaining budget before calling the model.
 *
 * Fails closed: if the ledger is unreachable we cannot know what has been
 * spent, and an unbounded model bill is worse than a visitor seeing an error.
 */
export async function checkRateLimit(ipHash: string): Promise<RateLimitStatus> {
  const budget = getEllisConfig().dailyBudgetUsd;
  const now = new Date();
  const resetAt = endOfUtcDay(now);

  if (!supabase) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[RATE_LIMIT] Supabase not configured; refusing to serve.');
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        reason: 'Usage ledger unavailable',
      };
    }
    return { allowed: true, remaining: budget, resetAt };
  }

  try {
    const { data, error } = await supabase
      .from('ellis_usage')
      .select('estimated_cost_usd, warned_50, warned_80')
      .eq('ip_hash', ipHash)
      .eq('day_utc', dayUtc(now))
      .maybeSingle();

    if (error) throw error;

    const spent = Number(data?.estimated_cost_usd ?? 0);
    const remaining = Math.max(0, budget - spent);

    const warned =
      (spent >= budget * 0.8 && !data?.warned_80) ||
      (spent >= budget * 0.5 && !data?.warned_50);

    return {
      allowed: remaining > 0,
      remaining,
      resetAt,
      warned,
      reason:
        remaining <= 0 ? `Daily budget of $${budget} reached` : undefined,
    };
  } catch (err) {
    console.error('[RATE_LIMIT] Check failed; denying:', err);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      reason: 'Usage ledger unavailable',
    };
  }
}

/**
 * Add one message of spend to the visitor's daily row.
 * Returns the new daily total, or null if it could not be written.
 */
export async function recordUsage(
  ipHash: string,
  costUsd: number,
  tokenEstimate: number,
  warned: boolean
): Promise<number | null> {
  if (!supabase) return null;

  const budget = getEllisConfig().dailyBudgetUsd;

  try {
    const { data, error } = await supabase.rpc('ellis_usage_increment', {
      p_ip_hash: ipHash,
      p_day_utc: dayUtc(new Date()),
      p_cost_usd: costUsd,
      p_token_estimate: tokenEstimate,
      p_warned_50: warned && costUsd >= budget * 0.5,
      p_warned_80: warned && costUsd >= budget * 0.8,
    });

    if (error) throw error;
    return data === null ? null : Number(data);
  } catch (err) {
    console.error('[RATE_LIMIT] Record failed:', err);
    return null;
  }
}
