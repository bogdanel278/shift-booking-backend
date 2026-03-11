-- =====================================================
-- MIGRATION: Add Admin Role
-- Version: 004
-- Date: 2026-03-11
-- =====================================================

-- Add 'admin' to user_role ENUM type
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- Optional: Create an admin user (update with your details)
-- INSERT INTO users (name, email, password_hash, role, is_verified, is_active)
-- VALUES (
--   'Admin User',
--   'admin@example.com',
--   '$2a$10$EXAMPLEHASH', -- Generate with: node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
--   'admin',
--   true,
--   true
-- );

COMMENT ON TYPE user_role IS 'User roles: worker, business, admin';
