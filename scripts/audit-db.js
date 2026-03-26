const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function audit() {
  try {
    // Get all tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📊 EXISTING TABLES:');
    console.log(tables.rows.map(r => '  - ' + r.table_name).join('\n'));
    
    // Get columns for each table
    for (const table of tables.rows) {
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table.table_name]);
      
      console.log(`\n📋 ${table.table_name.toUpperCase()} COLUMNS:`);
      columns.rows.forEach(col => {
        console.log(`    ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
      });
    }
    
    // Get all enum types
    const enums = await pool.query(`
      SELECT t.typname, e.enumlabel 
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid
      ORDER BY t.typname, e.enumlabel
    `);
    
    console.log('\n📋 ENUM TYPES:');
    const grouped = {};
    enums.rows.forEach(r => {
      if (!grouped[r.typname]) grouped[r.typname] = [];
      grouped[r.typname].push(r.enumlabel);
    });
    Object.entries(grouped).forEach(([type, values]) => {
      console.log(`  - ${type}: [${values.join(', ')}]`);
    });
    
    // Get all indexes
    const indexes = await pool.query(`
      SELECT tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);
    
    console.log('\n🔍 INDEXES:');
    indexes.rows.forEach(idx => {
      console.log(`  - ${idx.tablename}.${idx.indexname}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

audit();
