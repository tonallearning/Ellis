import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { decayExpiredIpMemory } from '@/lib/ellis/memory/decayIpMemory';

/**
 * Cron job: Decay expired IP visitor memories into Ellis global traces.
 * Schedule: Daily at 00:00 UTC
 * Auth: Vercel cron token (X-Vercel-Cron header)
 *
 * Endpoint: GET /api/cron/decay-ip-memory
 */
export async function GET(req: Request) {
  // An unfilled `<placeholder>` is a guessable token, so treat it as unset.
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret || /^<.*>$/.test(cronSecret)) {
    console.error('[CRON] CRON_SECRET not set');
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${cronSecret}`;
  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(authHeader);
  const authorized =
    providedBuf.length === expectedBuf.length &&
    timingSafeEqual(providedBuf, expectedBuf);

  if (!authorized) {
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
