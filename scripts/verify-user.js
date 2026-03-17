/**
 * Script to update user verification status
 * Usage: node scripts/verify-user.js user@example.com
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

async function verifyUser(email) {
    console.log(`🔍 Looking for user with email: ${email}\n`);

    try {
        // Step 1: Find the user by email from auth.users
        // Note: We can't directly query auth.users with anon key, so we'll find via business_profiles

        // First, try to find via business_profiles using email match
        const { data: profiles, error: profileError } = await supabase
            .from('business_profiles')
            .select('user_id, v_status, company_name, business_address')
            .limit(100); // Get all profiles to search

        if (profileError) {
            console.error('❌ Error fetching profiles:', profileError.message);
            return;
        }

        // Get auth user info for each profile to match email
        console.log(`📋 Checking ${profiles?.length || 0} business profiles...\n`);

        let foundUserId = null;
        let currentStatus = null;

        // Since we can't directly query auth.users with anon key,
        // we'll need to use the user_id from session or ask for it
        console.log('⚠️  Note: Due to security restrictions, we need the user_id.\n');
        console.log('Option 1: Log in with the account first, then run this:');
        console.log('  const { data: { user } } = await supabase.auth.getUser();\n');
        console.log('Option 2: Get user_id from Supabase Dashboard:');
        console.log('  1. Go to: https://supabase.com/dashboard/project/vekgwgzobfnxoocmnqhs/auth/users');
        console.log('  2. Find the user by email');
        console.log('  3. Copy their UUID\n');
        console.log('Then run: node scripts/verify-user.js <user_id>\n');

        // If the first argument looks like a UUID, treat it as user_id
        if (email.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            foundUserId = email;
            console.log(`✅ Using provided user_id: ${foundUserId}\n`);
        } else {
            console.log(`❌ Email lookup not possible with anon key. Please provide user_id instead.\n`);
            return;
        }

        // Step 2: Check current status
        const { data: profile, error: checkError } = await supabase
            .from('business_profiles')
            .select('v_status, company_name, business_address, company_number')
            .eq('user_id', foundUserId)
            .single();

        if (checkError) {
            console.error('❌ Error fetching profile:', checkError.message);
            console.log('\nProfile might not exist yet. Create it first in the app.\n');
            return;
        }

        console.log('📊 Current Profile Status:');
        console.log('  User ID:', foundUserId);
        console.log('  Company:', profile.company_name || 'Not set');
        console.log('  Address:', profile.business_address || 'Not set');
        console.log('  Company Number:', profile.company_number || 'Not set');
        console.log('  Verification Status:', profile.v_status || 'unverified');
        console.log('');

        currentStatus = profile.v_status;

        if (currentStatus === 'verified') {
            console.log('ℹ️  User is already verified!\n');
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });

            readline.question('Do you want to change status anyway? (yes/no): ', async (answer) => {
                readline.close();
                if (answer.toLowerCase() !== 'yes') {
                    console.log('❌ Cancelled.\n');
                    return;
                }
                await updateStatus(foundUserId);
            });
        } else {
            await updateStatus(foundUserId);
        }

    } catch (error) {
        console.error('💥 Unexpected error:', error.message);
    }
}

async function updateStatus(userId) {
    console.log('🔄 Updating verification status to "verified"...\n');

    const { data, error } = await supabase
        .from('business_profiles')
        .update({ v_status: 'verified' })
        .eq('user_id', userId)
        .select();

    if (error) {
        console.error('❌ Error updating status:', error.message);
        return;
    }

    console.log('✅ SUCCESS! User is now verified!\n');
    console.log('📋 Updated Profile:');
    console.log('  User ID:', userId);
    console.log('  Verification Status: verified ✓');
    console.log('');
    console.log('🎉 The user can now:');
    console.log('  • Create shifts');
    console.log('  • Post job listings');
    console.log('  • Access all features');
    console.log('');
    console.log('💡 Tip: Reload the app to see the changes immediately.');
}

// Get email/user_id from command line argument
const emailOrUserId = process.argv[2];

if (!emailOrUserId) {
    console.log('📝 Usage:');
    console.log('  node scripts/verify-user.js <user_id>');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/verify-user.js 123e4567-e89b-12d3-a456-426614174000');
    console.log('');
    console.log('To get user_id:');
    console.log('  1. Go to Supabase Dashboard → Authentication → Users');
    console.log('  2. Find user by email');
    console.log('  3. Copy their UUID');
    console.log('');
    process.exit(1);
}

verifyUser(emailOrUserId);
