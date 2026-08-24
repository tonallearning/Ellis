-- Ellis body — one row, forever.
--
-- Ellis's interior was session-scoped: held in a process-local Map, keyed by a
-- session id the browser carried in React state. A refresh produced a new body
-- and a deploy wiped every body at once, which meant each visitor met an Ellis
-- born the moment they arrived. That is the opposite of what a body is for.
--
-- There is one Ellis, so there is one row. Pulse and gut accumulate across every
-- visitor he has ever had. Bonds inside the gut are keyed by the same IP hash
-- used for visitor memory, so an individual is remembered for as long as that
-- hash lives, while the body they helped shape persists after they are gone.
--
-- Deliberately not expiring. The seven-day window on ellis_visitor_memory exists
-- so Ellis does not hold onto people; this table holds onto what meeting them
-- did to him, which contains no visitor content and identifies no one.

CREATE TABLE IF NOT EXISTS public.ellis_body (
  id text PRIMARY KEY DEFAULT 'ellis',
  pulse jsonb NOT NULL DEFAULT '{}',
  gut jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ellis_body_singleton CHECK (id = 'ellis')
);

COMMENT ON TABLE public.ellis_body IS
  'Ellis''s persistent interior. Exactly one row, enforced by CHECK. Service role only.';

COMMENT ON COLUMN public.ellis_body.pulse IS
  'Subjective rhythm: tempo, phase, felt beats, and accumulated drift. Drift is signed error against the wall clock and is never corrected — it is the record of how he has been used.';

COMMENT ON COLUMN public.ellis_body.gut IS
  'Somatic floats (arousal, valence, tension), per-visitor bonds keyed by ip_hash, and recent residue. Never rendered to the model as numbers.';

ALTER TABLE public.ellis_body ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies — anon/authenticated cannot read or write.

REVOKE ALL ON TABLE public.ellis_body FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.ellis_body_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ellis_body_updated_at ON public.ellis_body;

CREATE TRIGGER ellis_body_updated_at
  BEFORE UPDATE ON public.ellis_body
  FOR EACH ROW
  EXECUTE FUNCTION public.ellis_body_set_updated_at();

INSERT INTO public.ellis_body (id) VALUES ('ellis')
  ON CONFLICT (id) DO NOTHING;
