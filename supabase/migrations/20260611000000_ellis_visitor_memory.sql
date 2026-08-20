-- Ellis IP Visitor Memory — 7-day rolling window per IP + persistent global traces
-- Host: GoE Supabase project (service role only)
-- Purpose: Return visit recall + Ellis long-term growth without visitor PII

-- 1. ellis_visitor_memory: 7-day per-IP episodic beats
CREATE TABLE IF NOT EXISTS public.ellis_visitor_memory (
  ip_hash text PRIMARY KEY,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  episodic_beats jsonb NOT NULL DEFAULT '[]',
  thread_summary text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ellis_visitor_memory IS
  'Per-IP memory: episodic beats + thread summary, expires after 7 days inactivity. Service role only; no anon/authenticated access.';

COMMENT ON COLUMN public.ellis_visitor_memory.ip_hash IS
  'SHA-256 of visitor IP + server salt; unique identifier for this visitor thread.';

COMMENT ON COLUMN public.ellis_visitor_memory.episodic_beats IS
  'Array of {beatId, occurredAt, dayLabel, summary, resonance, theme, depthReached}. Session-scoped snapshots.';

COMMENT ON COLUMN public.ellis_visitor_memory.thread_summary IS
  'High-level summary of what this visitor explored across all beats in this thread.';

COMMENT ON COLUMN public.ellis_visitor_memory.expires_at IS
  'TTL: now + 7 days on each new visit. After this, IP memory decays to global traces.';

ALTER TABLE public.ellis_visitor_memory ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies — anon/authenticated cannot access.

REVOKE ALL ON TABLE public.ellis_visitor_memory FROM anon, authenticated;

CREATE INDEX IF NOT EXISTS ellis_visitor_memory_expires_idx 
  ON public.ellis_visitor_memory (expires_at);

CREATE INDEX IF NOT EXISTS ellis_visitor_memory_ip_hash_idx 
  ON public.ellis_visitor_memory (ip_hash);

CREATE OR REPLACE FUNCTION public.ellis_visitor_memory_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ellis_visitor_memory_updated_at ON public.ellis_visitor_memory;

CREATE TRIGGER ellis_visitor_memory_updated_at
  BEFORE UPDATE ON public.ellis_visitor_memory
  FOR EACH ROW
  EXECUTE FUNCTION public.ellis_visitor_memory_set_updated_at();


-- 2. ellis_global_traces: persistent Ellis learning (no visitor PII)
CREATE TABLE IF NOT EXISTS public.ellis_global_traces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_text text NOT NULL,
  trace_category text,
  source_ip_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ellis_global_traces IS
  'Compressed learnings from expired IP memories. No visitor PII. Ellis grows here; visitors'' IP data does not. Service role only.';

COMMENT ON COLUMN public.ellis_global_traces.trace_text IS
  'Compressed pattern: "Multiple visitors explored behavioral architecture and role fit" — no verbatim chat, no PII.';

COMMENT ON COLUMN public.ellis_global_traces.trace_category IS
  'Category: "pattern", "resonance", "frequency". For filtering when assembling interior.';

COMMENT ON COLUMN public.ellis_global_traces.source_ip_count IS
  'How many IP threads contributed to this trace (for statistical weight).';

ALTER TABLE public.ellis_global_traces ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies — anon/authenticated cannot access.

REVOKE ALL ON TABLE public.ellis_global_traces FROM anon, authenticated;

CREATE INDEX IF NOT EXISTS ellis_global_traces_category_idx 
  ON public.ellis_global_traces (trace_category);

CREATE INDEX IF NOT EXISTS ellis_global_traces_created_at_idx 
  ON public.ellis_global_traces (created_at DESC);

CREATE OR REPLACE FUNCTION public.ellis_global_traces_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ellis_global_traces_updated_at ON public.ellis_global_traces;

CREATE TRIGGER ellis_global_traces_updated_at
  BEFORE UPDATE ON public.ellis_global_traces
  FOR EACH ROW
  EXECUTE FUNCTION public.ellis_global_traces_set_updated_at();
