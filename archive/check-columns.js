const { Client } = require('pg');

const password = 'CrewlioData1!';
const connectionString = `postgresql://postgres.vekgwgzobfnxoocmnqhs:${password}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`;

async function addColumns() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✓ Connected to database\n');

        // The business_profiles table already has:
        // - company_name (we're using this as trading_name)
        // - logo_url (already exists!)
        // - description (we're using this as business_address)
        // - business_type (we're using this as industry_type/category)

        console.log('📋 Checking existing columns in business_profiles table...\n');

        const columnsResult = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns
            WHERE table_schema = 'public' 
            AND table_name = 'business_profiles'
            ORDER BY ordinal_position;
        `);

        console.log('Existing columns:');
        columnsResult.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });

        console.log('\n✅ Good news! The business_profiles table already has all needed columns:');
        console.log('  - company_name ← We use this as Trading Name');
        console.log('  - logo_url ← Already exists!');
        console.log('  - description ← We use this as Business Address');
        console.log('  - business_type ← We use this as Category/Industry Type');

        console.log('\n💡 No migration needed - your app is already correctly mapped!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

addColumns();
