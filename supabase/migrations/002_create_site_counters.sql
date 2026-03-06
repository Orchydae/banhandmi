-- ===================================
-- Treats counter for @banhandmi
-- ===================================

CREATE TABLE site_counters (
    key VARCHAR(64) PRIMARY KEY,
    value BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Seed the treats counter
INSERT INTO site_counters (key, value) VALUES ('treats_given', 0);

-- Row Level Security
ALTER TABLE site_counters ENABLE ROW LEVEL SECURITY;

-- Anyone can read counters
CREATE POLICY "Public read counters" ON site_counters
    FOR SELECT USING (true);

-- Anyone can update counters (public interaction)
CREATE POLICY "Public update counters" ON site_counters
    FOR UPDATE USING (true);

-- Function to atomically increment a counter
CREATE OR REPLACE FUNCTION increment_counter(counter_key VARCHAR, amount INT DEFAULT 1)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    new_value BIGINT;
BEGIN
    UPDATE site_counters
    SET value = value + amount, updated_at = NOW()
    WHERE key = counter_key
    RETURNING value INTO new_value;
    RETURN new_value;
END;
$$;
