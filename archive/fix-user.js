const { Client } = require('pg');

const password = 'CrewlioData1!';
const connectionString = `postgresql://postgres.vekgwgzobfnxoocmnqhs:${password}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`;

async function fixUser() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✓ Connected to database\n');

        // Insert the user into the public.users table
        const result = await client.query(`
            INSERT INTO public.users (id, email, name, role, is_active, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE 
            SET email = EXCLUDED.email,
                name = EXCLUDED.name,
                role = EXCLUDED.role,
                is_active = EXCLUDED.is_active,
                is_verified = EXCLUDED.is_verified
            RETURNING *;
        `, [
            '8545d0e2-0f4f-4bd8-aec3-802ddf0b6ba5',  // Your user ID
            'robert@gmail.com',                       // Your email
            'Robert',                                 // Name
            'business',                               // Role
            true,                                     // is_active
            true                                      // is_verified
        ]);

        console.log('✅ User record created/updated successfully:');
        console.log(result.rows[0]);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

fixUser();
