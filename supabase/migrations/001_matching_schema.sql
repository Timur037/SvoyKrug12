-- ================================================================
-- Migration 001: Add matching fields to users + create match tables
-- Run in Supabase SQL Editor
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Extend users table with profile fields
-- ----------------------------------------------------------------
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS gender               TEXT,
  ADD COLUMN IF NOT EXISTS work                 TEXT,
  ADD COLUMN IF NOT EXISTS district             TEXT,
  ADD COLUMN IF NOT EXISTS hobbies              TEXT[]        DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS qualities            TEXT[]        DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS city                 TEXT          DEFAULT 'Москва',
  ADD COLUMN IF NOT EXISTS is_active            BOOLEAN       DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN       DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_seen_at         TIMESTAMPTZ   DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS matching_paused_until TIMESTAMPTZ;

-- Mark existing users who completed onboarding
-- (those that have district set already)
UPDATE users
SET onboarding_completed = TRUE
WHERE district IS NOT NULL;

-- ----------------------------------------------------------------
-- 2. match_jobs — one record per daily matching run
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS match_jobs (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  status            TEXT          NOT NULL DEFAULT 'running'
                      CHECK (status IN ('running', 'completed', 'failed', 'partial')),
  city              TEXT          NOT NULL DEFAULT 'Москва',
  candidates_count  INT           DEFAULT 0,
  groups_formed     INT           DEFAULT 0,
  meetups_created   INT           DEFAULT 0,
  error_log         JSONB,
  started_at        TIMESTAMPTZ   DEFAULT NOW(),
  finished_at       TIMESTAMPTZ
);

-- ----------------------------------------------------------------
-- 3. match_groups — a group of users formed by the matcher
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS match_groups (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        UUID        NOT NULL REFERENCES match_jobs(id) ON DELETE CASCADE,
  district      TEXT        NOT NULL,
  user_ids      UUID[]      NOT NULL,
  size          INT         NOT NULL,
  hobby_score   FLOAT       NOT NULL DEFAULT 0,  -- Jaccard similarity on hobbies
  work_score    FLOAT       NOT NULL DEFAULT 0,  -- work category compatibility
  total_score   FLOAT       NOT NULL DEFAULT 0,  -- weighted final score
  status        TEXT        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'meetup_created', 'skipped')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 4. Indexes for matching queries
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_district        ON users (district)   WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_city            ON users (city)       WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_onboarded       ON users (onboarding_completed) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_match_groups_job      ON match_groups (job_id);
CREATE INDEX IF NOT EXISTS idx_match_groups_district ON match_groups (district);
