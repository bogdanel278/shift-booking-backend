const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : { rejectUnauthorized: false },
});

async function migrateAuthRTW() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting Auth & RTW migration...\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, '../database-migrations/003_auth_rtw.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Executing migration...');
    await client.query('BEGIN');
    await client.query(migration);
    await client.query('COMMIT');

    console.log('✅ Migration completed successfully!\n');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = 'right_to_work_verifications';
    `);

    if (result.rows.length > 0) {
      console.log('✓ right_to_work_verifications table created');
    }

    // Verify ENUM types were created
    const enumResult = await client.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typname IN ('verification_method', 'verification_status');
    `);

    console.log('\n📊 Created ENUM types:');
    enumResult.rows.forEach(row => {
      console.log(`  ✓ ${row.typname}`);
    });

    console.log('\n🎉 Database is ready for authentication and right-to-work verification!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
migrateAuthRTW().catch(console.error);
