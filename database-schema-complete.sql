-- =====================================================
-- SHIFT BOOKING MARKETPLACE - COMPLETE DATABASE SCHEMA
-- =====================================================
-- Production-ready PostgreSQL schema for MVP
-- Generated: 2026-03-11
-- =====================================================

-- Drop existing types if they exist (use CASCADE carefully in production)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS shift_status CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS timesheet_status CASCADE;
DROP TYPE IF EXISTS review_type CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS payout_status CASCADE;
DROP TYPE IF EXISTS document_type CASCADE;
DROP TYPE IF EXISTS document_status CASCADE;

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM ('worker', 'business');

-- Shift statuses
CREATE TYPE shift_status AS ENUM (
  'draft',
  'published',
  'in_progress',
  'completed',
  'cancelled'
);

-- Booking statuses
CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'completed'
);

-- Timesheet statuses
CREATE TYPE timesheet_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'paid'
);

-- Review types
CREATE TYPE review_type AS ENUM (
  'worker_to_business',
  'business_to_worker'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'booking_created',
  'booking_confirmed',
  'booking_cancelled',
  'shift_reminder',
  'review_received',
  'payment_processed',
  'message_received',
  'system_announcement'
);

-- Payment methods
CREATE TYPE payment_method AS ENUM (
  'bank_transfer',
  'paypal',
  'stripe',
  'cash'
);

-- Payout statuses
CREATE TYPE payout_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled'
);

-- Document types
CREATE TYPE document_type AS ENUM (
  'id_card',
  'passport',
  'work_permit',
  'background_check',
  'certification',
  'business_license',
  'insurance',
  'other'
);

-- Document statuses
CREATE TYPE document_status AS ENUM (
  'pending',
  'verified',
  'rejected',
  'expired'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- -----------------------------------------------------
-- Table: users
-- Stores all user accounts (workers and businesses)
-- -----------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  profile_picture_url TEXT,
  timezone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- -----------------------------------------------------
-- Table: worker_profiles
-- Extended profile information for workers
-- -----------------------------------------------------
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  skills TEXT[],
  hourly_rate DECIMAL(10, 2),
  years_of_experience INTEGER,
  certifications TEXT[],
  availability JSONB,
  rating DECIMAL(3, 2),
  total_jobs_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT hourly_rate_positive CHECK (hourly_rate IS NULL OR hourly_rate > 0),
  CONSTRAINT rating_range CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  CONSTRAINT years_positive CHECK (years_of_experience IS NULL OR years_of_experience >= 0),
  CONSTRAINT jobs_non_negative CHECK (total_jobs_completed >= 0)
);

-- -----------------------------------------------------
-- Table: business_profiles
-- Extended profile information for businesses
-- -----------------------------------------------------
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  company_description TEXT,
  industry VARCHAR(100),
  company_size VARCHAR(50),
  website VARCHAR(255),
  address TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_documents TEXT[],
  rating DECIMAL(3, 2),
  total_shifts_posted INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT rating_range CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  CONSTRAINT shifts_non_negative CHECK (total_shifts_posted >= 0)
);

-- -----------------------------------------------------
-- Table: shifts
-- Job shifts posted by businesses
-- -----------------------------------------------------
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  requirements TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  pay_rate DECIMAL(10, 2) NOT NULL,
  max_workers INTEGER,
  category VARCHAR(100),
  status shift_status DEFAULT 'published',
  search_vector TSVECTOR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT pay_rate_positive CHECK (pay_rate > 0),
  CONSTRAINT max_workers_positive CHECK (max_workers IS NULL OR max_workers > 0),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- -----------------------------------------------------
-- Table: bookings
-- Worker bookings for shifts
-- -----------------------------------------------------
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status booking_status DEFAULT 'pending',
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT unique_worker_shift UNIQUE (worker_id, shift_id)
);

-- -----------------------------------------------------
-- Table: timesheets
-- Time tracking for completed shifts
-- -----------------------------------------------------
CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clock_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out_time TIMESTAMP WITH TIME ZONE,
  break_duration INTEGER DEFAULT 0,
  total_hours DECIMAL(10, 2),
  hourly_rate DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2),
  status timesheet_status DEFAULT 'pending',
  notes TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT hourly_rate_positive CHECK (hourly_rate > 0),
  CONSTRAINT break_duration_non_negative CHECK (break_duration >= 0),
  CONSTRAINT total_hours_positive CHECK (total_hours IS NULL OR total_hours > 0),
  CONSTRAINT total_amount_positive CHECK (total_amount IS NULL OR total_amount > 0),
  CONSTRAINT valid_clock_times CHECK (clock_out_time IS NULL OR clock_out_time > clock_in_time)
);

-- -----------------------------------------------------
-- Table: payouts
-- Payment processing records
-- -----------------------------------------------------
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timesheet_id UUID REFERENCES timesheets(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  status payout_status DEFAULT 'pending',
  transaction_id VARCHAR(255),
  notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT amount_positive CHECK (amount > 0)
);

-- -----------------------------------------------------
-- Table: reviews
-- Bidirectional review system
-- -----------------------------------------------------
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type review_type NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT unique_review_per_booking UNIQUE (booking_id, reviewer_id)
);

-- -----------------------------------------------------
-- Table: notifications
-- User notification system
-- -----------------------------------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- -----------------------------------------------------
-- Table: documents
-- Document verification system
-- -----------------------------------------------------
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  status document_status DEFAULT 'pending',
  notes TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- -----------------------------------------------------
-- Table: audit_logs
-- System audit trail
-- -----------------------------------------------------
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);

-- Worker profiles indexes
CREATE INDEX idx_worker_profiles_user_id ON worker_profiles(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_worker_profiles_rating ON worker_profiles(rating DESC NULLS LAST) WHERE deleted_at IS NULL;
CREATE INDEX idx_worker_profiles_skills ON worker_profiles USING GIN(skills) WHERE deleted_at IS NULL;

-- Business profiles indexes
CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_business_profiles_industry ON business_profiles(industry) WHERE deleted_at IS NULL;
CREATE INDEX idx_business_profiles_verified ON business_profiles(is_verified) WHERE deleted_at IS NULL;
CREATE INDEX idx_business_profiles_rating ON business_profiles(rating DESC NULLS LAST) WHERE deleted_at IS NULL;

-- Shifts table indexes
CREATE INDEX idx_shifts_business_id ON shifts(business_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_shifts_start_time ON shifts(start_time) WHERE deleted_at IS NULL;
CREATE INDEX idx_shifts_status ON shifts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_shifts_category ON shifts(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_shifts_location ON shifts(location) WHERE deleted_at IS NULL;
CREATE INDEX idx_shifts_search_vector ON shifts USING GIN(search_vector) WHERE deleted_at IS NULL;

-- Bookings table indexes
CREATE INDEX idx_bookings_shift_id ON bookings(shift_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_worker_id ON bookings(worker_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_status ON bookings(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Timesheets table indexes
CREATE INDEX idx_timesheets_booking_id ON timesheets(booking_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_timesheets_worker_id ON timesheets(worker_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_timesheets_business_id ON timesheets(business_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_timesheets_status ON timesheets(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_timesheets_clock_in ON timesheets(clock_in_time);

-- Payouts table indexes
CREATE INDEX idx_payouts_worker_id ON payouts(worker_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_payouts_timesheet_id ON payouts(timesheet_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_payouts_status ON payouts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_payouts_created_at ON payouts(created_at);

-- Reviews table indexes
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_type ON reviews(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Notifications table indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_type ON notifications(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Documents table indexes
CREATE INDEX idx_documents_user_id ON documents(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_type ON documents(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_status ON documents(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_expiry ON documents(expiry_date) WHERE deleted_at IS NULL AND expiry_date IS NOT NULL;

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- -----------------------------------------------------
-- Function: Update updated_at timestamp
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON worker_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON business_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON timesheets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------
-- Function: Update shift search vector
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION update_shift_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shifts_search_vector BEFORE INSERT OR UPDATE ON shifts
  FOR EACH ROW EXECUTE FUNCTION update_shift_search_vector();

-- -----------------------------------------------------
-- Function: Prevent double booking
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION check_worker_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM bookings b
    JOIN shifts s1 ON b.shift_id = s1.id
    JOIN shifts s2 ON s2.id = NEW.shift_id
    WHERE b.worker_id = NEW.worker_id
    AND b.status IN ('pending', 'confirmed')
    AND b.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND b.deleted_at IS NULL
    AND s1.deleted_at IS NULL
    AND s2.deleted_at IS NULL
    AND (s2.start_time, s2.end_time) OVERLAPS (s1.start_time, s1.end_time)
  ) THEN
    RAISE EXCEPTION 'Worker already has a booking during this time';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_double_booking BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION check_worker_availability();

-- -----------------------------------------------------
-- Function: Enforce shift capacity
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION check_shift_capacity()
RETURNS TRIGGER AS $$
DECLARE
  capacity INTEGER;
  current_count INTEGER;
BEGIN
  SELECT max_workers INTO capacity
  FROM shifts
  WHERE id = NEW.shift_id AND deleted_at IS NULL;
  
  IF capacity IS NOT NULL AND NEW.status IN ('pending', 'confirmed') THEN
    SELECT COUNT(*) INTO current_count
    FROM bookings
    WHERE shift_id = NEW.shift_id
    AND status IN ('pending', 'confirmed')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND deleted_at IS NULL;
    
    IF current_count >= capacity THEN
      RAISE EXCEPTION 'Shift is already at full capacity';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_shift_capacity BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION check_shift_capacity();

-- -----------------------------------------------------
-- Function: Audit logging
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (
      NULLIF(current_setting('app.current_user_id', TRUE), '')::uuid,
      'INSERT',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (
      NULLIF(current_setting('app.current_user_id', TRUE), '')::uuid,
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (
      NULLIF(current_setting('app.current_user_id', TRUE), '')::uuid,
      'DELETE',
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_shifts AFTER INSERT OR UPDATE OR DELETE ON shifts
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_bookings AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_payouts AFTER INSERT OR UPDATE OR DELETE ON payouts
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_timesheets AFTER INSERT OR UPDATE OR DELETE ON timesheets
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- =====================================================
-- INITIAL DATA / SEED (Optional)
-- =====================================================

-- You can add seed data here for development/testing
-- Example: Default admin user, test data, etc.

-- =====================================================
-- SCHEMA INFORMATION
-- =====================================================

COMMENT ON TABLE users IS 'Core user accounts for both workers and businesses';
COMMENT ON TABLE worker_profiles IS 'Extended profile information for worker users';
COMMENT ON TABLE business_profiles IS 'Extended profile information for business users';
COMMENT ON TABLE shifts IS 'Job shifts posted by businesses';
COMMENT ON TABLE bookings IS 'Worker bookings for specific shifts';
COMMENT ON TABLE timesheets IS 'Time tracking records for completed shifts';
COMMENT ON TABLE payouts IS 'Payment processing and tracking';
COMMENT ON TABLE reviews IS 'Bidirectional review system between workers and businesses';
COMMENT ON TABLE notifications IS 'User notification system';
COMMENT ON TABLE documents IS 'Document upload and verification system';
COMMENT ON TABLE audit_logs IS 'System-wide audit trail for security and compliance';

-- =====================================================
-- GRANTS (Adjust based on your application user)
-- =====================================================

-- Example: Grant permissions to your application database user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
