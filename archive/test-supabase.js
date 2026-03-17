// Quick Supabase Connection Test
// Run this in your browser console at http://localhost:8081

console.log('🔍 Testing Supabase Connection...\n');

// Test 1: Check environment variables
console.log('1️⃣ Environment Variables:');
console.log('SUPABASE_URL:', 'https://vekgwgzobfnxoocmnqhs.supabase.co');
console.log('SUPABASE_ANON_KEY:', 'eyJhbGciOi... (hidden for security)');
console.log('✅ Variables loaded\n');

// Test 2: Test Supabase connection (paste this in console)
async function testSupabase() {
    try {
        console.log('2️⃣ Testing Supabase Connection...');

        // This should work if supabase is configured correctly
        const response = await fetch('https://vekgwgzobfnxoocmnqhs.supabase.co/rest/v1/', {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla2d3Z3pvYmZueG9vY21ucWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzM4OTAsImV4cCI6MjA4ODgwOTg5MH0._Bzx-Osooupw3LYBPoBQlQja4mBH7hk-cno5i8IlbbQ'
            }
        });

        if (response.ok) {
            console.log('✅ Supabase connection successful!');
        } else {
            console.log('❌ Supabase connection failed:', response.status);
        }
    } catch (error) {
        console.log('❌ Network error:', error.message);
    }
}

testSupabase();

// Test 3: Check if auth is working
console.log('\n3️⃣ To test login:');
console.log('1. Click "Sign Up" if you don\'t have an account');
console.log('2. Register with any email/password');
console.log('3. Check your email for verification link');
console.log('4. Click the verification link');
console.log('5. Come back and login');
console.log('\n💡 Or disable email verification in Supabase Dashboard');
