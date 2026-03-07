-- =============================================
-- Hunger meter: pg_cron decay + clamped updates
-- =============================================

-- 1. Enable pg_cron (must be done via Supabase Dashboard > Database > Extensions first)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Seed the hunger meter row (skip if already inserted)
INSERT INTO site_counters (key, value)
VALUES ('hunger_meter', 100)
ON CONFLICT (key) DO NOTHING;

-- 3. Update increment_counter to clamp hunger_meter between 0 and 100
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
            ELSE value + amount
        END,
        updated_at = NOW()
    WHERE key = counter_key
    RETURNING value INTO new_value;
    RETURN new_value;
END;
$$;

-- 4. Schedule half-hourly hunger decay (decrements by 1 every 30 minutes, clamped at 0)
-- Run this in the Supabase SQL Editor:
SELECT cron.schedule(
    'hunger_meter_decay',
    '*/30 * * * *',
    $$SELECT increment_counter('hunger_meter', -1)$$
);
