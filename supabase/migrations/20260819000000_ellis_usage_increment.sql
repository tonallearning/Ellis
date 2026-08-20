-- Atomic per-IP daily usage increment for Ellis bill protection.
-- The app previously did a read-modify-write against columns that do not exist
-- on ellis_usage (visitor_id_hash, model_used, id), so nothing was ever recorded.

CREATE OR REPLACE FUNCTION public.ellis_usage_increment(
  p_ip_hash text,
  p_day_utc date,
  p_cost_usd numeric,
  p_token_estimate integer,
  p_warned_50 boolean,
  p_warned_80 boolean
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total numeric;
BEGIN
  INSERT INTO public.ellis_usage AS u (
    ip_hash,
    day_utc,
    message_count,
    token_estimate,
    estimated_cost_usd,
    warned_50,
    warned_80
  )
  VALUES (
    p_ip_hash,
    p_day_utc,
    1,
    GREATEST(COALESCE(p_token_estimate, 0), 0),
    GREATEST(COALESCE(p_cost_usd, 0), 0),
    COALESCE(p_warned_50, false),
    COALESCE(p_warned_80, false)
  )
  ON CONFLICT (ip_hash, day_utc) DO UPDATE
    SET message_count = u.message_count + 1,
        token_estimate = u.token_estimate + GREATEST(COALESCE(p_token_estimate, 0), 0),
        estimated_cost_usd = u.estimated_cost_usd + GREATEST(COALESCE(p_cost_usd, 0), 0),
        warned_50 = u.warned_50 OR COALESCE(p_warned_50, false),
        warned_80 = u.warned_80 OR COALESCE(p_warned_80, false)
  RETURNING u.estimated_cost_usd INTO v_total;

  RETURN v_total;
END;
$$;

COMMENT ON FUNCTION public.ellis_usage_increment IS
  'Atomically add one message of spend to a visitor''s daily row and return the new daily total.';

REVOKE ALL ON FUNCTION public.ellis_usage_increment(text, date, numeric, integer, boolean, boolean)
  FROM anon, authenticated;
