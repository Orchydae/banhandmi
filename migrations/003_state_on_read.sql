-- =============================================================
-- Decay on read, instead of on a schedule
--
-- 002 replaced the pg_cron jobs with a catch-up tick, on the
-- assumption that something external would call it. Neon
-- Functions are a request/response runtime, not a job runner,
-- and scheduling it from the frontend host would put the app's
-- deploy platform back in the backend's path.
--
-- Since tick_ogotchi() already derives the decay from elapsed
-- time, it does not need to run on a timer at all: applying it
-- when the meters are read produces the same values, and the
-- meters are only ever observed by a read. No scheduler, no
-- secret to protect, and nothing to miss during an outage.
-- =============================================================

CREATE OR REPLACE FUNCTION get_ogotchi_state()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    state JSONB;
BEGIN
    -- No-op unless at least a whole hour has passed since the last one.
    PERFORM tick_ogotchi();

    SELECT jsonb_object_agg(key, value)
      INTO state
      FROM site_counters
     WHERE key IN ('treats_given', 'hunger_meter', 'mood_meter', 'has_pooped');

    RETURN COALESCE(state, '{}'::JSONB);
END;
$$;
