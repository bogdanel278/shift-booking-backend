const { pool } = require('../dist/config/database');

(async () => {
  try {
    const shiftsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'shifts' 
      ORDER BY ordinal_position
    `);
    console.log('📋 shifts table columns:');
    shiftsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    });
    
    const bookingsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      ORDER BY ordinal_position
    `);
    console.log('\n📋 bookings table columns:');
    bookingsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
