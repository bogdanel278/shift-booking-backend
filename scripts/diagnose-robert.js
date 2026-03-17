const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://vekgwgzobfnxoocmnqhs.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla2d3Z3pvYmZueG9vY21ucWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzM4OTAsImV4cCI6MjA4ODgwOTg5MH0._Bzx-Osooupw3LYBPoBQlQja4mBH7hk-cno5i8IlbbQ'
);

async function diagnoseShiftCreationIssue() {
    console.log('🔍 DIAGNOSING SHIFT CREATION ISSUE FOR robert@gmail.com\n');
    console.log('='.repeat(60));

    try {
        // Get all business profiles
        console.log('\n📊 Fetching all business profiles...\n');
        const { data: profiles, error: profileError } = await supabase
            .from('business_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (profileError) {
            console.error('❌ Error fetching profiles:', profileError);
            return;
        }

        console.log(`Found ${profiles.length} business profile(s):\n`);

        profiles.forEach((profile, index) => {
            console.log(`\n--- Profile #${index + 1} ---`);
            console.log(`User ID: ${profile.user_id}`);
            console.log(`Company Name: ${profile.company_name || 'Not set'}`);
            console.log(`Business Type: ${profile.business_type || 'Not set'}`);
            console.log(`Verification Status: ${profile.v_status || 'unverified'}`);
            console.log(`Created: ${profile.created_at}`);

            // Check if this profile can create shifts
            if (!profile.v_status || profile.v_status === 'unverified') {
                console.log('⚠️  WARNING: Cannot create shifts - NOT VERIFIED');
            } else if (profile.v_status === 'pending') {
                console.log('⏳ WARNING: Cannot create shifts - PENDING VERIFICATION');
            } else if (profile.v_status === 'rejected') {
                console.log('❌ WARNING: Cannot create shifts - VERIFICATION REJECTED');
            } else if (profile.v_status === 'verified') {
                console.log('✅ OK: Can create shifts - VERIFIED');
            }
        });

        console.log('\n' + '='.repeat(60));
        console.log('\n🔐 REASON FOR BLOCKED SHIFT CREATION:\n');
        console.log('The CreateShiftScreen has a HARD GUARD that blocks shift');
        console.log('creation for businesses that are NOT verified.\n');
        console.log('📋 VERIFICATION REQUIREMENTS:');
        console.log('  1. Business must be verified (v_status = "verified")');
        console.log('  2. To verify, go to: Profile Hub → Business Verification');
        console.log('  3. Submit: Company number, VAT, Insurance document\n');

        console.log('🛠️  QUICK FIX OPTIONS:\n');
        console.log('Option 1: Verify the business properly (Recommended)');
        console.log('  - Open app → Profile Hub → Business Verification');
        console.log('  - Submit verification documents');
        console.log('  - Wait for approval or manually approve in database\n');

        console.log('Option 2: Manually verify in Supabase (Development only)');
        console.log('  - Open Supabase Dashboard → Table Editor');
        console.log('  - Find business_profiles table');
        console.log('  - Find the user\'s row');
        console.log('  - Set v_status to "verified"\n');

        console.log('Option 3: Use SQL (Fastest for testing)');
        console.log('  Run this in Supabase SQL Editor:\n');
        profiles.forEach((profile, index) => {
            console.log(`  -- Profile #${index + 1}: ${profile.company_name || 'Unknown'}`);
            console.log(`  UPDATE business_profiles`);
            console.log(`  SET v_status = 'verified'`);
            console.log(`  WHERE user_id = '${profile.user_id}';\n`);
        });

        console.log('='.repeat(60));
        console.log('\n📧 TO FIND robert@gmail.com USER_ID:');
        console.log('1. Go to Supabase Dashboard');
        console.log('2. Authentication → Users');
        console.log('3. Search for robert@gmail.com');
        console.log('4. Copy the User ID');
        console.log('5. Match it with the profiles above\n');

    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

diagnoseShiftCreationIssue();
