const { Pool } = require('pg');
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';
const pool = new Pool({
  host,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: host.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create pgcrypto extension for uuid generation
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    // Create share_status enum type
    await client.query(`DO $$ BEGIN
      CREATE TYPE share_status AS ENUM ('verified', 'not_verified');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);

    // Create update_updated_at_column function if it doesn't exist
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Drop old table if it exists (migration from old schema)
    await client.query('DROP TABLE IF EXISTS right_to_work_verifications CASCADE');

    // Drop old enums if they exist
    await client.query('DROP TYPE IF EXISTS verification_method CASCADE');
    await client.query('DROP TYPE IF EXISTS verification_status CASCADE');

    // Create new simplified table
    await client.query(`
      CREATE TABLE IF NOT EXISTS right_to_work_verifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        employee_nr VARCHAR(10) NOT NULL,
        name VARCHAR(255) NOT NULL,
        share_status share_status DEFAULT 'not_verified',
        documents_provided_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(worker_id, employee_nr),
        CONSTRAINT valid_employee_nr CHECK (employee_nr ~ '^[0-9]{2,}$')
      )
    `);

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_rtw_worker_id ON right_to_work_verifications(worker_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_rtw_employee_nr ON right_to_work_verifications(employee_nr)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_rtw_share_status ON right_to_work_verifications(share_status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_rtw_documents_provided_at ON right_to_work_verifications(documents_provided_at)');

    // Create trigger for updated_at
    await client.query(`
      DROP TRIGGER IF EXISTS update_rtw_updated_at ON right_to_work_verifications
    `);
    await client.query(`
      CREATE TRIGGER update_rtw_updated_at
      BEFORE UPDATE ON right_to_work_verifications
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    await client.query('COMMIT');
    console.log('✓ Right-to-work schema initialized successfully');
    
    const check = await client.query("SELECT COUNT(*) FROM information_schema.tables WHERE table_name='right_to_work_verifications'");
    if (check.rows[0].count === '1') {
      console.log('✓ Table right_to_work_verifications exists');
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Schema initialization failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  process.exit(1);
});
