import { createClient } from "@supabase/supabase-js";
import { isOwnerMemoryKey, ownerExpiresAt } from "../owner";

export interface EpisodBeat {
  beatId: string;
  occurredAt: Date;
  dayLabel?: string; // "Friday", "earlier this week"
  summary: string;
  resonance?: string;
  theme: string;
  depthReached: number;
}

/** Beat shape as stored in jsonb — dates arrive as ISO strings. */
type StoredEpisodBeat = Omit<EpisodBeat, "occurredAt"> & { occurredAt: string };

export interface IpVisitorMemory {
  ipHash: string;
  lastSeenAt: Date;
  episodicBeats: EpisodBeat[];
  threadSummary?: string;
  isExpired: boolean;
  daysAgo?: number;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

/**
 * Load IP visitor memory if it exists and hasn't expired.
 * Called on every stream request to check for return visits.
 */
export async function loadIpMemory(
  ipHash: string,
): Promise<IpVisitorMemory | null> {
  try {
    const { data, error } = await supabase
      .from("ellis_visitor_memory")
      .select("*")
      .eq("ip_hash", ipHash)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned — first visit
        return null;
      }
      console.error("[IP_MEMORY] loadIpMemory error:", error);
      return null;
    }

    if (!data) return null;

    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    const isExpired = expiresAt < now;

    return {
      ipHash,
      lastSeenAt: new Date(data.last_seen_at),
      episodicBeats: ((data.episodic_beats || []) as StoredEpisodBeat[]).map(
        (beat) => ({
          ...beat,
          occurredAt: new Date(beat.occurredAt),
        }),
      ),
      threadSummary: data.thread_summary || undefined,
      isExpired,
      daysAgo: Math.floor(
        (now.getTime() - new Date(data.last_seen_at).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    };
  } catch (err) {
    console.error("[IP_MEMORY] loadIpMemory exception:", err);
    return null;
  }
}

export interface IpVisitInput {
  ipHash: string;
  episodicBeats: EpisodBeat[];
}

/**
 * Record a new visit or update a return visit.
 * Called at the end of each stream session.
 */
export async function recordIpVisit(input: IpVisitInput): Promise<void> {
  try {
    const now = new Date();
    const expiresAt = isOwnerMemoryKey(input.ipHash)
      ? ownerExpiresAt(now)
      : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { error } = await supabase.rpc("ellis_memory_append", {
      p_ip_hash: input.ipHash,
      p_episodic_beats: input.episodicBeats.map((beat) => ({
        ...beat,
        occurredAt: beat.occurredAt.toISOString(),
      })),
      p_expires_at: expiresAt.toISOString(),
    });

    if (error) {
      console.error("[IP_MEMORY] recordIpVisit error:", error);
    }
  } catch (err) {
    console.error("[IP_MEMORY] recordIpVisit exception:", err);
  }
}

/**
 * Generate human-readable day label based on elapsed time.
 */
export function generateDayLabel(occurredAt: Date, now: Date): string {
  const diffMs = now.getTime() - occurredAt.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 3) return `${diffDays} days ago`;
  if (diffDays <= 7) return "Earlier this week";
  if (diffDays <= 30) return "A few weeks ago";
  return occurredAt.toLocaleDateString();
}

/**
 * Mark return visit in ellis_usage for tracking.
 */
export async function markReturnVisit(
  ipHash: string,
  dayUtc: string,
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from("ellis_usage")
      .select("*")
      .eq("ip_hash", ipHash)
      .eq("day_utc", dayUtc)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("ellis_usage")
        .update({ is_return_visit: true })
        .eq("ip_hash", ipHash)
        .eq("day_utc", dayUtc);

      if (error) {
        console.error("[IP_MEMORY] markReturnVisit update error:", error);
      }
    }
  } catch (err) {
    console.error("[IP_MEMORY] markReturnVisit exception:", err);
  }
}
