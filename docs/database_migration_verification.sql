-- Business Verification System Migration
-- Run this in Supabase SQL Editor

-- 1. Drop existing enum if it exists, then create new one
DROP TYPE IF EXISTS verification_status CASCADE;
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- 2. Add verification columns to business_profiles table (drop v_status first if it exists with old type)
DO $$ 
BEGIN
    -- Drop v_status if it exists with incompatible type
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'business_profiles' 
               AND column_name = 'v_status') THEN
        ALTER TABLE business_profiles DROP COLUMN v_status;
    END IF;
END $$;

-- Now add all columns
ALTER TABLE business_profiles 
ADD COLUMN IF NOT EXISTS v_status verification_status DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS company_number TEXT,
ADD COLUMN IF NOT EXISTS vat_number TEXT,
ADD COLUMN IF NOT EXISTS insurance_doc_url TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS trading_name TEXT;

-- 3. Create index on v_status for faster queries
CREATE INDEX IF NOT EXISTS idx_business_profiles_v_status 
ON business_profiles(v_status);

-- 4. Add comment to columns for documentation
COMMENT ON COLUMN business_profiles.v_status IS 'Business verification status: unverified, pending, verified, or rejected';
COMMENT ON COLUMN business_profiles.company_number IS 'UK Companies House registration number';
COMMENT ON COLUMN business_profiles.vat_number IS 'VAT registration number (optional)';
COMMENT ON COLUMN business_profiles.insurance_doc_url IS 'URL to uploaded insurance certificate PDF';
COMMENT ON COLUMN business_profiles.business_address IS 'Registered business address from Companies House or manually entered';
COMMENT ON COLUMN business_profiles.trading_name IS 'Trading name (may differ from registered company name)';

-- 5. Update existing rows to have default verification status
UPDATE business_profiles 
SET v_status = 'unverified' 
WHERE v_status IS NULL;

-- IMPORTANT: Create Storage Bucket for Insurance Documents
-- You must manually create a bucket named 'verification-docs' in Supabase Storage
-- with the following settings:
-- - Public: NO (private bucket)
-- - File size limit: 5MB recommended
-- - Allowed MIME types: application/pdf

-- Storage policies for verification-docs bucket
-- NOTE: Run these AFTER you manually create the 'verification-docs' bucket in Supabase Storage UI

-- Policy 1: Allow authenticated users to upload their own documents
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can upload their own verification docs'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can upload their own verification docs"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = ''verification-docs'' 
            AND (storage.foldername(name))[1] = auth.uid()::text
        )';
    END IF;
END $$;

-- Policy 2: Allow users to read their own documents
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can read their own verification docs'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can read their own verification docs"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (
            bucket_id = ''verification-docs'' 
            AND (storage.foldername(name))[1] = auth.uid()::text
        )';
    END IF;
END $$;

-- Policy 3: Allow users to update/delete their own documents
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can delete their own verification docs'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can delete their own verification docs"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
            bucket_id = ''verification-docs'' 
            AND (storage.foldername(name))[1] = auth.uid()::text
        )';
    END IF;
END $$;

-- Verification completed!
SELECT 'Business verification system setup complete!' AS message;
