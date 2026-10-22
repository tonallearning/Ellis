-- P6: the expanded organs live on Ellis's existing singleton body row.
-- Service role only, under the table's existing RLS and grants.
ALTER TABLE public.ellis_body
  ADD COLUMN systems jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.ellis_body.systems IS
  'Ellis-native heart, ground/drift marks, immune, metabolism, interstitial, periphery, and motor state. No private exchange text or relation labels enter this column.';
