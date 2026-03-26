const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'worker_profiles'
      ORDER BY ordinal_position
    `);
    console.log('worker_profiles columns:');
    res.rows.forEach(r => console.log(`  - ${r.column_name} (${r.data_type}, nullable: ${r.is_nullable})`));
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkSchema();
