-- =============================================
-- Hourly decay & Random Poop Mechanics
-- =============================================

-- 1. Ensure the has_pooped row exists in site_counters
INSERT INTO site_counters (key, value)
VALUES ('has_pooped', 1)
ON CONFLICT (key) DO NOTHING;

-- 2. Update increment_counter to handle both hunger and has_pooped constraints
CREATE OR REPLACE FUNCTION increment_counter(counter_key VARCHAR, amount INT DEFAULT 1)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    new_value BIGINT;
BEGIN
    UPDATE site_counters
    SET value = CASE
            WHEN counter_key = 'hunger_meter'
                THEN LEAST(GREATEST(value + amount, 0), 100)
            WHEN counter_key = 'has_pooped'
                THEN LEAST(GREATEST(value + amount, 0), 1)
            ELSE value + amount
        END,
        updated_at = NOW()
    WHERE key = counter_key
    RETURNING value INTO new_value;
    RETURN new_value;
END;
$$;

-- 3. Run unscheduling of old 30-minute hunger chron, we do not care if it fails
SELECT cron.unschedule('hunger_meter_decay');

-- 4. Schedule exact hourly hunger decay
SELECT cron.schedule(
    'hourly_hunger_meter_decay',
    '0 * * * *',
    $$SELECT increment_counter('hunger_meter', -1)$$
);

-- 5. Create a function to conditionally increment poop based on random chance
CREATE OR REPLACE FUNCTION try_random_poop()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only try to poop if the counter is currently 0
    IF (SELECT value FROM site_counters WHERE key = 'has_pooped') = 0 THEN
        -- Generate a random number from 0.0 to 1.0. 
        -- ~4.1% probability per hour equals roughly a 1-in-24 (or 1 / day) chance.
        IF random() < 0.0416 THEN
            PERFORM increment_counter('has_pooped', 1);
        END IF;
    END IF;
END;
$$;

-- 6. Schedule the random poop job every hour
SELECT cron.schedule(
    'hourly_random_poop_check',
    '0 * * * *',
    $$SELECT try_random_poop()$$
);
