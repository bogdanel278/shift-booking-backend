-- Business Verification System Migration V2
-- Run this in Supabase SQL Editor
-- This version is safer and handles existing data better

-- PART 1: TYPE AND COLUMN SETUP
-- ================================

-- Step 1: Check if verification_status type exists and what values it has
DO $$ 
BEGIN
    -- If the type exists, drop it along with any dependent columns (including other tables)
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
        RAISE NOTICE 'Dropping existing verification_status type and dependent columns...';
        
        -- Drop columns that use this type from all tables
        ALTER TABLE business_profiles DROP COLUMN IF EXISTS v_status;
        ALTER TABLE right_to_work_verifications DROP COLUMN IF EXISTS status;
        
        -- Now safe to drop the type
        DROP TYPE verification_status CASCADE;
    END IF;
END $$;

-- Step 2: Create the verification_status enum type with correct values
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- Step 3: Add all verification columns to business_profiles
ALTER TABLE business_profiles 
ADD COLUMN v_status verification_status DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS company_number TEXT,
ADD COLUMN IF NOT EXISTS vat_number TEXT,
ADD COLUMN IF NOT EXISTS insurance_doc_url TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS trading_name TEXT;

-- Step 3b: Restore the status column to right_to_work_verifications if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'right_to_work_verifications') THEN
        ALTER TABLE right_to_work_verifications 
        ADD COLUMN IF NOT EXISTS status verification_status DEFAULT 'pending';
    END IF;
END $$;

-- Step 4: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_business_profiles_v_status 
ON business_profiles(v_status);

-- Step 5: Add documentation comments
COMMENT ON COLUMN business_profiles.v_status IS 'Business verification status: unverified, pending, verified, or rejected';
COMMENT ON COLUMN business_profiles.company_number IS 'UK Companies House registration number (8 chars)';
COMMENT ON COLUMN business_profiles.vat_number IS 'VAT registration number (optional)';
COMMENT ON COLUMN business_profiles.insurance_doc_url IS 'Supabase Storage URL to insurance certificate PDF';
COMMENT ON COLUMN business_profiles.business_address IS 'Registered business address from Companies House';
COMMENT ON COLUMN business_profiles.trading_name IS 'Trading name if different from registered company name';

-- Step 6: Ensure all existing rows have the default status
UPDATE business_profiles 
SET v_status = 'unverified' 
WHERE v_status IS NULL;

-- Success message for Part 1
SELECT '✅ Part 1 Complete: Database schema updated!' AS status;

-- ================================
-- PART 2: STORAGE BUCKET POLICIES
-- ================================
-- IMPORTANT: You must FIRST create the bucket manually:
-- 1. Go to: Supabase Dashboard → Storage → Buckets
-- 2. Click "New bucket"
-- 3. Name: verification-docs
-- 4. Public: NO (keep private)
-- 5. File size limit: 5MB
-- 6. Allowed MIME types: application/pdf
-- 
-- Then uncomment and run the policies below:

/*
-- Policy 1: Users can upload their own verification documents
CREATE POLICY "Users can upload their own verification docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'verification-docs' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can read their own verification documents
CREATE POLICY "Users can read their own verification docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'verification-docs' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can delete their own verification documents
CREATE POLICY "Users can delete their own verification docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'verification-docs' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
*/

-- ================================
-- VERIFICATION
-- ================================

-- Check that everything is set up correctly
SELECT 
    'v_status' as column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'business_profiles' 
AND column_name IN ('v_status', 'company_number', 'vat_number', 'insurance_doc_url', 'business_address', 'trading_name')
ORDER BY column_name;

SELECT '🎉 Migration Complete! Next steps:' AS message
UNION ALL
SELECT '1. Create "verification-docs" bucket in Supabase Storage UI' 
UNION ALL
SELECT '2. Then uncomment and run Part 2 (storage policies)' 
UNION ALL
SELECT '3. Test verification flow in the app';
