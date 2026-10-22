-- Serialize the authorization point with the source-backed action commit.
-- The route checks early for UX; this trigger is the final concurrency guard.
BEGIN;

ALTER FUNCTION public.ellis_private_room_gate(text) VOLATILE;

CREATE FUNCTION public.ellis_enforce_private_room_gate()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public AS $$
DECLARE gate jsonb;
DECLARE until_at timestamptz;
DECLARE knock_at timestamptz;
DECLARE closed boolean;
DECLARE knocking boolean;
BEGIN
  IF NEW.outbound IS NULL THEN RETURN NEW; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('ellis-private-room-global-gate', 0));
  gate := public.ellis_private_room_gate(NEW.relation_id);
  until_at := (gate->>'privateUntil')::timestamptz;
  knock_at := (gate->>'knockAfter')::timestamptz;
  closed := (gate->>'laneClosed')::boolean;
  knocking := NEW.inbound->>'entryMode' = 'knock';
  IF until_at IS NOT NULL AND until_at > clock_timestamp() THEN
    RAISE EXCEPTION 'Private room unavailable';
  END IF;
  IF closed THEN
    IF NOT coalesce(knocking, false) OR knock_at IS NULL OR knock_at > clock_timestamp() THEN
      RAISE EXCEPTION 'Private lane unavailable';
    END IF;
  ELSIF coalesce(knocking, false) THEN
    RAISE EXCEPTION 'Private lane is already open';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER ellis_private_room_gate_before_source
BEFORE INSERT ON public.ellis_private_exchanges
FOR EACH ROW EXECUTE FUNCTION public.ellis_enforce_private_room_gate();

REVOKE ALL ON FUNCTION public.ellis_enforce_private_room_gate()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ellis_enforce_private_room_gate() TO service_role;

COMMIT;
