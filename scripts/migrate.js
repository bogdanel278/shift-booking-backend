const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database migration...');
    
    await client.query('BEGIN');
    
    // Create extension for UUID generation
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✓ UUID extension created');
    
    // Create ENUM types
    await client.query("CREATE TYPE user_role AS ENUM ('worker', 'business')");
    await client.query("CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled')");
    console.log('✓ ENUM types created');
    
    // Users table
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role user_role NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');
    
    // Shifts table
    await client.query(`
      CREATE TABLE shifts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        pay_rate DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Shifts table created');
    
    // Bookings table
    await client.query(`
      CREATE TABLE bookings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
        worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status booking_status DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(shift_id, worker_id)
      )
    `);
    console.log('✓ Bookings table created');
    
    // Create indexes
    await client.query('CREATE INDEX idx_users_email ON users(email)');
    await client.query('CREATE INDEX idx_users_role ON users(role)');
    await client.query('CREATE INDEX idx_shifts_business_id ON shifts(business_id)');
    await client.query('CREATE INDEX idx_shifts_start_time ON shifts(start_time)');
    await client.query('CREATE INDEX idx_bookings_shift_id ON bookings(shift_id)');
    await client.query('CREATE INDEX idx_bookings_worker_id ON bookings(worker_id)');
    await client.query('CREATE INDEX idx_bookings_status ON bookings(status)');
    console.log('✓ Indexes created');
    
    await client.query('COMMIT');
    console.log('✅ Database migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error(err);
  process.exit(1);
});
