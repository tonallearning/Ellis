import { NextResponse } from 'next/server';
import { decayExpiredIpMemory } from '@/lib/ellis/memory/decayIpMemory';
import { isAuthorizedCron } from '@/lib/ellis/cronAuth';

/**
 * Cron job: Decay expired IP visitor memories into Ellis global traces.
 * Schedule: Daily at 00:00 UTC
 * Auth: Vercel cron token (X-Vercel-Cron header)
 *
 * Endpoint: GET /api/cron/decay-ip-memory
 */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    console.error('[CRON] Unauthorized cron request');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const count = await decayExpiredIpMemory();
    return NextResponse.json({
      ok: true,
      message: `Decayed ${count} expired IP records to global traces`,
      processed: count,
    });
  } catch (err) {
    console.error('[CRON] decay job error:', err);
    return NextResponse.json(
      { error: 'Decay job failed', details: String(err) },
      { status: 500 }
    );
  }
}
