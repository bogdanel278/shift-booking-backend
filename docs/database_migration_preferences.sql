-- ============================================================
-- Database Migration: Worker Experience & Uniform Requirements
-- ============================================================
-- This migration adds support for:
-- 1. Minimum experience levels for shifts (Entry, Pro, Expert)
-- 2. Uniform and PPE requirements
-- 3. Business profile default preferences for these fields
-- ============================================================

-- Step 1: Add columns to shifts table
-- ============================================================
ALTER TABLE shifts 
ADD COLUMN IF NOT EXISTS min_experience_level TEXT DEFAULT 'entry',
ADD COLUMN IF NOT EXISTS uniform_instructions TEXT,
ADD COLUMN IF NOT EXISTS ppe_required BOOLEAN DEFAULT false;

-- Add comments to document the columns
COMMENT ON COLUMN shifts.min_experience_level IS 'Minimum experience required: entry (0-1 years), pro (2-5 years), expert (5+ years)';
COMMENT ON COLUMN shifts.uniform_instructions IS 'Specific uniform requirements and dress code instructions';
COMMENT ON COLUMN shifts.ppe_required IS 'Whether Personal Protective Equipment is required for this shift';

-- Step 2: Add columns to business_profiles table
-- ============================================================
ALTER TABLE business_profiles
ADD COLUMN IF NOT EXISTS default_uniform_instructions TEXT,
ADD COLUMN IF NOT EXISTS default_min_experience TEXT DEFAULT 'entry',
ADD COLUMN IF NOT EXISTS default_ppe_required BOOLEAN DEFAULT false;

-- Add comments to document the columns
COMMENT ON COLUMN business_profiles.default_uniform_instructions IS 'Default uniform instructions that auto-fill when creating new shifts';
COMMENT ON COLUMN business_profiles.default_min_experience IS 'Default minimum experience level for new shifts';
COMMENT ON COLUMN business_profiles.default_ppe_required IS 'Default PPE requirement for new shifts';

-- Step 3: Add check constraint to ensure valid experience levels
-- ============================================================
ALTER TABLE shifts 
DROP CONSTRAINT IF EXISTS shifts_min_experience_level_check;

ALTER TABLE shifts 
ADD CONSTRAINT shifts_min_experience_level_check 
CHECK (min_experience_level IN ('entry', 'pro', 'expert'));

ALTER TABLE business_profiles 
DROP CONSTRAINT IF EXISTS business_profiles_default_min_experience_check;

ALTER TABLE business_profiles 
ADD CONSTRAINT business_profiles_default_min_experience_check 
CHECK (default_min_experience IN ('entry', 'pro', 'expert'));

-- Step 4: Create index for filtering shifts by experience level
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_shifts_min_experience_level 
ON shifts(min_experience_level) 
WHERE deleted_at IS NULL;

-- ============================================================
-- Verification Queries
-- ============================================================
-- Run these queries after migration to verify the changes

-- Check shifts table columns
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'shifts' 
AND column_name IN ('min_experience_level', 'uniform_instructions', 'ppe_required');

-- Check business_profiles table columns
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'business_profiles' 
AND column_name IN ('default_uniform_instructions', 'default_min_experience', 'default_ppe_required');

-- Test inserting a shift with new fields
-- INSERT INTO shifts (business_id, title, location, start_time, end_time, pay_rate, min_experience_level, uniform_instructions, ppe_required)
-- VALUES ('your-user-id', 'Test Shift', 'Test Location', NOW(), NOW() + INTERVAL '4 hours', 15.50, 'pro', 'Smart black attire required', true);
