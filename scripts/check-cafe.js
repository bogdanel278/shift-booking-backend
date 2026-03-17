const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://vekgwgzobfnxoocmnqhs.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla2d3Z3pvYmZueG9vY21ucWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzM4OTAsImV4cCI6MjA4ODgwOTg5MH0._Bzx-Osooupw3LYBPoBQlQja4mBH7hk-cno5i8IlbbQ'
);

async function checkCafeAccount() {
    console.log('☕ CHECKING CAFE ACCOUNT STATUS\n');
    console.log('='.repeat(60));

    const { data: profile, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('company_name', 'Cafe')
        .single();

    if (error) {
        console.error('❌ Error:', error);
        return;
    }

    console.log('\n📊 CAFE ACCOUNT DETAILS:\n');
    console.log('User ID:', profile.user_id);
    console.log('Company Name:', profile.company_name);
    console.log('Business Type:', profile.business_type || 'Not set');
    console.log('Verification Status:', profile.v_status || 'unverified');
    console.log('Created:', new Date(profile.created_at).toLocaleDateString());
    console.log('Business Address:', profile.business_address || 'Not set');

    // Check new preference fields
    console.log('\n🎯 DEFAULT SHIFT PREFERENCES:\n');
    console.log('Default Experience:', profile.default_min_experience || 'entry (default)');
    console.log('Default Uniform:', profile.default_uniform_instructions || 'Not set');
    console.log('Default PPE Required:', profile.default_ppe_required || false);

    console.log('\n' + '='.repeat(60));

    if (profile.v_status === 'verified') {
        console.log('\n✅ GREAT NEWS: Your "Cafe" account is VERIFIED!');
        console.log('You CAN create shifts!\n');
        console.log('🎯 NEW FEATURES READY TO TEST:\n');
        console.log('1. Profile Hub → Preferences');
        console.log('   - Set default experience level (⭐ Entry / ⭐⭐ Pro / ⭐⭐⭐ Expert)');
        console.log('   - Set default uniform instructions');
        console.log('   - Toggle PPE requirement\n');
        console.log('2. Create Shift');
        console.log('   - Experience selector with star icons');
        console.log('   - Uniform & PPE section');
        console.log('   - Fields auto-fill from your preferences!\n');
        console.log('💡 TIP: Set your preferences once, they\'ll auto-fill every shift!');
    } else {
        console.log('\n⚠️  WARNING: Account is NOT VERIFIED');
        console.log('Status:', profile.v_status || 'unverified');
        console.log('You CANNOT create shifts until verified.\n');
        console.log('To fix: Run this SQL in Supabase:\n');
        console.log(`UPDATE business_profiles SET v_status = 'verified' WHERE user_id = '${profile.user_id}';`);
    }

    // Check if new columns exist
    console.log('\n📋 NEW FIELDS STATUS:\n');
    const hasNewFields =
        profile.hasOwnProperty('default_min_experience') &&
        profile.hasOwnProperty('default_uniform_instructions') &&
        profile.hasOwnProperty('default_ppe_required');

    if (hasNewFields) {
        console.log('✅ Database migration completed - New fields exist!');
    } else {
        console.log('⚠️  WARNING: New preference fields missing!');
        console.log('Run the database migration: docs/database_migration_preferences.sql');
    }
}

checkCafeAccount();
