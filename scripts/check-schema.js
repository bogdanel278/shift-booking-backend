const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...\n');

    // Check business_profiles table
    const businessResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'business_profiles'
      ORDER BY ordinal_position
    `);

    console.log('📋 business_profiles columns:');
    if (businessResult.rows.length === 0) {
      console.log('  ❌ Table does not exist!');
    } else {
      businessResult.rows.forEach(r => {
        console.log(`  - ${r.column_name} (${r.data_type}, nullable: ${r.is_nullable})`);
      });
    }

    // Check worker_profiles table
    const workerResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'worker_profiles'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 worker_profiles columns:');
    if (workerResult.rows.length === 0) {
      console.log('  ❌ Table does not exist!');
    } else {
      workerResult.rows.forEach(r => {
        console.log(`  - ${r.column_name} (${r.data_type}, nullable: ${r.is_nullable})`);
      });
    }

    // Check right_to_work_verifications table
    const rtwResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'right_to_work_verifications'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 right_to_work_verifications columns:');
    if (rtwResult.rows.length === 0) {
      console.log('  ❌ Table does not exist!');
    } else {
      rtwResult.rows.forEach(r => {
        console.log(`  - ${r.column_name} (${r.data_type}, nullable: ${r.is_nullable})`);
      });
    }

    // List all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\n📊 All tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
