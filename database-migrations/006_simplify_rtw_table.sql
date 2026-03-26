-- =====================================================
-- MIGRATION: Simplify Right-to-Work Table
-- Version: 006
-- Date: 2026-03-26
-- =====================================================
-- This migration simplifies the right_to_work_verifications table
-- to a cleaner structure focused on share-based verification

-- =====================================================
-- 1. Drop old constraints and enums if they exist
-- =====================================================

-- Drop old table if it exists
DROP TABLE IF EXISTS right_to_work_verifications CASCADE;

-- Drop old enum types if they exist  
DROP TYPE IF EXISTS verification_method CASCADE;
DROP TYPE IF EXISTS verification_status CASCADE;

-- =====================================================
-- 2. Create new enum for share verification status
-- =====================================================

CREATE TYPE share_status AS ENUM ('verified', 'not_verified');

-- =====================================================
-- 3. Create simplified right_to_work_verifications table
-- =====================================================

CREATE TABLE right_to_work_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Worker reference
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Sequential employee number (01, 02, 03, etc.)
  employee_nr VARCHAR(10) NOT NULL,
  
  -- Worker name for verification record
  name VARCHAR(255) NOT NULL,
  
  -- Share verification status
  share_status share_status DEFAULT 'not_verified',
  
  -- When documents were provided
  documents_provided_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE(worker_id, employee_nr),
  CONSTRAINT valid_employee_nr CHECK (employee_nr ~ '^[0-9]{2,}$')
);

-- =====================================================
-- 4. Create indexes for performance
-- =====================================================

CREATE INDEX idx_rtw_worker_id ON right_to_work_verifications(worker_id);
CREATE INDEX idx_rtw_employee_nr ON right_to_work_verifications(employee_nr);
CREATE INDEX idx_rtw_share_status ON right_to_work_verifications(share_status);
CREATE INDEX idx_rtw_documents_provided_at ON right_to_work_verifications(documents_provided_at);

-- =====================================================
-- 5. Create trigger for updated_at
-- =====================================================

CREATE TRIGGER update_rtw_updated_at BEFORE UPDATE ON right_to_work_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. Add comments
-- =====================================================

COMMENT ON TABLE right_to_work_verifications IS 'Simplified right-to-work verification with sequential employee tracking';
COMMENT ON COLUMN right_to_work_verifications.worker_id IS 'Reference to the worker user';
COMMENT ON COLUMN right_to_work_verifications.employee_nr IS 'Sequential employee number (01, 02, 03, etc.)';
COMMENT ON COLUMN right_to_work_verifications.name IS 'Worker name for verification record';
COMMENT ON COLUMN right_to_work_verifications.share_status IS 'Verification status: verified or not_verified';
COMMENT ON COLUMN right_to_work_verifications.documents_provided_at IS 'Timestamp when documents were provided';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
