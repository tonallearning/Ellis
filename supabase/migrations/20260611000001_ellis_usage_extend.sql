-- Extend ellis_usage for IP memory tracking + return visit detection
-- Adds: ip_hash (already exists but formalized), is_return_visit (new)

-- Add is_return_visit column (tracks if visitor had prior memory within 7 days)
ALTER TABLE public.ellis_usage
ADD COLUMN IF NOT EXISTS is_return_visit boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.ellis_usage.is_return_visit IS
  'true if loadIpMemory found an unexpired visitor_memory record for this session; false if first visit or after 7-day decay.';

-- Create index for IP memory lookups
CREATE INDEX IF NOT EXISTS ellis_usage_ip_hash_day_idx 
  ON public.ellis_usage (ip_hash, day_utc);

CREATE INDEX IF NOT EXISTS ellis_usage_return_visit_idx 
  ON public.ellis_usage (is_return_visit, day_utc);
