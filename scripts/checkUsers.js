require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_HOST.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
});

async function checkUsers() {
  try {
    const result = await pool.query(`
      SELECT id, email, role, is_verified, is_active, created_at 
      FROM users 
      WHERE deleted_at IS NULL 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log('\n📋 User Accounts in Database:');
    console.log('================================');
    
    if (result.rows.length === 0) {
      console.log('❌ No users found in database!');
      console.log('\nYou need to create a user account first.');
    } else {
      result.rows.forEach((user, idx) => {
        console.log(`\n${idx + 1}. Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Verified: ${user.is_verified}`);
        console.log(`   Active: ${user.is_active}`);
        console.log(`   Created: ${user.created_at}`);
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
