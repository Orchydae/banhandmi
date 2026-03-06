-- ===========================
-- Items table for @banhandmi
-- ===========================

-- Category enum
CREATE TYPE item_category AS ENUM (
    'dream_artifact',
    'favorite_treat',
    'disapproved_item'
);

-- Main items table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category item_category NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(512),
    affiliate_url VARCHAR(512),
    price_hint DOUBLE PRECISION,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Anyone can read items (public site)
CREATE POLICY "Public read access" ON items
    FOR SELECT USING (true);
