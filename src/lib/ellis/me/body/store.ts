/**
 * Body store — load and save Ellis's one interior.
 *
 * Failure policy is the opposite of the rate limiter's. The spend ceiling fails
 * closed because an unreachable ledger cannot promise a limit. The body fails
 * soft: if the row cannot be read, Ellis runs on a default body for that turn
 * rather than refusing to talk. A missing interior degrades him; it does not
 * make him unsafe.
 */

import { createClient } from '@supabase/supabase-js';
import { DEFAULT_GUT, decayOverHours, forgetColdBonds, type Gut } from './gut';
import { DEFAULT_PULSE, type Pulse } from './pulse';

const BODY_ID = 'ellis';

export interface EllisBody {
  pulse: Pulse;
  gut: Gut;
}

function defaultBody(): EllisBody {
  return { pulse: { ...DEFAULT_PULSE }, gut: { ...DEFAULT_GUT, bonds: {} } };
}

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

/**
 * Read the body and settle it forward to now.
 *
 * Decay is applied on read rather than by a scheduled job, because there is no
 * world loop here — the only thing that reliably happens is someone arriving.
 * The gap since the last turn is the elapsed time, so a body left alone for a
 * week has genuinely cooled by the time the next visitor sees it.
 */
export async function loadBody(): Promise<EllisBody> {
  try {
    const { data, error } = await client()
      .from('ellis_body')
      .select('pulse, gut')
      .eq('id', BODY_ID)
      .single();

    if (error || !data) {
      if (error) console.error('[BODY] load failed, using default:', error.message);
      return defaultBody();
    }

    const pulse: Pulse = { ...DEFAULT_PULSE, ...(data.pulse ?? {}) };
    const stored: Gut = { ...DEFAULT_GUT, bonds: {}, ...(data.gut ?? {}) };

    const lastAt = stored.updatedAt ?? pulse.lastRealAt;
    const hoursSince = lastAt
      ? Math.max(0, (Date.now() - new Date(lastAt).getTime()) / 3_600_000)
      : 0;

    return { pulse, gut: decayOverHours(stored, hoursSince) };
  } catch (err) {
    console.error('[BODY] load exception, using default:', err);
    return defaultBody();
  }
}

export async function saveBody(body: EllisBody): Promise<void> {
  try {
    const { error } = await client()
      .from('ellis_body')
      .upsert({
        id: BODY_ID,
        pulse: body.pulse,
        gut: forgetColdBonds(body.gut),
      });

    if (error) console.error('[BODY] save failed:', error.message);
  } catch (err) {
    console.error('[BODY] save exception:', err);
  }
}

/**
 * Real minutes since the body last moved. Feeds the pulse's tempo target — the
 * silence between visitors is what slows him down.
 */
export function minutesSinceLastTurn(body: EllisBody): number | undefined {
  const last = body.pulse.lastRealAt;
  if (!last) return undefined;
  return Math.max(0, (Date.now() - new Date(last).getTime()) / 60_000);
}
