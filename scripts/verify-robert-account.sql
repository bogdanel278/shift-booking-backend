-- ============================================================
-- QUICK FIX: Verify Robert's Restaurant Account
-- ============================================================
-- This will allow robert@gmail.com to create shifts
-- Run this in Supabase SQL Editor
-- ============================================================

-- Verify Robert's Restaurant (most likely robert@gmail.com)
UPDATE business_profiles
SET v_status = 'verified',
    company_number = 'DEV123456',
    vat_number = 'GB999999999',
    business_address = '123 Test Street, London, UK'
WHERE user_id = '6d10849a-8bd9-46e3-90da-edc2580241d2'
AND company_name = 'Robert''s Restaurant';

-- Verify the update worked
SELECT 
  user_id,
  company_name,
  v_status,
  company_number,
  created_at
FROM business_profiles
WHERE user_id = '6d10849a-8bd9-46e3-90da-edc2580241d2';

-- ============================================================
-- Expected Result:
-- v_status should now be 'verified'
-- robert@gmail.com can now create shifts immediately!
-- ============================================================
