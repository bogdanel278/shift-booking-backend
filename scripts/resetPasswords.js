require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function resetPasswords() {
  try {
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(`
      UPDATE users 
      SET password_hash = $1 
      WHERE email IN ('worker@example.com', 'shop@example.com', 'test.worker@example.com', 'testworker2@example.com', 'worker3@example.com')
      RETURNING email
    `, [hash]);
    
    console.log('\n✅ Password reset complete!');
    console.log(`\nUpdated ${result.rows.length} accounts:`);
    result.rows.forEach(row => console.log(`  - ${row.email}`));
    console.log('\n📝 Default password for all accounts: password123');
    console.log('\nYou can now login with:');
    console.log('  Email: worker@example.com');
    console.log('  Password: password123\n');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPasswords();
