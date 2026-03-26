-- Add min_payrate column to users table
-- This represents the minimum hourly pay rate a worker is willing to accept

ALTER TABLE users 
ADD COLUMN min_payrate DECIMAL(10, 2) DEFAULT 0.00;

-- Add a check constraint to ensure min_payrate is non-negative
ALTER TABLE users
ADD CONSTRAINT min_payrate_non_negative CHECK (min_payrate IS NULL OR min_payrate >= 0);

-- Add comment for documentation
COMMENT ON COLUMN users.min_payrate IS 'Minimum hourly pay rate the worker is willing to accept (in local currency)';
