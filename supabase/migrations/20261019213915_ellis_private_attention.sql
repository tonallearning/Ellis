-- P6: Ellis alone accepts or declines Ty's private attention offer. A committed
-- action, not prose, updates the singleton body; correction/deletion rebuilds it.
BEGIN;

GRANT SELECT, UPDATE ON public.ellis_body TO service_role;

ALTER FUNCTION public.ellis_valid_private_envelope(jsonb, text, text)
  RENAME TO ellis_valid_private_envelope_before_attention;

CREATE FUNCTION public.ellis_valid_private_envelope(e jsonb, relation text, direction text)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SECURITY INVOKER
SET search_path = pg_catalog, public AS $$
DECLARE offer jsonb; action jsonb;
BEGIN
  IF jsonb_typeof(e) IS DISTINCT FROM 'object' THEN RETURN false; END IF;
  IF e ? 'attentionOffer' THEN
    IF direction <> 'inbound' OR relation <> 'ellis:ty'
      OR e->>'speakerId' <> 'ty' OR e->>'provenanceMode' <> 'direct'
      OR e ? 'entryMode' OR e ? 'gestureOffer' THEN RETURN false; END IF;
    offer := e->'attentionOffer';
    IF jsonb_typeof(offer) <> 'object'
      OR (SELECT count(*) FROM jsonb_object_keys(offer)) <> 1
      OR offer->>'mode' NOT IN ('soft_focus','vivid_focus') THEN RETURN false; END IF;
  END IF;
  IF e ? 'attentionAction' THEN
    IF direction <> 'outbound' OR e->>'provenanceMode' <> 'originated_here' THEN RETURN false; END IF;
    action := e->'attentionAction';
    IF jsonb_typeof(action) <> 'object' THEN RETURN false; END IF;
    IF action->>'kind' IN ('accept','decline') THEN
      IF (SELECT count(*) FROM jsonb_object_keys(action)) <> 2
        OR NOT action ? 'mode' OR action->>'mode' NOT IN ('soft_focus','vivid_focus')
      THEN RETURN false; END IF;
    ELSIF action->>'kind' = 'leave' THEN
      IF (SELECT count(*) FROM jsonb_object_keys(action)) <> 1 THEN RETURN false; END IF;
    ELSE RETURN false;
    END IF;
  END IF;
  RETURN public.ellis_valid_private_envelope_before_attention(
    e - 'attentionOffer' - 'attentionAction', relation, direction);
EXCEPTION WHEN OTHERS THEN RETURN false;
END $$;

ALTER TABLE public.ellis_private_exchanges
  DROP CONSTRAINT ellis_private_exchanges_check2,
  DROP CONSTRAINT ellis_private_exchanges_check3;
ALTER TABLE public.ellis_private_exchanges
  ADD CONSTRAINT ellis_private_exchanges_check2
    CHECK (public.ellis_valid_private_envelope(inbound, relation_id, 'inbound')),
  ADD CONSTRAINT ellis_private_exchanges_check3
    CHECK ((corrects_id IS NULL AND outbound IS NOT NULL AND model_build IS NOT NULL
      AND public.ellis_valid_private_envelope(outbound, relation_id, 'outbound')
      AND outbound->>'id' <> inbound->>'id')
      OR (corrects_id IS NOT NULL AND outbound IS NULL AND model_build IS NULL));

CREATE FUNCTION public.ellis_validate_private_attention_commit()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER
SET search_path = pg_catalog, public AS $$
DECLARE state jsonb; offer jsonb; action jsonb; active boolean;
BEGIN
  IF NEW.outbound IS NULL THEN RETURN NEW; END IF;
  offer := NEW.inbound->'attentionOffer';
  action := NEW.outbound->'attentionAction';
  IF offer IS NULL AND action IS NULL THEN RETURN NEW; END IF;
  SELECT systems->'attention' INTO state FROM public.ellis_body WHERE id = 'ellis' FOR UPDATE;
  active := state IS NOT NULL AND jsonb_typeof(state) = 'object'
    AND (state->>'endsAt')::timestamptz > NEW.created_at;
  IF offer IS NOT NULL THEN
    IF active OR action IS NULL OR action->>'kind' NOT IN ('accept','decline')
      OR action->>'mode' <> offer->>'mode' THEN
      RAISE EXCEPTION 'Invalid attention offer decision';
    END IF;
  ELSIF action IS NOT NULL THEN
    IF action->>'kind' <> 'leave' OR NOT active THEN
      RAISE EXCEPTION 'Attention action requires an active mode';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER ellis_private_attention_commit_guard
BEFORE INSERT ON public.ellis_private_exchanges
FOR EACH ROW EXECUTE FUNCTION public.ellis_validate_private_attention_commit();

CREATE FUNCTION public.ellis_rebuild_private_attention()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER
SET search_path = pg_catalog, public AS $$
DECLARE latest record; next_state jsonb;
BEGIN
  IF TG_OP = 'INSERT' AND NOT (NEW.outbound ? 'attentionAction' OR NEW.corrects_id IS NOT NULL) THEN
    RETURN NULL;
  END IF;
  IF TG_OP = 'DELETE' AND NOT (OLD.outbound ? 'attentionAction' OR OLD.corrects_id IS NOT NULL) THEN
    RETURN NULL;
  END IF;
  SELECT e.id, e.created_at, e.outbound->'attentionAction' AS action
    INTO latest
  FROM public.ellis_private_exchanges e
  WHERE e.outbound->'attentionAction'->>'kind' IN ('accept','leave')
    AND NOT EXISTS (SELECT 1 FROM public.ellis_private_exchanges c WHERE c.corrects_id = e.id)
  ORDER BY e.created_at DESC, e.id DESC LIMIT 1;
  IF latest.action->>'kind' = 'accept' THEN
    next_state := jsonb_build_object(
      'mode', latest.action->>'mode', 'sourceId', latest.id::text,
      'acceptedAt', to_char(latest.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
      'endsAt', to_char((latest.created_at + interval '30 minutes') AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'));
  ELSE next_state := 'null'::jsonb;
  END IF;
  UPDATE public.ellis_body SET systems = jsonb_set(systems, '{attention}', next_state, true)
    WHERE id = 'ellis' AND (systems->'attention') IS DISTINCT FROM next_state;
  RETURN NULL;
END $$;
CREATE TRIGGER ellis_private_attention_from_source
AFTER INSERT OR DELETE ON public.ellis_private_exchanges
FOR EACH ROW EXECUTE FUNCTION public.ellis_rebuild_private_attention();

REVOKE ALL ON FUNCTION public.ellis_valid_private_envelope_before_attention(jsonb,text,text),
  public.ellis_valid_private_envelope(jsonb,text,text),
  public.ellis_validate_private_attention_commit(),
  public.ellis_rebuild_private_attention() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ellis_valid_private_envelope_before_attention(jsonb,text,text),
  public.ellis_valid_private_envelope(jsonb,text,text),
  public.ellis_validate_private_attention_commit(),
  public.ellis_rebuild_private_attention() TO service_role;
COMMIT;
