-- =============================================================
-- Scheduled decay, without pg_cron
--
-- Neon only permits pg_cron in the `postgres` database, and its
-- computes scale to zero, so the three hourly cron jobs the
-- schema used to rely on cannot be recreated here.
--
-- The tick is catch-up aware rather than "one call = one hour":
-- it decays by however many whole hours have actually elapsed
-- since the last one. That keeps the meters correct however often
-- it is invoked, and self-heals after a gap. 003 then drops the
-- need to invoke it on a timer at all.
-- =============================================================

-- Unix seconds of the last decay that was applied.
INSERT INTO site_counters (key, value)
VALUES ('last_decay_at', EXTRACT(EPOCH FROM NOW())::BIGINT)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION tick_ogotchi()
RETURNS TABLE (hours_elapsed INT, hunger BIGINT, mood BIGINT, pooped BOOLEAN)
LANGUAGE plpgsql
AS $$
DECLARE
    last_at   BIGINT;
    now_epoch BIGINT := EXTRACT(EPOCH FROM NOW())::BIGINT;
    elapsed   INT;
    did_poop  BOOLEAN := false;
    i         INT;
BEGIN
    -- Serialize concurrent ticks: a second caller waits here, then sees the
    -- row the first one already advanced and computes 0 elapsed hours.
    SELECT value INTO last_at
      FROM site_counters
     WHERE key = 'last_decay_at'
       FOR UPDATE;

    elapsed := GREATEST((now_epoch - COALESCE(last_at, now_epoch)) / 3600, 0);

    IF elapsed > 0 THEN
        PERFORM increment_counter('hunger_meter', -elapsed);
        PERFORM increment_counter('mood_meter', -elapsed);

        -- One poop roll per elapsed hour, as the hourly cron job used to do.
        -- Capped so a long outage doesn't spin needlessly; has_pooped tops out
        -- at 1 regardless.
        FOR i IN 1..LEAST(elapsed, 24) LOOP
            IF try_random_poop() THEN
                did_poop := true;
                EXIT;
            END IF;
        END LOOP;

        -- Advance by whole hours only, so the remainder carries into the next
        -- tick instead of being rounded away.
        UPDATE site_counters
           SET value = last_at + elapsed::BIGINT * 3600,
               updated_at = NOW()
         WHERE key = 'last_decay_at';
    END IF;

    RETURN QUERY
    SELECT elapsed,
           (SELECT value FROM site_counters WHERE key = 'hunger_meter'),
           (SELECT value FROM site_counters WHERE key = 'mood_meter'),
           did_poop;
END;
$$;
