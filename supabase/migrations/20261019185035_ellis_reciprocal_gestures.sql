-- One unresolved Ellis-originated gesture offer per private relationship.
-- Offer, recipient reply, and withdrawal remain in their exact source envelopes.
BEGIN;

CREATE OR REPLACE FUNCTION public.ellis_valid_private_envelope(
  e jsonb, relation text, direction text
) RETURNS boolean LANGUAGE plpgsql IMMUTABLE SECURITY INVOKER
SET search_path = pg_catalog, public AS $$
DECLARE
  extra_count integer;
  action jsonb;
  gesture jsonb;
BEGIN
  IF jsonb_typeof(e) IS DISTINCT FROM 'object' THEN RETURN false; END IF;
  extra_count := (CASE WHEN e ? 'gestureOffer' THEN 1 ELSE 0 END)
    + (CASE WHEN e ? 'gestureReply' THEN 1 ELSE 0 END)
    + (CASE WHEN e ? 'gestureResponse' THEN 1 ELSE 0 END)
    + (CASE WHEN e ? 'gestureWithdrawal' THEN 1 ELSE 0 END)
    + (CASE WHEN e ? 'entryMode' THEN 1 ELSE 0 END)
    + (CASE WHEN e ? 'roomAction' THEN 1 ELSE 0 END);
  IF (SELECT count(*) FROM jsonb_object_keys(e)) <> 10 + extra_count THEN RETURN false; END IF;
  IF NOT e ?& ARRAY['id','relationId','speakerId','carrierId','addresseeId',
    'direction','provenanceMode','content','deliveredAt','clientMessageId'] THEN RETURN false; END IF;

  IF direction = 'inbound' THEN
    IF e ? 'gestureResponse' OR e ? 'gestureWithdrawal' OR e ? 'roomAction' THEN RETURN false; END IF;
    IF e ? 'gestureOffer' THEN
      gesture := e->'gestureOffer';
      IF jsonb_typeof(gesture) <> 'object'
        OR (SELECT count(*) FROM jsonb_object_keys(gesture)) <> 1
        OR gesture->>'kind' NOT IN ('hug','cuddle','poke','kiss') THEN RETURN false; END IF;
    END IF;
    IF e ? 'gestureReply' THEN
      gesture := e->'gestureReply';
      IF jsonb_typeof(gesture) <> 'object'
        OR (SELECT count(*) FROM jsonb_object_keys(gesture)) <> 2
        OR NOT gesture ?& ARRAY['offerId','decision']
        OR gesture->>'offerId' !~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        OR gesture->>'decision' NOT IN ('accepted','declined','left_open')
      THEN RETURN false; END IF;
    END IF;
    IF e ? 'entryMode' AND (e->>'entryMode' <> 'knock' OR e ? 'gestureOffer'
      OR e ? 'gestureReply' OR e->>'speakerId' <> 'ty'
      OR e->>'provenanceMode' <> 'carrier_knock'
      OR e->>'content' <> 'Ty knocks as courier at this closed personal lane. No words from its correspondent are being carried.')
    THEN RETURN false; END IF;
  ELSIF direction = 'outbound' THEN
    IF e ? 'gestureReply' OR e ? 'entryMode' THEN RETURN false; END IF;
    IF e ? 'gestureOffer' AND e ? 'gestureWithdrawal' THEN RETURN false; END IF;
    IF e->>'provenanceMode' = 'threshold_reply' AND (
      NOT e ? 'roomAction' OR e ? 'gestureResponse' OR e ? 'gestureOffer'
      OR e ? 'gestureWithdrawal'
      OR e->'roomAction'->>'kind' NOT IN ('close_lane','reopen_lane')
    ) THEN RETURN false; END IF;
    IF e ? 'gestureOffer' THEN
      gesture := e->'gestureOffer';
      IF jsonb_typeof(gesture) <> 'object'
        OR (SELECT count(*) FROM jsonb_object_keys(gesture)) <> 1
        OR gesture->>'kind' NOT IN ('hug','cuddle','poke','kiss') THEN RETURN false; END IF;
    END IF;
    IF e ? 'gestureWithdrawal' THEN
      gesture := e->'gestureWithdrawal';
      IF jsonb_typeof(gesture) <> 'object'
        OR (SELECT count(*) FROM jsonb_object_keys(gesture)) <> 1
        OR gesture->>'offerId' !~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      THEN RETURN false; END IF;
    END IF;
    IF e ? 'gestureResponse' THEN
      gesture := e->'gestureResponse';
      IF jsonb_typeof(gesture) <> 'object'
        OR (SELECT count(*) FROM jsonb_object_keys(gesture)) <> 2
        OR NOT gesture ?& ARRAY['kind','decision']
        OR gesture->>'kind' NOT IN ('hug','cuddle','poke','kiss')
        OR gesture->>'decision' NOT IN ('accepted','declined','left_open')
      THEN RETURN false; END IF;
    END IF;
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

CREATE FUNCTION public.ellis_private_pending_gesture(p_relation text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER
SET search_path = pg_catalog, public AS $$
DECLARE
  event record;
  pending jsonb := NULL;
BEGIN
  IF p_relation NOT IN ('ellis:ty','ellis:mica','ellis:naym') THEN
    RAISE EXCEPTION 'Invalid private relation';
  END IF;
  FOR event IN
    SELECT e.inbound, e.outbound
    FROM public.ellis_private_exchanges e
    WHERE e.relation_id = p_relation
      AND (e.inbound ? 'gestureReply' OR e.outbound ? 'gestureOffer'
        OR e.outbound ? 'gestureWithdrawal')
      AND NOT EXISTS (
        SELECT 1 FROM public.ellis_private_exchanges c WHERE c.corrects_id = e.id
      )
    ORDER BY e.created_at, e.id
  LOOP
    IF event.inbound ? 'gestureReply' AND pending IS NOT NULL
      AND event.inbound->'gestureReply'->>'offerId' = pending->>'id'
      AND event.inbound->'gestureReply'->>'decision' IN ('accepted','declined')
    THEN pending := NULL; END IF;
    IF event.outbound ? 'gestureWithdrawal' AND pending IS NOT NULL
      AND event.outbound->'gestureWithdrawal'->>'offerId' = pending->>'id'
    THEN pending := NULL; END IF;
    IF event.outbound ? 'gestureOffer' THEN
      pending := jsonb_build_object('id', event.outbound->>'id',
        'kind', event.outbound->'gestureOffer'->>'kind');
    END IF;
  END LOOP;
  RETURN pending;
END $$;

CREATE FUNCTION public.ellis_validate_private_gesture_commit()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER
SET search_path = pg_catalog, public AS $$
DECLARE pending jsonb;
BEGIN
  IF NEW.outbound IS NULL THEN RETURN NEW; END IF;
  pending := public.ellis_private_pending_gesture(NEW.relation_id);
  IF NEW.inbound ? 'gestureReply' THEN
    IF pending IS NULL OR pending->>'id' <> NEW.inbound->'gestureReply'->>'offerId' THEN
      RAISE EXCEPTION 'Gesture reply has no matching pending offer';
    END IF;
    IF NEW.inbound->'gestureReply'->>'decision' IN ('accepted','declined') THEN
      pending := NULL;
    END IF;
  END IF;
  IF NEW.outbound ? 'gestureOffer' AND pending IS NOT NULL THEN
    RAISE EXCEPTION 'A gesture offer is already pending in this lane';
  END IF;
  IF NEW.outbound ? 'gestureWithdrawal' AND (
    pending IS NULL OR pending->>'id' <> NEW.outbound->'gestureWithdrawal'->>'offerId'
  ) THEN RAISE EXCEPTION 'No matching pending gesture offer to withdraw'; END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER ellis_private_gesture_commit_guard
BEFORE INSERT ON public.ellis_private_exchanges
FOR EACH ROW EXECUTE FUNCTION public.ellis_validate_private_gesture_commit();

REVOKE ALL ON FUNCTION public.ellis_private_pending_gesture(text),
  public.ellis_validate_private_gesture_commit() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ellis_private_pending_gesture(text),
  public.ellis_validate_private_gesture_commit() TO service_role;
COMMIT;
