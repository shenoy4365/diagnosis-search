-- Diagnosis AI - Supabase Database Schema
-- This file contains the complete database schema for the Diagnosis AI application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================
-- Stores additional user profile information beyond Supabase auth
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================================================
-- USER SETTINGS TABLE
-- ============================================================================
-- Stores user preferences and settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es', 'fr', 'de', 'zh', 'ja')),
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
-- Users can only read their own settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own settings
CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own settings
CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- ============================================================================
-- QUERY HISTORY TABLE
-- ============================================================================
-- Stores all user queries and AI responses for history and analytics
CREATE TABLE IF NOT EXISTS query_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  sources JSONB DEFAULT '[]'::jsonb,
  model_used TEXT, -- e.g., 'cerebras', 'groq'
  response_time_ms INTEGER, -- Response time in milliseconds
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE query_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for query_history
-- Users can only read their own query history
CREATE POLICY "Users can view own query history"
  ON query_history FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own queries
CREATE POLICY "Users can insert own queries"
  ON query_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own query history
CREATE POLICY "Users can delete own query history"
  ON query_history FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_query_history_user_id ON query_history(user_id);
CREATE INDEX IF NOT EXISTS idx_query_history_created_at ON query_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_history_user_created ON query_history(user_id, created_at DESC);

-- ============================================================================
-- CONVERSATION SESSIONS TABLE
-- ============================================================================
-- Groups related queries into conversation sessions for better UX
CREATE TABLE IF NOT EXISTS conversation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT, -- Auto-generated or user-defined title
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_sessions
CREATE POLICY "Users can view own sessions"
  ON conversation_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON conversation_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON conversation_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON conversation_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON conversation_sessions(updated_at DESC);

-- Add session_id to query_history to link queries to conversations
ALTER TABLE query_history ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES conversation_sessions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_query_history_session_id ON query_history(session_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_sessions_updated_at
  BEFORE UPDATE ON conversation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create default user settings on signup
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default settings when new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();

-- ============================================================================
-- ANALYTICS AND REPORTING VIEWS (Optional)
-- ============================================================================

-- View for user query statistics
CREATE OR REPLACE VIEW user_query_stats AS
SELECT
  user_id,
  COUNT(*) as total_queries,
  AVG(response_time_ms) as avg_response_time_ms,
  MIN(created_at) as first_query_at,
  MAX(created_at) as last_query_at
FROM query_history
GROUP BY user_id;

-- View for recent queries per user
CREATE OR REPLACE VIEW recent_user_queries AS
SELECT
  id,
  user_id,
  query,
  response,
  sources,
  model_used,
  response_time_ms,
  created_at,
  session_id,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as query_rank
FROM query_history;

-- ============================================================================
-- SAMPLE DATA (Optional - for development/testing)
-- ============================================================================
-- Uncomment below to insert sample data for testing

-- INSERT INTO user_profiles (user_id, full_name)
-- VALUES
--   ('00000000-0000-0000-0000-000000000001', 'Test User')
-- ON CONFLICT (user_id) DO NOTHING;

-- INSERT INTO user_settings (user_id, theme, language)
-- VALUES
--   ('00000000-0000-0000-0000-000000000001', 'dark', 'en')
-- ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- CLEANUP (Optional - use with caution)
-- ============================================================================
-- Uncomment below to drop all tables (useful for resetting during development)

-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
-- DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
-- DROP TRIGGER IF EXISTS update_conversation_sessions_updated_at ON conversation_sessions;
-- DROP FUNCTION IF EXISTS create_default_user_settings();
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP VIEW IF EXISTS recent_user_queries;
-- DROP VIEW IF EXISTS user_query_stats;
-- DROP TABLE IF EXISTS query_history CASCADE;
-- DROP TABLE IF EXISTS conversation_sessions CASCADE;
-- DROP TABLE IF EXISTS user_settings CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Run this script in your Supabase SQL Editor
-- 2. Make sure to enable Row Level Security on all tables
-- 3. The trigger on auth.users will automatically create default settings
-- 4. All user data is protected by RLS policies
-- 5. Indexes are created for common query patterns to optimize performance
-- 6. The conversation_sessions table allows grouping queries into conversations
-- 7. The query_history table tracks all interactions with AI models
