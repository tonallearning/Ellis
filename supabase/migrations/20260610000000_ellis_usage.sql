-- Ellis / tybuilds.tech — daily usage + budget tracking (bill protection only)
-- Host: GoE Supabase project — tybuilds server uses service role; no GoE table access in app code.
-- Not Ellis ME memory, not visitor profiles.

CREATE TABLE IF NOT EXISTS public.ellis_usage (
  ip_hash text NOT NULL,
  day_utc date NOT NULL DEFAULT (timezone('UTC', now())::date),
  message_count integer NOT NULL DEFAULT 0,
  token_estimate integer NOT NULL DEFAULT 0,
  estimated_cost_usd numeric(12, 6) NOT NULL DEFAULT 0,
  warned_50 boolean NOT NULL DEFAULT false,
  warned_80 boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (ip_hash, day_utc),
  CONSTRAINT ellis_usage_message_count_nonneg CHECK (message_count >= 0),
  CONSTRAINT ellis_usage_token_estimate_nonneg CHECK (token_estimate >= 0),
  CONSTRAINT ellis_usage_cost_nonneg CHECK (estimated_cost_usd >= 0)
);

COMMENT ON TABLE public.ellis_usage IS
  'tybuilds.tech rate limits + daily budget — IP-hashed counters only; Ellis app must not query GoE tables.';

COMMENT ON COLUMN public.ellis_usage.ip_hash IS
  'SHA-256 of visitor IP + server salt; never store raw IP.';

ALTER TABLE public.ellis_usage ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies — anon/authenticated cannot read or write.

REVOKE ALL ON TABLE public.ellis_usage FROM anon, authenticated;

CREATE INDEX IF NOT EXISTS ellis_usage_day_utc_idx ON public.ellis_usage (day_utc);

CREATE OR REPLACE FUNCTION public.ellis_usage_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ellis_usage_updated_at ON public.ellis_usage;

CREATE TRIGGER ellis_usage_updated_at
  BEFORE UPDATE ON public.ellis_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.ellis_usage_set_updated_at();
