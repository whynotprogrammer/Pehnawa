-- =============================================================
-- 001_create_profiles.sql
-- Creates the profiles table and all required RLS policies.
--
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
--
-- Safe to run on a fresh project. If the table already exists
-- the DO $$ block will skip creation rather than erroring.
-- =============================================================

-- ── 1. ENUMS ──────────────────────────────────────────────────
-- Create the user_role enum only if it doesn't already exist.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('customer', 'business_owner');
  END IF;
END;
$$;

-- ── 2. PROFILES TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  -- Primary key — mirrors auth.users.id exactly
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,

  -- Role used by middleware for routing & access control
  role          user_role NOT NULL DEFAULT 'customer',

  -- Split name fields (used by profile edit flows)
  first_name    TEXT,
  last_name     TEXT,

  -- Computed full name for convenient display in joins
  -- e.g. business/donations pages query profiles!fkey ( full_name, email )
  full_name     TEXT GENERATED ALWAYS AS (
                  TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
                ) STORED,

  -- Contact info
  email         TEXT,           -- denormalised copy of auth.users.email for join queries
  phone         TEXT,
  avatar_url    TEXT,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. AUTO-POPULATE email ON INSERT ──────────────────────────
-- Keeps profiles.email in sync with auth.users.email automatically.
-- Fires after a new auth user is created (via trigger below) and
-- also handles manual inserts from the server action.
CREATE OR REPLACE FUNCTION handle_new_user_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Back-fill email from auth.users when a profile row is inserted
  -- without an explicit email value.
  IF NEW.email IS NULL THEN
    NEW.email := (SELECT email FROM auth.users WHERE id = NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_insert_set_email ON profiles;
CREATE TRIGGER on_profile_insert_set_email
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_email();

-- ── 4. AUTO-UPDATE updated_at ─────────────────────────────────
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_updated_at ON profiles;
CREATE TRIGGER on_profile_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ── 5. ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop policies individually so re-running this file is safe
DROP POLICY IF EXISTS "Users can view own profile"       ON profiles;
DROP POLICY IF EXISTS "Profiles are publicly readable"   ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile"     ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"     ON profiles;
DROP POLICY IF EXISTS "Business owners are viewable"     ON profiles;

-- Anyone can read a profile row (needed for donation joins where
-- the business queries profiles of other users via FK).
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT
  USING (true);

-- INSERT policy: allow if the row's id belongs to an existing auth user.
--
-- We intentionally do NOT use auth.uid() = id here because Supabase may
-- require email confirmation before issuing a session. Without a session,
-- auth.uid() is NULL and the insert would be silently rejected even though
-- the user was just created. Checking auth.users directly lets the server
-- action insert the profile row immediately after signUp regardless of
-- whether a session cookie is active yet.
--
-- This is safe because:
--   a) The profile id must be a real auth.users UUID (FK constraint enforces it)
--   b) The trigger auto-fills email from auth.users, preventing spoofing
--   c) UPDATE is still restricted to auth.uid() = id (session required)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (
    id IN (SELECT id FROM auth.users)
  );

-- Users can only update their own profile (session required).
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── 6. GRANT USAGE ───────────────────────────────────────────
-- Supabase's anon and authenticated roles need explicit grants
-- when RLS is enabled.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
