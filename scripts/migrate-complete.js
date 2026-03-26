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
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migration...\n');

    // Read the complete schema file
    const schemaPath = path.join(__dirname, '../database-schema-complete.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    console.log('📝 Executing complete database schema...');
    await client.query('BEGIN');
    await client.query(schema);
    await client.query('COMMIT');

    console.log('✅ Database schema created successfully!\n');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    console.log(`\n🎉 Migration completed successfully! ${result.rows.length} tables created.`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
