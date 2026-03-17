/**
 * Script to create the verification-docs storage bucket in Supabase
 * Run with: node scripts/create-storage-bucket.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createStorageBucket() {
    console.log('🗂️  Creating verification-docs storage bucket...\n');

    try {
        // Check if bucket already exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('❌ Error listing buckets:', listError.message);
            return;
        }

        const bucketExists = buckets?.some(bucket => bucket.name === 'verification-docs');

        if (bucketExists) {
            console.log('✅ Bucket "verification-docs" already exists!');
            console.log('   No action needed.\n');
            return;
        }

        // Create the bucket
        const { data, error } = await supabase.storage.createBucket('verification-docs', {
            public: false,
            fileSizeLimit: 5242880, // 5MB in bytes
            allowedMimeTypes: ['application/pdf']
        });

        if (error) {
            console.error('❌ Error creating bucket:', error.message);
            console.log('\n📝 Manual steps required:');
            console.log('   1. Go to: https://supabase.com/dashboard/project/vekgwgzobfnxoocmnqhs/storage/buckets');
            console.log('   2. Click "New bucket"');
            console.log('   3. Name: verification-docs');
            console.log('   4. Public: NO (keep it private)');
            console.log('   5. File size limit: 5MB');
            console.log('   6. Allowed MIME types: application/pdf');
            console.log('   7. Click "Create bucket"\n');
            return;
        }

        console.log('✅ Successfully created "verification-docs" bucket!');
        console.log('   Settings:');
        console.log('   - Public: false (private)');
        console.log('   - Max file size: 5MB');
        console.log('   - Allowed types: PDF only\n');

        console.log('📋 Next steps:');
        console.log('   1. Verify storage policies are applied (they should be from the SQL migration)');
        console.log('   2. Test uploading a document from the app');
        console.log('   3. Check the bucket in Supabase Dashboard\n');

    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
    }
}

createStorageBucket();
