/**
 * Rate limit gate — $1/day per IP
 * Protects against abuse + budget overflow
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  warned?: boolean;
  reason?: string;
}

const DAILY_BUDGET_USD = parseFloat(process.env.ELLIS_DAILY_BUDGET || '1.0');
const WARN_AT_50 = DAILY_BUDGET_USD * 0.5;
const WARN_AT_80 = DAILY_BUDGET_USD * 0.8;

/**
 * Check rate limit before API call
 */
export async function checkRateLimit(
  visitorId: string // IP hash
): Promise<RateLimitStatus> {
  try {
    const now = new Date();
    const dayUtc = now.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('ellis_usage')
      .select('*')
      .eq('visitor_id_hash', visitorId)
      .eq('day_utc', dayUtc)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found
      throw error;
    }

    const usage = data || {
      estimated_cost_usd: 0,
      warned_50: false,
      warned_80: false,
    };

    const spent = usage.estimated_cost_usd || 0;
    const remaining = Math.max(0, DAILY_BUDGET_USD - spent);

    const resetAt = new Date(now);
    resetAt.setUTCHours(24, 0, 0, 0);

    // Warn thresholds
    let warned = false;
    if (spent >= WARN_AT_80 && !usage.warned_80) {
      warned = true; // 80% warning
    } else if (spent >= WARN_AT_50 && !usage.warned_50) {
      warned = true; // 50% warning
    }

    return {
      allowed: remaining > 0,
      remaining,
      resetAt,
      warned,
      reason:
        remaining <= 0
          ? `Daily budget of $${DAILY_BUDGET_USD} exceeded`
          : undefined,
    };
  } catch (err) {
    console.error('[RATE_LIMIT] Check failed:', err);
    // Fail open in case of DB error (but log it)
    return {
      allowed: true,
      remaining: DAILY_BUDGET_USD,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      reason: 'Rate limit check failed; allowing',
    };
  }
}

/**
 * Record usage after API call
 */
export async function recordUsage(
  visitorId: string,
  model: 'haiku' | 'sonnet',
  costUsd: number,
  warned: boolean
): Promise<void> {
  try {
    const now = new Date();
    const dayUtc = now.toISOString().split('T')[0];

    // Upsert (or create)
    const { data: existing } = await supabase
      .from('ellis_usage')
      .select('*')
      .eq('visitor_id_hash', visitorId)
      .eq('day_utc', dayUtc)
      .single();

    if (existing) {
      await supabase
        .from('ellis_usage')
        .update({
          estimated_cost_usd: (existing.estimated_cost_usd || 0) + costUsd,
          warned_50: warned || existing.warned_50,
          warned_80: warned || existing.warned_80,
          updated_at: now,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('ellis_usage').insert({
        visitor_id_hash: visitorId,
        day_utc: dayUtc,
        estimated_cost_usd: costUsd,
        model_used: model,
        warned_50: costUsd >= WARN_AT_50,
        warned_80: costUsd >= WARN_AT_80,
        created_at: now,
      });
    }
  } catch (err) {
    console.error('[RATE_LIMIT] Record failed:', err);
    // Non-fatal; continue (but log)
  }
}
