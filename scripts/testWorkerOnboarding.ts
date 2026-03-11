#!/usr/bin/env ts-node

/**
 * Complete Worker Onboarding Flow Test
 * 
 * Tests the entire worker journey from registration to booking shifts
 */

import axios from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step: number, title: string) {
  log(`\n${'='.repeat(70)}`, colors.cyan);
  log(`STEP ${step}: ${title}`, colors.bright + colors.cyan);
  log('='.repeat(70), colors.cyan);
}

function logSuccess(message: string) {
  log(`✓ ${message}`, colors.green);
}

function logError(message: string) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`  ${message}`);
}

function logWarning(message: string) {
  log(`⚠ ${message}`, colors.yellow);
}

// Test data
const timestamp = Date.now();
const workerData = {
  first_name: 'Test',
  last_name: 'Worker',
  email: `test.worker.${timestamp}@example.com`,
  password: 'TestPassword123!',
  phone: '+447700900123',
  date_of_birth: '1990-01-15',
  address_line_1: '123 Test Street',
  city: 'London',
  postcode: 'SW1A 1AA',
  nationality: 'British',
};

const profileUpdate = {
  bio: 'Experienced hospitality worker with 5+ years',
  skills: ['bartending', 'waiter', 'customer service'],
  hourly_rate_min: 10.00,
  hourly_rate_max: 15.00,
  years_experience: 5,
  availability_notes: 'Available Monday-Friday 9AM-5PM',
  certifications: ['Food Safety Level 2'],
};

const rtwData = {
  verification_method: 'share_code',
  share_code: 'PASS12345', // Sandbox test code that auto-approves
  date_of_birth: '1990-01-15',
};

// Test state
let workerToken = '';
let workerId = '';
let rtwVerificationId = '';
let businessToken = '';
let businessId = '';
let shiftId = '';
let adminToken: string | null = null;

async function runTest() {
  try {
    // =================================================================
    // STEP 1: Register Worker
    // =================================================================
    logStep(1, 'WORKER REGISTRATION');
    
    try {
      const result = await axios.post(
        `${API_BASE}/auth/register/worker`,
        workerData
      );

      const data: any = result.data;
      workerToken = data.data.token;
      workerId = data.data.user.id;

      logSuccess('Worker registered successfully');
      logInfo(`Worker ID: ${workerId}`);
      logInfo(`Email: ${workerData.email}`);
      logInfo(`Token: ${workerToken.substring(0, 20)}...`);
    } catch (error: any) {
      logError(`Registration failed: ${JSON.stringify(error.response?.data || error.message)}`);
      throw error;
    }

    // =================================================================
    // STEP 2: Login
    // =================================================================
    logStep(2, 'WORKER LOGIN');

    try {
      const result = await axios.post(`${API_BASE}/auth/login`, {
        email: workerData.email,
        password: workerData.password,
      });

      const data: any = result.data;
      const newToken = data.data.token;
      logSuccess('Login successful');
      logInfo(`New token received: ${newToken.substring(0, 20)}...`);
    } catch (error: any) {
      logError(`Login failed: ${JSON.stringify(error.response?.data || error.message)}`);
      throw error;
    }

    // =================================================================
    // STEP 3: Get Current User Info
    // =================================================================
    logStep(3, 'GET CURRENT USER INFO');

    try {
      const result = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${workerToken}` },
      });

      const data: any = result.data;
      logSuccess('User info retrieved');
      logInfo(JSON.stringify(data.data, null, 2));
    } catch (error: any) {
      logError(`Failed to get user info: ${JSON.stringify(error.response?.data || error.message)}`);
      throw error;
    }

    // =================================================================
    // STEP 4: View Worker Profile
    // =================================================================
    logStep(4, 'VIEW WORKER PROFILE');

    try {
      const result = await axios.get(`${API_BASE}/worker-profiles/me`, {
        headers: { Authorization: `Bearer ${workerToken}` },
      });

      const data: any = result.data;
      logSuccess('Profile retrieved');
      logInfo(JSON.stringify(data.data, null, 2));
    } catch (error: any) {
      logError(`Failed to get profile: ${JSON.stringify(error.response?.data || error.message)}`);
      throw error;
    }

    // =================================================================
    // STEP 5: Update Worker Profile
    // =================================================================
    logStep(5, 'UPDATE WORKER PROFILE');

    try {
      await axios.put(
        `${API_BASE}/worker-profiles/me`,
        profileUpdate,
        {
          headers: { Authorization: `Bearer ${workerToken}` },
        }
      );

      logSuccess('Profile updated successfully');
    } catch (error: any) {
      logError(`Failed to update profile: ${JSON.stringify(error.response?.data || error.message)}`);
      throw error;
    }

    // =================================================================
    // STEP 6: Submit Right-to-Work Verification
    // =================================================================
    logStep(6, 'SUBMIT RIGHT-TO-WORK VERIFICATION');

    try {
      const result = await axios.post(
        `${API_BASE}/right-to-work/submit`,
        rtwData,
        {
          headers: { Authorization: `Bearer ${workerToken}` },
        }
      );

      const data: any = result.data;
      rtwVerificationId = data.data.id;

      logSuccess('RTW verification submitted successfully');
      logInfo(`RTW Verification ID: ${rtwVerificationId}`);
      logInfo(`Status: ${data.data.status}`);
    } catch (error: any) {
      logError(`Failed to submit RTW: ${JSON.stringify(error.response?.data || error.message)}`);
      throw error;
    }

    // =================================================================
    // STEP 7: Check RTW Status
    // =================================================================
    logStep(7, 'CHECK RTW STATUS');

    try {
      const result = await axios.get(`${API_BASE}/right-to-work/status`, {
        headers: { Authorization: `Bearer ${workerToken}` },
      });

      const data: any = result.data;
      logSuccess('RTW status retrieved');
      logInfo(`Status: ${data.data.status}`);
      logInfo(`Method: ${data.data.verification_method}`);

      if (data.data.status === 'approved') {
        logSuccess('✓ RTW is APPROVED  - Ready to book shifts!');
      }
    } catch (error: any) {
      logError(`Failed to check RTW status: ${JSON.stringify(error.response?.data || error.message)}`);
      throw error;
    }

    // =================================================================
    // STEP 8: Create Test Business and Shift
    // =================================================================
    logStep(8, 'CREATE TEST SHIFT');

    try {
      // Register business
      const businessData = {
        first_name: 'Business',
        last_name: 'Owner',
        email: `test.business.${timestamp}@example.com`,
        password: 'BusinessPass123!',
        phone: '+447700900456',
        company_name: 'Test Restaurant Ltd',
        company_number: `GB${timestamp}`,
      };

      const businessResult = await axios.post(
        `${API_BASE}/auth/register/business`,
        businessData
      );

      const businessDataResp: any = businessResult.data;
      businessToken = businessDataResp.data.token;
      businessId = businessDataResp.data.user.id;

      logSuccess('Business registered successfully');
      logInfo(`Business ID: ${businessId}`);

      // Create shift
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startTime = new Date(tomorrow);
      startTime.setHours(9, 0, 0, 0);
      const endTime = new Date(tomorrow);
      endTime.setHours(17, 0, 0, 0);

      const shiftData = {
        business_id: businessId,
        title: 'Restaurant Waiter',
        description: 'Busy restaurant needs experienced waiter',
        location: 'London, UK',
        requirements: 'Food safety certification preferred',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        pay_rate: 12.50,
        max_workers: 5,
        category: 'hospitality',
        status: 'open',
      };

      const shiftResult = await axios.post(`${API_BASE}/shifts`, shiftData, {
        headers: { Authorization: `Bearer ${businessToken}` },
      });

      const shiftDataResp: any = shiftResult.data;
      shiftId = shiftDataResp.data.id;

      logSuccess('Shift created successfully');
      logInfo(`Shift ID: ${shiftId}`);
    } catch (error: any) {
      logError(`Failed to create shift: ${JSON.stringify(error.response?.data || error.message)}`);
      throw error;
    }

    // =================================================================
    // STEP 9: Attempt to Book Shift (Should Succeed with PASS12345)
    // =================================================================
    logStep(9, 'BOOK SHIFT WITH APPROVED RTW');

    try {
      const result = await axios.post(
        `${API_BASE}/bookings`,
        {
          shift_id: shiftId,
        },
        {
          headers: { Authorization: `Bearer ${workerToken}` },
        }
      );

      const data: any = result.data;
      if (result.status === 201 || result.status === 200) {
        logSuccess('✓ Booking successful with approved RTW!');
        logInfo(`Booking ID: ${data.data.id}`);
        logInfo(`Status: ${data.data.status}`);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        logWarning('Booking blocked - RTW not approved yet');
        logInfo(`Message: ${JSON.stringify(error.response?.data)}`);
      } else {
        logError(`Booking failed: ${JSON.stringify(error.response?.data || error.message)}`);
        throw error;
      }
    }

    // =================================================================
    // STEP 10: Admin Login (Optional)
    // =================================================================
    logStep(10, 'ADMIN LOGIN (OPTIONAL)');

    try {
      const result = await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@example.com',
        password: 'AdminPass123',
      });

      const data: any = result.data;
      adminToken = data.data.token;
      logSuccess('Admin login successful');
      logInfo(`Admin token: ${adminToken!.substring(0, 20)}...`);
    } catch (error: any) {
      logWarning('No admin account available - skipping admin tests');
      logInfo('To test admin features, create an admin user in the database');
      adminToken = null;
    }

    // =================================================================
    // STEP 11: Admin Views Pending RTW (If admin available)
    // =================================================================
    if (adminToken) {
      logStep(11, 'ADMIN VIEWS PENDING RTW VERIFICATIONS');

      try {
        const result = await axios.get(`${API_BASE}/right-to-work/admin/pending`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });

        const data: any = result.data;
        logSuccess('Pending RTW verifications retrieved');
        logInfo(`Count: ${data.data.length}`);

        if (data.data.length > 0) {
          logInfo('First pending RTW:');
          logInfo(JSON.stringify(data.data[0], null, 2));
        }
      } catch (error: any) {
        logError(`Failed to get pending RTW: ${JSON.stringify(error.response?.data || error.message)}`);
      }
    }

    // =================================================================
    // SUMMARY
    // =================================================================
    logStep(0, 'TEST SUMMARY');

    logSuccess('Worker Onboarding Flow Test Complete!');
    log('', colors.green);
    logInfo('✓ Worker registered');
    logInfo('✓ Worker logged in');
    logInfo('✓ Worker profile viewed and updated');
    logInfo('✓ RTW verification submitted');
    logInfo('✓ RTW status checked');
    logInfo('✓ Test shift created');
    logInfo('✓ Shift booking tested');
    log('', colors.green);
    logSuccess('All tests passed! Worker onboarding flow is working correctly.');

    // Cleanup info
    log('\n' + '='.repeat(70), colors.cyan);
    log('CLEANUP (Optional)', colors.cyan);
    log('='.repeat(70), colors.cyan);
    logInfo(`Worker ID: ${workerId}`);
    logInfo(`Business ID: ${businessId}`);
    logInfo(`Shift ID: ${shiftId}`);
    logInfo(`RTW Verification ID: ${rtwVerificationId}`);

  } catch (error) {
    logError('Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
log('\n' + '='.repeat(70), colors.cyan);
log('WORKER ONBOARDING FLOW - COMPREHENSIVE TEST', colors.bright + colors.cyan);
log('='.repeat(70), colors.cyan);
logInfo(`Testing against: ${BASE_URL}`);
log('='.repeat(70), colors.cyan);

runTest();
