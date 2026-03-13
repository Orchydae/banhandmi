-- =============================================
-- Hourly decay for Mood Meter
-- =============================================

-- 1. Ensure the mood_meter row exists in site_counters
INSERT INTO site_counters (key, value)
VALUES ('mood_meter', 100)
ON CONFLICT (key) DO NOTHING;

-- 2. Update increment_counter to handle mood_meter constraint
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
            WHEN counter_key = 'mood_meter'
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

-- 3. Schedule exact hourly mood decay
SELECT cron.schedule(
    'hourly_mood_meter_decay',
    '0 * * * *',
    $$SELECT increment_counter('mood_meter', -1)$$
);
