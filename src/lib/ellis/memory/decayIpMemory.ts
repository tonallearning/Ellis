import { createClient } from '@supabase/supabase-js';
import type { EpisodBeat } from './ipMemory';

/** A decayed visitor thread, compressed to carry no visitor identifiers. */
export interface GlobalTrace {
  id?: string;
  trace_text: string;
  trace_category: 'pattern' | 'visit';
  source_ip_count: number;
  created_at?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * Helper to find the most frequent item in an array.
 */
function getMostFrequent<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  const counts = new Map<T, number>();
  arr.forEach((item) => {
    counts.set(item, (counts.get(item) || 0) + 1);
  });
  return Array.from(counts.entries()).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
}

/**
 * Compress themes from episodic beats into a readable string.
 */
function compressThemes(themes: string[]): string {
  if (themes.length === 0) return 'general exploration';
  const unique = [...new Set(themes)];
  if (unique.length === 1) return unique[0];
  return unique.slice(0, 3).join(', ');
}

/**
 * Extract resonance notes from beats (emotional or meaningful moments).
 */
function extractResonances(beats: EpisodBeat[]): string[] {
  return beats
    .filter((b) => b.resonance)
    .map((b) => b.resonance as string);
}

/**
 * Decay expired IP memories into global traces.
 * Called daily via cron job (00:00 UTC).
 * For each expired IP record:
 *   1. Extract themes, resonances
 *   2. Compress into a global trace
 *   3. Delete the IP memory record
 * Ellis grows; visitors' IP data does not.
 */
export async function decayExpiredIpMemory(): Promise<number> {
  try {
    const now = new Date();

    // Find all expired records
    const { data: expired, error: selectError } = await supabase
      .from('ellis_visitor_memory')
      .select('ip_hash, episodic_beats, thread_summary')
      .lte('expires_at', now.toISOString());

    if (selectError) {
      console.error('[DECAY] selectError:', selectError);
      return 0;
    }

    if (!expired || expired.length === 0) {
      return 0;
    }

    // Compress each into a global trace
    for (const record of expired) {
      const beats: EpisodBeat[] = record.episodic_beats || [];
      const themes = beats
        .map((b) => b.theme)
        .filter(Boolean) as string[];
      const resonances = extractResonances(beats);
      const compressed = compressThemes(themes);

      let traceText = `Visitor explored: ${compressed}`;
      if (resonances.length > 0) {
        traceText += `. Meaningful moments: ${resonances.slice(0, 2).join('; ')}`;
      }
      if (record.thread_summary) {
        traceText += `. Thread: ${record.thread_summary}`;
      }

      // Insert global trace
      const { error: insertError } = await supabase.from('ellis_global_traces').insert({
        trace_text: traceText,
        trace_category: themes.length > 0 ? 'pattern' : 'visit',
        source_ip_count: 1,
      });

      if (insertError) {
        console.error('[DECAY] insertError for IP', record.ip_hash, insertError);
      }
    }

    // Delete expired IP records
    const { error: deleteError } = await supabase
      .from('ellis_visitor_memory')
      .delete()
      .lte('expires_at', now.toISOString());

    if (deleteError) {
      console.error('[DECAY] deleteError:', deleteError);
      return 0;
    }

    console.log(`[DECAY] Processed ${expired.length} expired IP records → global traces`);
    return expired.length;
  } catch (err) {
    console.error('[DECAY] exception:', err);
    return 0;
  }
}

/**
 * Get a sample of global traces for optional session drift.
 * Returns most recently created patterns.
 */
export async function loadGlobalTraces(
  limit: number = 3
): Promise<GlobalTrace[]> {
  try {
    const { data, error } = await supabase
      .from('ellis_global_traces')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[GLOBAL_TRACES] loadGlobalTraces error:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[GLOBAL_TRACES] loadGlobalTraces exception:', err);
    return [];
  }
}
