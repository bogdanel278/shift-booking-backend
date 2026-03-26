-- =====================================================
-- MIGRATION: Authentication and Right-to-Work Verification
-- Version: 003
-- Date: 2026-03-11
-- =====================================================

-- This migration adds right-to-work verification support
-- Run this AFTER the base schema is in place

-- =====================================================
-- 1. CREATE ENUM TYPES
-- =====================================================

CREATE TYPE verification_method AS ENUM ('passport', 'visa', 'share_code');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'failed');

-- =====================================================
-- 2. CREATE RIGHT TO WORK VERIFICATIONS TABLE
-- =====================================================

CREATE TABLE right_to_work_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Verification details
  verification_method verification_method NOT NULL,
  status verification_status DEFAULT 'pending',
  
  -- Provider integration
  provider_name VARCHAR(100),
  provider_reference VARCHAR(255),
  
  -- Share code method
  share_code VARCHAR(20),
  
  -- Passport method
  passport_number VARCHAR(50),
  passport_country VARCHAR(3),
  passport_expiry_date DATE,
  
  -- Visa method
  visa_type VARCHAR(100),
  visa_expiry_date DATE,
  visa_reference VARCHAR(100),
  
  -- Document storage
  document_file_url TEXT,
  
  -- Review tracking
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  checked_at TIMESTAMP WITH TIME ZONE,
  checked_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  
  -- Provider response (for audit/debugging)
  raw_provider_response_json JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_passport_data CHECK (
    verification_method != 'passport' OR 
    (passport_number IS NOT NULL AND passport_country IS NOT NULL AND passport_expiry_date IS NOT NULL)
  ),
  CONSTRAINT valid_visa_data CHECK (
    verification_method != 'visa' OR 
    (visa_type IS NOT NULL AND visa_expiry_date IS NOT NULL)
  ),
  CONSTRAINT valid_share_code_data CHECK (
    verification_method != 'share_code' OR 
    share_code IS NOT NULL
  )
);

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

CREATE INDEX idx_rtw_worker_id ON right_to_work_verifications(worker_user_id);
CREATE INDEX idx_rtw_status ON right_to_work_verifications(status);
CREATE INDEX idx_rtw_submitted_at ON right_to_work_verifications(submitted_at);
CREATE INDEX idx_rtw_provider_ref ON right_to_work_verifications(provider_reference) WHERE provider_reference IS NOT NULL;

-- =====================================================
-- 4. ADD TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_rtw_updated_at BEFORE UPDATE ON right_to_work_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. OPTIONAL: EXTEND WORKER PROFILES
-- =====================================================
-- Note: These columns are optional extensions to worker_profiles
-- Uncomment if you want to add these fields directly to worker profiles

-- ALTER TABLE worker_profiles
--   ADD COLUMN IF NOT EXISTS date_of_birth DATE,
--   ADD COLUMN IF NOT EXISTS address_line_1 VARCHAR(255),
--   ADD COLUMN IF NOT EXISTS address_line_2 VARCHAR(255),
--   ADD COLUMN IF NOT EXISTS city VARCHAR(100),
--   ADD COLUMN IF NOT EXISTS postcode VARCHAR(20),
--   ADD COLUMN IF NOT EXISTS nationality VARCHAR(3),
--   ADD COLUMN IF NOT EXISTS right_to_work_status verification_status;

-- =====================================================
-- 6. COMMENTS
-- =====================================================

COMMENT ON TABLE right_to_work_verifications IS 'Right-to-work verification requests and results';
COMMENT ON COLUMN right_to_work_verifications.verification_method IS 'Method of verification: passport, visa, or share_code';
COMMENT ON COLUMN right_to_work_verifications.status IS 'Current status: pending, approved, rejected, or failed';
COMMENT ON COLUMN right_to_work_verifications.provider_name IS 'Third-party verification provider (e.g., Vouchsafe)';
COMMENT ON COLUMN right_to_work_verifications.raw_provider_response_json IS 'Complete provider API response for audit purposes';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
