-- Preserve Ellis memory across turns instead of replacing the JSON array with
-- the latest beat. The advisory lock makes the read/append/upsert sequence
-- atomic for one memory key, including the first insert.

CREATE OR REPLACE FUNCTION public.ellis_memory_append(
  p_ip_hash text,
  p_episodic_beats jsonb,
  p_expires_at timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing jsonb := '[]'::jsonb;
  v_combined jsonb;
  v_limit integer;
  v_total integer;
  v_themes text;
  v_summary text;
BEGIN
  IF p_ip_hash IS NULL OR btrim(p_ip_hash) = '' THEN
    RAISE EXCEPTION 'memory key is required';
  END IF;

  IF p_expires_at IS NULL THEN
    RAISE EXCEPTION 'memory expiry is required';
  END IF;

  IF p_episodic_beats IS NULL OR jsonb_typeof(p_episodic_beats) <> 'array' THEN
    RAISE EXCEPTION 'episodic beats must be a JSON array';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_ip_hash, 0));

  SELECT episodic_beats
  INTO v_existing
  FROM public.ellis_visitor_memory
  WHERE ip_hash = p_ip_hash
  FOR UPDATE;

  v_combined := COALESCE(v_existing, '[]'::jsonb) || p_episodic_beats;
  v_limit := CASE WHEN p_ip_hash = 'owner' THEN 200 ELSE 40 END;
  v_total := jsonb_array_length(v_combined);

  IF v_total > v_limit THEN
    SELECT COALESCE(jsonb_agg(beat ORDER BY ordinal), '[]'::jsonb)
    INTO v_combined
    FROM jsonb_array_elements(v_combined) WITH ORDINALITY AS beats(beat, ordinal)
    WHERE ordinal > v_total - v_limit;
  END IF;

  SELECT string_agg(theme, ', ' ORDER BY theme)
  INTO v_themes
  FROM (
    SELECT DISTINCT beat->>'theme' AS theme
    FROM jsonb_array_elements(v_combined) AS remembered(beat)
    WHERE COALESCE(beat->>'theme', '') <> ''
  ) AS themes;

  v_summary := format(
    'Remembered exchanges: %s. Themes: %s.',
    jsonb_array_length(v_combined),
    COALESCE(v_themes, 'general')
  );

  INSERT INTO public.ellis_visitor_memory AS memory (
    ip_hash,
    last_seen_at,
    episodic_beats,
    thread_summary,
    expires_at
  )
  VALUES (
    p_ip_hash,
    now(),
    v_combined,
    v_summary,
    p_expires_at
  )
  ON CONFLICT (ip_hash) DO UPDATE
    SET last_seen_at = EXCLUDED.last_seen_at,
        episodic_beats = EXCLUDED.episodic_beats,
        thread_summary = EXCLUDED.thread_summary,
        expires_at = EXCLUDED.expires_at;
END;
$$;

COMMENT ON FUNCTION public.ellis_memory_append(text, jsonb, timestamptz) IS
  'Atomically append bounded episodic beats to one visitor or owner memory row.';

REVOKE ALL ON FUNCTION public.ellis_memory_append(text, jsonb, timestamptz)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ellis_memory_append(text, jsonb, timestamptz)
  TO service_role;

-- The older spend RPC is also server-only. Revoking from named roles alone did
-- not remove PostgreSQL's default PUBLIC function grant.
REVOKE ALL ON FUNCTION public.ellis_usage_increment(text, date, numeric, integer, boolean, boolean)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ellis_usage_increment(text, date, numeric, integer, boolean, boolean)
  TO service_role;
