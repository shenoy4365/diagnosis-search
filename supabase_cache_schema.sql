-- =====================================================
-- CACHE TABLES FOR DIAGNOSIS AI
-- =====================================================

-- Query Cache Table
-- Stores cached search results to improve performance
CREATE TABLE IF NOT EXISTS query_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT UNIQUE NOT NULL,
  query_text TEXT NOT NULL,
  response_data JSONB NOT NULL,
  sources JSONB,
  image_sources JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  hit_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast query hash lookups
CREATE INDEX IF NOT EXISTS idx_query_cache_hash ON query_cache(query_hash);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_query_cache_expires ON query_cache(expires_at);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_query_cache_created ON query_cache(created_at);

-- Source Cache Table
-- Stores scraped and processed source content
CREATE TABLE IF NOT EXISTS source_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  url_hash TEXT UNIQUE NOT NULL,
  title TEXT,
  content TEXT,
  markdown TEXT,
  summary TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  hit_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for URL lookups
CREATE INDEX IF NOT EXISTS idx_source_cache_url_hash ON source_cache(url_hash);

-- Index for expiration
CREATE INDEX IF NOT EXISTS idx_source_cache_expires ON source_cache(expires_at);

-- Cache Analytics Table
-- Track cache performance metrics
CREATE TABLE IF NOT EXISTS cache_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_type TEXT NOT NULL, -- 'query' or 'source'
  action TEXT NOT NULL, -- 'hit', 'miss', 'invalidate'
  identifier TEXT NOT NULL, -- query_hash or url_hash
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_cache_analytics_type_action ON cache_analytics(cache_type, action);
CREATE INDEX IF NOT EXISTS idx_cache_analytics_created ON cache_analytics(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all cache tables
ALTER TABLE query_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_analytics ENABLE ROW LEVEL SECURITY;

-- Query Cache Policies
-- Allow service role full access (for server-side operations)
CREATE POLICY "Service role can manage query cache"
  ON query_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read cache
CREATE POLICY "Authenticated users can read query cache"
  ON query_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Source Cache Policies
CREATE POLICY "Service role can manage source cache"
  ON source_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read source cache"
  ON source_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Cache Analytics Policies
CREATE POLICY "Service role can manage cache analytics"
  ON cache_analytics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read cache analytics"
  ON cache_analytics
  FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- AUTOMATIC CACHE CLEANUP FUNCTION
-- =====================================================

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete expired query cache entries
  DELETE FROM query_cache
  WHERE expires_at < NOW();

  -- Delete expired source cache entries
  DELETE FROM source_cache
  WHERE expires_at < NOW();

  -- Clean up old analytics (keep last 30 days)
  DELETE FROM cache_analytics
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get or set query cache
CREATE OR REPLACE FUNCTION get_query_cache(
  p_query_hash TEXT
)
RETURNS TABLE (
  response_data JSONB,
  sources JSONB,
  image_sources JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update hit count and last accessed
  UPDATE query_cache
  SET
    hit_count = hit_count + 1,
    last_accessed_at = NOW()
  WHERE query_hash = p_query_hash
    AND expires_at > NOW();

  -- Return cached data
  RETURN QUERY
  SELECT
    qc.response_data,
    qc.sources,
    qc.image_sources
  FROM query_cache qc
  WHERE qc.query_hash = p_query_hash
    AND qc.expires_at > NOW();
END;
$$;

-- Function to set query cache
CREATE OR REPLACE FUNCTION set_query_cache(
  p_query_hash TEXT,
  p_query_text TEXT,
  p_response_data JSONB,
  p_sources JSONB,
  p_image_sources JSONB,
  p_ttl_minutes INTEGER DEFAULT 60
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO query_cache (
    query_hash,
    query_text,
    response_data,
    sources,
    image_sources,
    expires_at
  ) VALUES (
    p_query_hash,
    p_query_text,
    p_response_data,
    p_sources,
    p_image_sources,
    NOW() + (p_ttl_minutes || ' minutes')::INTERVAL
  )
  ON CONFLICT (query_hash)
  DO UPDATE SET
    response_data = EXCLUDED.response_data,
    sources = EXCLUDED.sources,
    image_sources = EXCLUDED.image_sources,
    expires_at = EXCLUDED.expires_at,
    created_at = NOW(),
    hit_count = 0,
    last_accessed_at = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Function to get source cache
CREATE OR REPLACE FUNCTION get_source_cache(
  p_url_hash TEXT
)
RETURNS TABLE (
  title TEXT,
  content TEXT,
  markdown TEXT,
  summary TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update hit count and last accessed
  UPDATE source_cache
  SET
    hit_count = hit_count + 1,
    last_accessed_at = NOW()
  WHERE url_hash = p_url_hash
    AND expires_at > NOW();

  -- Return cached data
  RETURN QUERY
  SELECT
    sc.title,
    sc.content,
    sc.markdown,
    sc.summary
  FROM source_cache sc
  WHERE sc.url_hash = p_url_hash
    AND sc.expires_at > NOW();
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION cleanup_expired_cache() TO service_role;
GRANT EXECUTE ON FUNCTION get_query_cache(TEXT) TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION set_query_cache(TEXT, TEXT, JSONB, JSONB, JSONB, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_source_cache(TEXT) TO service_role, authenticated;
