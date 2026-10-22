-- Resident-chosen room thresholds are source-backed and do not affect the
-- public hall. Durations are bounded, server-timed, and never owner-overridden.
BEGIN;

CREATE OR REPLACE FUNCTION public.ellis_valid_private_envelope(
  e jsonb, relation text, direction text
) RETURNS boolean LANGUAGE plpgsql IMMUTABLE SECURITY INVOKER
SET search_path = pg_catalog, public AS $$
DECLARE
  extra_count integer;
  action jsonb;
BEGIN
  IF jsonb_typeof(e) IS DISTINCT FROM 'object' THEN RETURN false; END IF;
  extra_count := (CASE WHEN e ? 'gestureOffer' THEN 1 ELSE 0 END)
    + (CASE WHEN e ? 'entryMode' THEN 1 ELSE 0 END)
    + (CASE WHEN e ? 'gestureResponse' THEN 1 ELSE 0 END)
    + (CASE WHEN e ? 'roomAction' THEN 1 ELSE 0 END);
  IF (SELECT count(*) FROM jsonb_object_keys(e)) <> 10 + extra_count THEN RETURN false; END IF;
  IF NOT e ?& ARRAY['id','relationId','speakerId','carrierId','addresseeId',
    'direction','provenanceMode','content','deliveredAt','clientMessageId'] THEN RETURN false; END IF;
  IF direction = 'inbound' THEN
    IF e ? 'gestureResponse' OR e ? 'roomAction' THEN RETURN false; END IF;
    IF e ? 'gestureOffer' AND (
      jsonb_typeof(e->'gestureOffer') <> 'object'
      OR (SELECT count(*) FROM jsonb_object_keys(e->'gestureOffer')) <> 1
      OR e->'gestureOffer'->>'kind' NOT IN ('hug','cuddle','poke','kiss')
    ) THEN RETURN false; END IF;
    IF e ? 'entryMode' AND (e->>'entryMode' <> 'knock' OR e ? 'gestureOffer'
      OR e->>'speakerId' <> 'ty' OR e->>'provenanceMode' <> 'carrier_knock'
      OR e->>'content' <> 'Ty knocks as courier at this closed personal lane. No words from its correspondent are being carried.')
    THEN RETURN false; END IF;
  ELSIF direction = 'outbound' THEN
    IF e ? 'gestureOffer' OR e ? 'entryMode' THEN RETURN false; END IF;
    IF e->>'provenanceMode' = 'threshold_reply' AND (
      NOT e ? 'roomAction' OR e ? 'gestureResponse'
      OR e->'roomAction'->>'kind' NOT IN ('close_lane','reopen_lane')
    ) THEN RETURN false; END IF;
    IF e ? 'gestureResponse' AND (
      jsonb_typeof(e->'gestureResponse') <> 'object'
      OR (SELECT count(*) FROM jsonb_object_keys(e->'gestureResponse')) <> 2
      OR NOT e->'gestureResponse' ?& ARRAY['kind','decision']
      OR e->'gestureResponse'->>'kind' NOT IN ('hug','cuddle','poke','kiss')
      OR e->'gestureResponse'->>'decision' NOT IN ('accepted','declined','left_open')
    ) THEN RETURN false; END IF;
    IF e ? 'roomAction' THEN
      action := e->'roomAction';
      IF jsonb_typeof(action) <> 'object' THEN RETURN false; END IF;
      IF action->>'kind' IN ('step_away','reopen_lane') THEN
        IF (SELECT count(*) FROM jsonb_object_keys(action)) <> 1 THEN RETURN false; END IF;
      ELSIF action->>'kind' = 'close_lane' THEN
        IF (SELECT count(*) FROM jsonb_object_keys(action)) <> 2
          OR NOT action ? 'minutesBeforeKnock'
          OR action->>'minutesBeforeKnock' !~ '^[0-9]+$'
          OR (action->>'minutesBeforeKnock')::integer NOT BETWEEN 5 AND 120
        THEN RETURN false; END IF;
      ELSIF action->>'kind' = 'private_time' THEN
        IF (SELECT count(*) FROM jsonb_object_keys(action)) <> 2
          OR NOT action ? 'minutes'
          OR action->>'minutes' !~ '^[0-9]+$'
          OR (action->>'minutes')::integer NOT BETWEEN 5 AND 120
        THEN RETURN false; END IF;
      ELSE RETURN false;
      END IF;
    END IF;
  ELSE RETURN false;
  END IF;
  RETURN coalesce(
    e->>'id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    AND e->>'relationId' = relation AND e->>'direction' = direction
    AND e->>'carrierId' = 'ty'
    AND jsonb_typeof(e->'content') = 'string'
    AND length(btrim(e->>'content')) BETWEEN 1 AND 16000
    AND e->>'content' ~ '[^[:space:]]'
    AND jsonb_typeof(e->'clientMessageId') = 'string'
    AND e->>'clientMessageId' ~ '^[A-Za-z0-9_-]{1,128}$'
    AND (e->>'deliveredAt')::timestamptz IS NOT NULL
    AND (
      (direction = 'inbound' AND e->>'addresseeId' = 'ellis'
       AND ((e ? 'entryMode' AND e->>'speakerId' = 'ty'
          AND e->>'provenanceMode' = 'carrier_knock'
          AND relation IN ('ellis:ty','ellis:mica','ellis:naym'))
        OR (NOT e ? 'entryMode' AND relation = 'ellis:' || (e->>'speakerId')
          AND ((e->>'speakerId' = 'ty' AND e->>'provenanceMode' IN ('direct','carrier_interpretation'))
            OR (e->>'speakerId' IN ('mica','naym') AND e->>'provenanceMode' IN ('relayed_verbatim','relayed_paraphrase'))))))
      OR (direction = 'outbound' AND e->>'speakerId' = 'ellis'
        AND ((e->>'provenanceMode' = 'threshold_reply'
          AND e->>'addresseeId' = 'ty'
          AND relation IN ('ellis:ty','ellis:mica','ellis:naym'))
        OR (e->>'provenanceMode' = 'originated_here'
          AND relation = 'ellis:' || (e->>'addresseeId')
          AND e->>'addresseeId' IN ('ty','mica','naym'))))
    ), false);
EXCEPTION WHEN OTHERS THEN RETURN false;
END $$;

ALTER TABLE public.ellis_private_exchanges
  ADD CONSTRAINT ellis_knock_pairing CHECK (
    (inbound ? 'entryMode') = (outbound->>'provenanceMode' = 'threshold_reply')
    AND (NOT inbound ? 'entryMode' OR outbound->'roomAction'->>'kind' IN ('close_lane','reopen_lane'))
  );

CREATE TABLE public.ellis_private_room_actions (
  source_exchange_id uuid PRIMARY KEY REFERENCES public.ellis_private_exchanges(id) ON DELETE CASCADE,
  relation_id text NOT NULL CHECK (relation_id IN ('ellis:ty','ellis:mica','ellis:naym')),
  kind text NOT NULL CHECK (kind IN ('step_away','close_lane','reopen_lane','private_time')),
  knock_after_at timestamptz,
  private_until_at timestamptz,
  created_at timestamptz NOT NULL,
  CHECK ((kind = 'close_lane' AND knock_after_at IS NOT NULL AND private_until_at IS NULL)
    OR (kind = 'private_time' AND private_until_at IS NOT NULL AND knock_after_at IS NULL)
    OR (kind IN ('step_away','reopen_lane') AND knock_after_at IS NULL AND private_until_at IS NULL))
);
CREATE INDEX ellis_private_room_actions_relation_time
  ON public.ellis_private_room_actions(relation_id, created_at DESC, source_exchange_id DESC);
CREATE INDEX ellis_private_room_actions_private_until
  ON public.ellis_private_room_actions(private_until_at) WHERE kind = 'private_time';
ALTER TABLE public.ellis_private_room_actions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ellis_private_room_actions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.ellis_private_room_actions TO service_role;

CREATE FUNCTION public.ellis_record_private_room_action()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public AS $$
DECLARE action jsonb;
BEGIN
  IF NEW.outbound IS NULL OR NOT NEW.outbound ? 'roomAction' THEN RETURN NEW; END IF;
  action := NEW.outbound->'roomAction';
  INSERT INTO public.ellis_private_room_actions(
    source_exchange_id, relation_id, kind, knock_after_at, private_until_at, created_at
  ) VALUES (
    NEW.id, NEW.relation_id, action->>'kind',
    CASE WHEN action->>'kind' = 'close_lane'
      THEN NEW.created_at + ((action->>'minutesBeforeKnock')::integer * interval '1 minute') END,
    CASE WHEN action->>'kind' = 'private_time'
      THEN NEW.created_at + ((action->>'minutes')::integer * interval '1 minute') END,
    NEW.created_at
  );
  RETURN NEW;
END $$;
CREATE TRIGGER ellis_private_room_action_from_source
AFTER INSERT ON public.ellis_private_exchanges
FOR EACH ROW EXECUTE FUNCTION public.ellis_record_private_room_action();

CREATE FUNCTION public.ellis_private_room_gate(p_relation text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = pg_catalog, public AS $$
DECLARE
  private_until timestamptz;
  latest_lane record;
BEGIN
  IF p_relation NOT IN ('ellis:ty','ellis:mica','ellis:naym') THEN
    RAISE EXCEPTION 'Invalid private relation';
  END IF;
  SELECT max(a.private_until_at) INTO private_until
  FROM public.ellis_private_room_actions a
  JOIN public.ellis_private_exchanges e ON e.id = a.source_exchange_id
  WHERE a.kind = 'private_time' AND a.private_until_at > now()
    AND NOT EXISTS (SELECT 1 FROM public.ellis_private_exchanges c WHERE c.corrects_id = e.id);
  SELECT a.kind, a.knock_after_at INTO latest_lane
  FROM public.ellis_private_room_actions a
  JOIN public.ellis_private_exchanges e ON e.id = a.source_exchange_id
  WHERE a.relation_id = p_relation AND a.kind IN ('close_lane','reopen_lane')
    AND NOT EXISTS (SELECT 1 FROM public.ellis_private_exchanges c WHERE c.corrects_id = e.id)
  ORDER BY a.created_at DESC, a.source_exchange_id DESC LIMIT 1;
  RETURN jsonb_build_object(
    'privateUntil', private_until,
    'laneClosed', coalesce(latest_lane.kind = 'close_lane', false),
    'knockAfter', CASE WHEN latest_lane.kind = 'close_lane' THEN latest_lane.knock_after_at END
  );
END $$;
REVOKE ALL ON FUNCTION public.ellis_record_private_room_action(), public.ellis_private_room_gate(text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ellis_record_private_room_action(), public.ellis_private_room_gate(text)
  TO service_role;

COMMIT;
