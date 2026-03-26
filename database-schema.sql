-- Database schema for shift booking marketplace

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('worker', 'business');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shifts table
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    pay_rate DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_business CHECK (
        (SELECT role FROM users WHERE id = business_id) = 'business'
    )
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status booking_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shift_id, worker_id),
    CONSTRAINT valid_worker CHECK (
        (SELECT role FROM users WHERE id = worker_id) = 'worker'
    )
);

-- Indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_shifts_business_id ON shifts(business_id);
CREATE INDEX idx_shifts_start_time ON shifts(start_time);
CREATE INDEX idx_bookings_shift_id ON bookings(shift_id);
CREATE INDEX idx_bookings_worker_id ON bookings(worker_id);
CREATE INDEX idx_bookings_status ON bookings(status);
