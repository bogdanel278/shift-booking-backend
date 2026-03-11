import * as readline from 'readline';
import axios from 'axios';

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
let authToken = '';

interface TestConfig {
  verificationMethod: 'passport' | 'visa' | 'share_code';
  passportNumber?: string;
  passportCountry?: string;
  passportExpiryDate?: string;
  visaType?: string;
  visaExpiryDate?: string;
  visaReference?: string;
  shareCode?: string;
  dateOfBirth?: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function autoRegisterTestUser(): Promise<void> {
  const timestamp = Date.now();
  const email = `sandbox.test.${timestamp}@vouchsafe-test.com`;
  const password = 'TestPass123!';

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register/worker`, {
      email,
      password,
      first_name: 'Sandbox',
      last_name: 'Tester',
    });

    const data = response.data as any;
    authToken = data.data.token;
    console.log('\n✅ Auto-registered test user');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}\n`);
  } catch (error: any) {
    throw new Error(`Failed to register test user: ${error.response?.data?.error || error.message}`);
  }
}

async function login(): Promise<void> {
  console.log('\n=== LOGIN ===\n');
  
  const email = await question('Email: ');
  const password = await question('Password: ');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password,
    });

    const data = response.data as any;
    authToken = data.data.token;
    console.log('\n✅ Login successful!');
    console.log(`👤 User: ${data.data.user.name} (${data.data.user.role})\n`);
  } catch (error: any) {
    console.error('\n❌ Login failed:', error.response?.data?.error || error.message);
    process.exit(1);
  }
}

async function promptVerificationDetails(): Promise<TestConfig> {
  console.log('\n=== RIGHT-TO-WORK VERIFICATION ===\n');
  console.log('Verification Methods:');
  console.log('1. Passport');
  console.log('2. Visa');
  console.log('3. Share Code\n');

  const methodChoice = await question('Select method (1-3): ');
  
  const config: TestConfig = {
    verificationMethod: 'passport'
  };

  if (methodChoice === '1') {
    config.verificationMethod = 'passport';
    console.log('\n--- Passport Details ---');
    config.passportNumber = await question('Passport Number: ');
    config.passportCountry = await question('Country Code (e.g., GBR, USA): ');
    config.passportExpiryDate = await question('Expiry Date (YYYY-MM-DD): ');
  } else if (methodChoice === '2') {
    config.verificationMethod = 'visa';
    console.log('\n--- Visa Details ---');
    config.visaType = await question('Visa Type (e.g., Tier 2, Student): ');
    config.visaExpiryDate = await question('Expiry Date (YYYY-MM-DD): ');
    config.visaReference = await question('Visa Reference (optional): ');
  } else if (methodChoice === '3') {
    config.verificationMethod = 'share_code';
    console.log('\n--- Share Code Details ---');
    console.log('\n💡 Sandbox Test Codes:');
    console.log('  PASS12345 - Will pass verification');
    console.log('  FAIL12345 - Will fail verification');
    console.log('  ERROR1234 - Will trigger an error\n');
    config.shareCode = await question('Share Code: ');
    config.dateOfBirth = await question('Date of Birth (YYYY-MM-DD): ');
  } else {
    throw new Error('Invalid method selection');
  }

  return config;
}

async function submitVerification(config: TestConfig): Promise<void> {
  console.log('\n=== SUBMITTING VERIFICATION ===\n');

  const payload: any = {
    verification_method: config.verificationMethod,
  };

  if (config.verificationMethod === 'passport') {
    payload.passport_number = config.passportNumber;
    payload.passport_country = config.passportCountry;
    payload.passport_expiry_date = config.passportExpiryDate;
  } else if (config.verificationMethod === 'visa') {
    payload.visa_type = config.visaType;
    payload.visa_expiry_date = config.visaExpiryDate;
    if (config.visaReference) {
      payload.visa_reference = config.visaReference;
    }
  } else if (config.verificationMethod === 'share_code') {
    payload.share_code = config.shareCode;
    payload.date_of_birth = config.dateOfBirth;
  }

  console.log('📤 Request Payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('');

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/workers/right-to-work/submit`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('✅ Verification Submitted Successfully!');

    const data = response.data as any;
    const verification = data.data;
    
    // Display result prominently
    console.log('\n================================================');
    if (verification.status === 'approved') {
      console.log('             ✅ RESULT: PASS');
    } else if (verification.status === 'rejected') {
      console.log('             ❌ RESULT: FAIL');
    } else if (verification.status === 'failed') {
      console.log('             ⚠️  RESULT: ERROR');
    } else if (verification.status === 'pending') {
      console.log('             ⏳ RESULT: PENDING');
    }
    console.log('================================================');

    console.log('\n📋 Details:');
    console.log(`  Status: ${verification.status}`);
    console.log(`  Method: ${verification.verification_method}`);
    if (verification.provider_name) {
      console.log(`  Provider: ${verification.provider_name}`);
    }
    if (verification.provider_reference) {
      console.log(`  Reference: ${verification.provider_reference}`);
    }
    if (verification.notes) {
      console.log(`  Notes: ${verification.notes}`);
    }
    console.log(`  Submitted: ${verification.submitted_at}`);
    
    // Show full response for debugging
    console.log('\n📊 Full Response:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error: any) {
    console.error('\n❌ Verification Failed!');
    console.error('\n📛 Error Details:');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Message: ${error.response.data?.error || error.message}`);
      console.error('\n  Full Response:');
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`  ${error.message}`);
    }
  }
}

async function checkStatus(): Promise<void> {
  console.log('\n=== CHECKING VERIFICATION STATUS ===\n');

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/workers/right-to-work/status`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      }
    );

    const data = response.data as any;
    console.log('📊 Current Status:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error('\n❌ Failed to check status');
    console.error(error.response?.data || error.message);
  }
}

async function main() {
  console.log('================================================');
  console.log('   RIGHT-TO-WORK VERIFICATION TEST SCRIPT');
  console.log('         Vouchsafe Sandbox Testing');
  console.log('================================================');

  try {
    // Step 1: Choose authentication method
    console.log('\n🔐 Authentication Options:\n');
    console.log('1. Auto-register new test user (quick)');
    console.log('2. Login with existing account\n');
    
    const authChoice = await question('Select option (1-2): ');
    
    if (authChoice === '1') {
      console.log('\n🔄 Auto-registering test user...');
      await autoRegisterTestUser();
    } else {
      await login();
    }

    // Step 2: Get verification details
    const config = await promptVerificationDetails();

    // Step 3: Submit verification
    await submitVerification(config);

    // Step 4: Check status
    const checkNow = await question('\nCheck status now? (y/n): ');
    if (checkNow.toLowerCase() === 'y') {
      await checkStatus();
    }

    console.log('\n✨ Test completed!\n');
  } catch (error: any) {
    console.error('\n💥 Test failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run the test
main().catch(console.error);
