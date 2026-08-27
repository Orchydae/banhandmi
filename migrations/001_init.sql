-- =============================================================
-- Bánh and Mi — initial schema for Lakebase Postgres (Neon)
--
-- Consolidates the previous incremental migrations into one
-- baseline, and adds the two tables (weight_history, donations)
-- that had only ever been created by hand in a dashboard.
--
-- No RLS policies: the database is never reached from a browser.
-- The banhapi Neon Function is the security boundary, and it
-- connects as the owner role.
-- =============================================================

-- ---------- items ----------

DO $$ BEGIN
    CREATE TYPE item_category AS ENUM (
        'dream_artifact',
        'favorite_treat',
        'disapproved_item'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category        item_category NOT NULL,
    name            VARCHAR(255) NOT NULL,
    name_fr         VARCHAR(255),
    description     TEXT,
    description_fr  TEXT,
    image_url       VARCHAR(512),
    affiliate_url   VARCHAR(512),
    price_hint      DOUBLE PRECISION,
    display_order   INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Serves the only read pattern: active items of one category, in order.
CREATE INDEX IF NOT EXISTS items_category_active_idx
    ON items (category, display_order)
    WHERE is_active;

-- ---------- site_counters ----------

-- Bounds live in the table rather than inside increment_counter(), so
-- adding a meter is an INSERT instead of a rewrite of the function.
-- NULL bounds mean unbounded (treats_given, dog_birthdate).
CREATE TABLE IF NOT EXISTS site_counters (
    key        VARCHAR(64) PRIMARY KEY,
    value      BIGINT NOT NULL DEFAULT 0,
    min_value  BIGINT,
    max_value  BIGINT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_counters (key, value, min_value, max_value) VALUES
    ('treats_given', 0,   0,    NULL),
    ('hunger_meter', 100, 0,    100),
    ('mood_meter',   100, 0,    100),
    ('has_pooped',   1,   0,    1)
ON CONFLICT (key) DO NOTHING;

-- Bánh's birthdate, stored as a Unix timestamp in seconds.
-- Intentionally NOT seeded — carry the real value over from the old
-- database. Set it with:
--   INSERT INTO site_counters (key, value) VALUES ('dog_birthdate', <unix_seconds>)
--   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
-- Until it is set, the API reports birthdate/age as null.

-- Atomically add `amount` to a counter, clamped to its own bounds.
-- Returns the new value, or NULL if the key does not exist.
CREATE OR REPLACE FUNCTION increment_counter(counter_key VARCHAR, amount INT DEFAULT 1)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    new_value BIGINT;
BEGIN
    UPDATE site_counters
    SET value = LEAST(
            GREATEST(value + amount, COALESCE(min_value, value + amount)),
            COALESCE(max_value, value + amount)
        ),
        updated_at = NOW()
    WHERE key = counter_key
    RETURNING value INTO new_value;

    RETURN new_value;
END;
$$;

-- Roughly a 1-in-24 chance per call, i.e. about once a day when called
-- hourly. Only fires when the yard is clean.
CREATE OR REPLACE FUNCTION try_random_poop()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    IF (SELECT value FROM site_counters WHERE key = 'has_pooped') = 0
       AND random() < 0.0416 THEN
        PERFORM increment_counter('has_pooped', 1);
        RETURN true;
    END IF;

    RETURN false;
END;
$$;

-- ---------- weight_history ----------

CREATE TABLE IF NOT EXISTS weight_history (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date       DATE NOT NULL DEFAULT CURRENT_DATE,
    weight     DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS weight_history_date_idx
    ON weight_history (date DESC);

-- ---------- donations ----------

CREATE TABLE IF NOT EXISTS donations (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_payment_id VARCHAR(255) UNIQUE,
    donor_name        VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
    message           TEXT,
    amount_cents      BIGINT NOT NULL,
    created_at        TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- The donor marquee reads newest-first; the donor wall reads largest-first.
CREATE INDEX IF NOT EXISTS donations_created_at_idx ON donations (created_at DESC);
CREATE INDEX IF NOT EXISTS donations_amount_idx     ON donations (amount_cents DESC);
