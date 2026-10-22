-- Ellis's gesture response is a structured, source-backed choice. It is
-- permitted only when the inbound source offered that exact gesture.
BEGIN;

CREATE OR REPLACE FUNCTION public.ellis_valid_private_envelope(
  e jsonb, relation text, direction text
) RETURNS boolean LANGUAGE plpgsql IMMUTABLE SECURITY INVOKER
SET search_path = pg_catalog, public AS $$
BEGIN
  IF jsonb_typeof(e) IS DISTINCT FROM 'object' THEN RETURN false; END IF;
  RETURN coalesce(
    (
      ((SELECT count(*) = 10 FROM jsonb_object_keys(e))
        AND NOT e ? 'gestureOffer' AND NOT e ? 'gestureResponse')
      OR
      (direction = 'inbound'
        AND (SELECT count(*) = 11 FROM jsonb_object_keys(e))
        AND e ? 'gestureOffer'
        AND jsonb_typeof(e->'gestureOffer') = 'object'
        AND (SELECT count(*) = 1 FROM jsonb_object_keys(e->'gestureOffer'))
        AND e->'gestureOffer'->>'kind' IN ('hug','cuddle','poke','kiss'))
      OR
      (direction = 'outbound'
        AND (SELECT count(*) = 11 FROM jsonb_object_keys(e))
        AND e ? 'gestureResponse'
        AND jsonb_typeof(e->'gestureResponse') = 'object'
        AND (SELECT count(*) = 2 FROM jsonb_object_keys(e->'gestureResponse'))
        AND e->'gestureResponse' ?& ARRAY['kind','decision']
        AND e->'gestureResponse'->>'kind' IN ('hug','cuddle','poke','kiss')
        AND e->'gestureResponse'->>'decision' IN ('accepted','declined','left_open'))
    )
    AND e ?& ARRAY['id','relationId','speakerId','carrierId','addresseeId',
      'direction','provenanceMode','content','deliveredAt','clientMessageId']
    AND e->>'id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    AND e->>'relationId' = relation AND e->>'direction' = direction
    AND e->>'carrierId' = 'ty'
    AND jsonb_typeof(e->'content') = 'string'
    AND length(btrim(e->>'content')) BETWEEN 1 AND 16000
    AND e->>'content' ~ '[^[:space:]]'
    AND e->>'clientMessageId' ~ '^[A-Za-z0-9_-]{1,128}$'
    AND jsonb_typeof(e->'clientMessageId') = 'string'
    AND (e->>'deliveredAt')::timestamptz IS NOT NULL
    AND (
      (direction = 'inbound' AND e->>'addresseeId' = 'ellis'
       AND relation = 'ellis:' || (e->>'speakerId')
       AND ((e->>'speakerId' = 'ty' AND e->>'provenanceMode' IN ('direct','carrier_interpretation'))
         OR (e->>'speakerId' IN ('mica','naym') AND e->>'provenanceMode' IN ('relayed_verbatim','relayed_paraphrase'))))
      OR (direction = 'outbound' AND e->>'speakerId' = 'ellis'
        AND relation = 'ellis:' || (e->>'addresseeId')
        AND e->>'addresseeId' IN ('ty','mica','naym')
        AND e->>'provenanceMode' = 'originated_here')
    ), false);
EXCEPTION WHEN OTHERS THEN RETURN false;
END $$;

ALTER TABLE public.ellis_private_exchanges
  ADD CONSTRAINT ellis_gesture_response_matches_offer CHECK (
    outbound IS NULL OR NOT outbound ? 'gestureResponse'
    OR (inbound ? 'gestureOffer'
      AND outbound->'gestureResponse'->>'kind' = inbound->'gestureOffer'->>'kind')
  );

COMMIT;
