-- Create places cache table to store Google Places API results
-- This reduces API calls and costs by caching frequently searched places

CREATE TABLE IF NOT EXISTS places_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Search query information
    search_query TEXT NOT NULL,
    search_type TEXT NOT NULL CHECK (search_type IN ('all', 'malls', 'stores')),
    
    -- Google Places data
    place_id TEXT NOT NULL,
    name TEXT NOT NULL,
    formatted_address TEXT NOT NULL,
    
    -- Location data
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Place details
    place_types TEXT[], -- Array of Google place types
    business_status TEXT,
    rating DECIMAL(3, 2),
    user_ratings_total INTEGER,
    phone_number TEXT,
    website TEXT,
    
    -- Address components (parsed)
    street_number TEXT,
    route TEXT,
    locality TEXT, -- City
    administrative_area_level_1 TEXT, -- State/Province
    administrative_area_level_2 TEXT, -- County
    country TEXT,
    postal_code TEXT,
    
    -- Metadata
    source TEXT NOT NULL DEFAULT 'google_places',
    search_count INTEGER DEFAULT 1, -- Track how often this place is searched
    last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient searching
CREATE INDEX IF NOT EXISTS idx_places_cache_search_query ON places_cache(search_query);
CREATE INDEX IF NOT EXISTS idx_places_cache_place_id ON places_cache(place_id);
CREATE INDEX IF NOT EXISTS idx_places_cache_search_type ON places_cache(search_type);
CREATE INDEX IF NOT EXISTS idx_places_cache_location ON places_cache(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_places_cache_last_searched ON places_cache(last_searched_at);

-- Composite index for search optimization
CREATE INDEX IF NOT EXISTS idx_places_cache_query_type ON places_cache(search_query, search_type);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_places_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_places_cache_updated_at
    BEFORE UPDATE ON places_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_places_cache_updated_at();

-- Function to increment search count and update last_searched_at
CREATE OR REPLACE FUNCTION increment_place_search_count(place_cache_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE places_cache 
    SET 
        search_count = search_count + 1,
        last_searched_at = NOW()
    WHERE id = place_cache_id;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) - Allow all users to read cached places
ALTER TABLE places_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read cached places (public data)
CREATE POLICY "Anyone can read places cache" ON places_cache
    FOR SELECT USING (true);

-- Policy: Only authenticated users can insert/update cache
CREATE POLICY "Authenticated users can manage places cache" ON places_cache
    FOR ALL USING (auth.role() = 'authenticated');

-- Add comments for documentation
COMMENT ON TABLE places_cache IS 'Cache table for Google Places API results to reduce API costs';
COMMENT ON COLUMN places_cache.search_query IS 'The original search query used';
COMMENT ON COLUMN places_cache.search_type IS 'Type of search: all, malls, or stores';
COMMENT ON COLUMN places_cache.place_id IS 'Google Places unique identifier';
COMMENT ON COLUMN places_cache.search_count IS 'Number of times this place has been searched';
COMMENT ON COLUMN places_cache.last_searched_at IS 'When this place was last searched/accessed';