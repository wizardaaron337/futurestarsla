-- Future Stars LA - Supabase Setup SQL
-- Paste this into Supabase Dashboard → SQL Editor → New Query → Run

-- 1. INVENTORY TABLE
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    sport TEXT NOT NULL CHECK (sport IN ('baseball', 'soccer')),
    total INTEGER NOT NULL DEFAULT 0,
    img TEXT DEFAULT '',
    sizes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Allow anon read access (anyone logged in can read)
CREATE POLICY "Anyone can read inventory"
    ON inventory FOR SELECT
    USING (true);

-- 2. CREW TRIPS TABLE
CREATE TABLE crew_trips (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    sport TEXT,
    month TEXT,
    start_date TEXT,
    end_date TEXT,
    status TEXT,
    state TEXT,
    crew TEXT,
    location TEXT,
    leave_date TEXT,
    leave_time TEXT,
    rental_return TEXT,
    pex_card TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crew_trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read crew trips"
    ON crew_trips FOR SELECT
    USING (true);

-- 3. TOURNAMENTS TABLE
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    sport TEXT DEFAULT 'soccer',
    month TEXT,
    start_date TEXT,
    end_date TEXT,
    location TEXT,
    state TEXT,
    site TEXT,
    age_group TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tournaments"
    ON tournaments FOR SELECT
    USING (true);

-- 4. USERS TABLE (for future Supabase Auth migration)
CREATE TABLE site_users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'inventory' CHECK (role IN ('owner', 'logistics', 'tournament', 'inventory')),
    emoji TEXT DEFAULT '👤',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read profiles"
    ON site_users FOR SELECT
    USING (true);

-- For now, we still use auth-config.js but future = Supabase Auth
