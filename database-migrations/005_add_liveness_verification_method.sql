-- =====================================================
-- MIGRATION: Add liveness verification method
-- Version: 005
-- Date: 2026-03-26
-- =====================================================

DO $$
BEGIN
  ALTER TYPE verification_method ADD VALUE IF NOT EXISTS 'liveness';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;