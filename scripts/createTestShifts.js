require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function createTestShifts() {
  try {
    // Get a business user ID
    const businessResult = await pool.query(`
      SELECT id FROM users WHERE role = 'business' AND deleted_at IS NULL LIMIT 1
    `);
    
    if (businessResult.rows.length === 0) {
      console.error('❌ No business user found. Create a business account first.');
      process.exit(1);
    }
    
    const businessId = businessResult.rows[0].id;
    
    // Create future test shifts
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0);
    
    const shifts = [
      {
        title: 'Restaurant Server - Lunch Shift',
        description: 'Busy lunch service at downtown restaurant',
        location: 'Downtown Restaurant, 123 Main St',
        requirements: 'Previous server experience preferred',
        start_time: tomorrow,
        end_time: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000), // +4 hours
        pay_rate: 18.50,
        max_workers: 3,
        category: 'Hospitality',
        status: 'open'
      },
      {
        title: 'Event Staff - Wedding',
        description: 'Help set up and serve at wedding reception',
        location: 'Grand Hotel, 456 Event Blvd',
        requirements: 'Professional appearance, good communication',
        start_time: nextWeek,
        end_time: new Date(nextWeek.getTime() + 6 * 60 * 60 * 1000), // +6 hours
        pay_rate: 22.00,
        max_workers: 5,
        category: 'Events',
        status: 'open'
      },
      {
        title: 'Retail Assistant',
        description: 'Weekend retail support needed',
        location: 'Shopping Mall, Store 42',
        requirements: 'Customer service experience',
        start_time: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000), // Day after tomorrow
        end_time: new Date(tomorrow.getTime() + 32 * 60 * 60 * 1000), // +8 hours
        pay_rate: 16.00,
        max_workers: 2,
        category: 'Retail',
        status: 'open'
      }
    ];
    
    for (const shift of shifts) {
      await pool.query(`
        INSERT INTO shifts (
          business_id, title, description, location, requirements,
          start_time, end_time, pay_rate, max_workers, category, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        businessId,
        shift.title,
        shift.description,
        shift.location,
        shift.requirements,
        shift.start_time,
        shift.end_time,
        shift.pay_rate,
        shift.max_workers,
        shift.category,
        shift.status
      ]);
      console.log(`✓ Created: ${shift.title}`);
    }
    
    console.log('\n✅ Created 3 test shifts!');
    console.log('\nThese shifts should now appear in the mobile app\'s available shifts list.\n');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestShifts();
