#!/usr/bin/env node

/**
 * Shift Marketplace Features Test
 * 
 * Tests the core marketplace features:
 * - Business creating shifts
 * - Listing available shifts
 * - Shift details
 * - Worker booking shifts
 * - Worker viewing bookings
 * - Business viewing shift bookings
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${'='.repeat(70)}`, 'cyan');
  log(`STEP ${step}: ${message}`, 'cyan');
  log('='.repeat(70), 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`  ${message}`, 'blue');
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return { success: true, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: error.status };
  }
}

async function runTests() {
  log('\n🚀 SHIFT MARKETPLACE FEATURES TEST', 'yellow');
  log('Testing all core marketplace features\n', 'yellow');

  const testData = {
    businessEmail: `business-${Date.now()}@test.com`,
    workerEmail: `worker-${Date.now()}@test.com`,
    password: 'TestPass123!'
  };

  try {
    // ========================================================================
    // STEP 1: Register Business Account
    // ========================================================================
    logStep(1, 'REGISTER BUSINESS ACCOUNT');
    
    const businessRegister = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        first_name: 'Test',
        last_name: 'Business',
        email: testData.businessEmail,
        password: testData.password,
        company_name: 'Test Business Corp',
        role: 'business'
      })
    });

    if (!businessRegister.success) {
      logError(`Business registration failed: ${businessRegister.error}`);
      process.exit(1);
    }

    testData.businessToken = businessRegister.data.data.token;
    testData.businessId = businessRegister.data.data.user.id;
    
    logSuccess('Business account registered');
    logInfo(`Business ID: ${testData.businessId}`);
    logInfo(`Email: ${testData.businessEmail}`);

    // ========================================================================
    // STEP 2: Register Worker Account
    // ========================================================================
    logStep(2, 'REGISTER WORKER ACCOUNT');
    
    const workerRegister = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        first_name: 'Test',
        last_name: 'Worker',
        email: testData.workerEmail,
        password: testData.password,
        role: 'worker'
      })
    });

    if (!workerRegister.success) {
      logError(`Worker registration failed: ${workerRegister.error}`);
      process.exit(1);
    }

    testData.workerToken = workerRegister.data.data.token;
    testData.workerId = workerRegister.data.data.user.id;
    
    logSuccess('Worker account registered');
    logInfo(`Worker ID: ${testData.workerId}`);
    logInfo(`Email: ${testData.workerEmail}`);

    // ========================================================================
    // STEP 3: Submit RTW Verification
    // ========================================================================
    logStep(3, 'SUBMIT RTW VERIFICATION');
    
    const rtwSubmit = await apiRequest('/right-to-work/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testData.workerToken}`
      },
      body: JSON.stringify({
        verification_method: 'share_code',
        share_code: 'PASS12345',
        date_of_birth: '1990-01-01'
      })
    });

    if (!rtwSubmit.success) {
      logError(`RTW verification failed: ${rtwSubmit.error}`);
      process.exit(1);
    }

    const rtwStatus = rtwSubmit.data.data.status;
    logSuccess(`RTW verification submitted - Status: ${rtwStatus}`);

    if (rtwStatus !== 'approved') {
      logError('RTW verification not approved - cannot continue');
      process.exit(1);
    }

    // ========================================================================
    // STEP 4: Business Creates Shift
    // ========================================================================
    logStep(4, 'BUSINESS CREATES SHIFT');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const endDate = new Date(futureDate);
    endDate.setHours(endDate.getHours() + 8);

    const createShift = await apiRequest('/shifts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testData.businessToken}`
      },
      body: JSON.stringify({
        title: 'Warehouse Worker - Test Shift',
        description: 'Test shift for marketplace features',
        location: '123 Test Street, London',
        requirements: 'No experience required',
        start_time: futureDate.toISOString(),
        end_time: endDate.toISOString(),
        pay_rate: 15.50,
        max_workers: 3,
        category: 'warehouse'
      })
    });

    if (!createShift.success) {
      logError(`Shift creation failed: ${createShift.error}`);
      process.exit(1);
    }

    testData.shiftId = createShift.data.data.id;
    
    logSuccess('Shift created successfully');
    logInfo(`Shift ID: ${testData.shiftId}`);
    logInfo(`Title: ${createShift.data.data.title}`);
    logInfo(`Pay Rate: £${createShift.data.data.pay_rate}/hour`);
    logInfo(`Max Workers: ${createShift.data.data.max_workers}`);
    logInfo(`Status: ${createShift.data.data.status}`);

    // ========================================================================
    // STEP 5: Verify Worker Cannot Create Shifts
    // ========================================================================
    logStep(5, 'VERIFY WORKER CANNOT CREATE SHIFTS');
    
    const workerCreateShift = await apiRequest('/shifts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testData.workerToken}`
      },
      body: JSON.stringify({
        title: 'Should Fail',
        location: 'Test',
        start_time: futureDate.toISOString(),
        end_time: endDate.toISOString(),
        pay_rate: 15
      })
    });

    if (workerCreateShift.success) {
      logError('Worker was able to create shift - SECURITY ISSUE!');
      process.exit(1);
    }

    logSuccess('Worker correctly denied from creating shift');
    logInfo(`Error: ${workerCreateShift.error}`);

    // ========================================================================
    // STEP 6: List Available Shifts
    // ========================================================================
    logStep(6, 'LIST AVAILABLE SHIFTS');
    
    const listShifts = await apiRequest('/shifts?available=true', {
      method: 'GET'
    });

    if (!listShifts.success) {
      logError(`Failed to list shifts: ${listShifts.error}`);
      process.exit(1);
    }

    const shiftsCount = listShifts.data.count;
    logSuccess(`Found ${shiftsCount} available shift(s)`);
    
    const foundOurShift = listShifts.data.data.some(s => s.id === testData.shiftId);
    if (foundOurShift) {
      logSuccess('Our test shift appears in available shifts');
    } else {
      logError('Our test shift NOT found in available shifts');
    }

    // ========================================================================
    // STEP 7: Get Shift Details
    // ========================================================================
    logStep(7, 'GET SHIFT DETAILS');
    
    const shiftDetails = await apiRequest(`/shifts/${testData.shiftId}`, {
      method: 'GET'
    });

    if (!shiftDetails.success) {
      logError(`Failed to get shift details: ${shiftDetails.error}`);
      process.exit(1);
    }

    logSuccess('Shift details retrieved');
    logInfo(`Title: ${shiftDetails.data.data.title}`);
    logInfo(`Location: ${shiftDetails.data.data.location}`);
    logInfo(`Description: ${shiftDetails.data.data.description}`);
    logInfo(`Requirements: ${shiftDetails.data.data.requirements}`);

    // ========================================================================
    // STEP 8: Worker Books Shift
    // ========================================================================
    logStep(8, 'WORKER BOOKS SHIFT');
    
    const bookShift = await apiRequest('/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testData.workerToken}`
      },
      body: JSON.stringify({
        shift_id: testData.shiftId
      })
    });

    if (!bookShift.success) {
      logError(`Shift booking failed: ${bookShift.error}`);
      process.exit(1);
    }

    testData.bookingId = bookShift.data.data.id;
    
    logSuccess('Shift booked successfully');
    logInfo(`Booking ID: ${testData.bookingId}`);
    logInfo(`Status: ${bookShift.data.data.status}`);

    // ========================================================================
    // STEP 9: Verify Business Cannot Book Shifts
    // ========================================================================
    logStep(9, 'VERIFY BUSINESS CANNOT BOOK SHIFTS');
    
    const businessBookShift = await apiRequest('/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testData.businessToken}`
      },
      body: JSON.stringify({
        shift_id: testData.shiftId
      })
    });

    if (businessBookShift.success) {
      logError('Business was able to book shift - SECURITY ISSUE!');
      process.exit(1);
    }

    logSuccess('Business correctly denied from booking shift');
    logInfo(`Error: ${businessBookShift.error}`);

    // ========================================================================
    // STEP 10: Verify Duplicate Booking Prevention
    // ========================================================================
    logStep(10, 'VERIFY DUPLICATE BOOKING PREVENTION');
    
    const duplicateBooking = await apiRequest('/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testData.workerToken}`
      },
      body: JSON.stringify({
        shift_id: testData.shiftId
      })
    });

    if (duplicateBooking.success) {
      logError('Duplicate booking was allowed - BUG!');
      process.exit(1);
    }

    logSuccess('Duplicate booking correctly prevented');
    logInfo(`Error: ${duplicateBooking.error}`);

    // ========================================================================
    // STEP 11: Worker Views Their Bookings
    // ========================================================================
    logStep(11, 'WORKER VIEWS THEIR BOOKINGS');
    
    const myBookings = await apiRequest('/bookings/my-bookings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testData.workerToken}`
      }
    });

    if (!myBookings.success) {
      logError(`Failed to get worker bookings: ${myBookings.error}`);
      process.exit(1);
    }

    const bookingsCount = myBookings.data.count;
    logSuccess(`Worker has ${bookingsCount} booking(s)`);
    
    if (bookingsCount > 0) {
      const booking = myBookings.data.data[0];
      logInfo(`Booking ID: ${booking.id}`);
      logInfo(`Shift: ${booking.shift_title}`);
      logInfo(`Location: ${booking.shift_location}`);
      logInfo(`Pay Rate: £${booking.shift_pay_rate}/hour`);
      logInfo(`Status: ${booking.status}`);
    }

    // ========================================================================
    // STEP 12: Business Views Shift Bookings
    // ========================================================================
    logStep(12, 'BUSINESS VIEWS SHIFT BOOKINGS');
    
    const shiftBookings = await apiRequest(`/bookings/shift/${testData.shiftId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testData.businessToken}`
      }
    });

    if (!shiftBookings.success) {
      logError(`Failed to get shift bookings: ${shiftBookings.error}`);
      process.exit(1);
    }

    const applicantsCount = shiftBookings.data.count;
    logSuccess(`Shift has ${applicantsCount} applicant(s)`);
    
    if (applicantsCount > 0) {
      const applicant = shiftBookings.data.data[0];
      logInfo(`Applicant: ${applicant.worker_name}`);
      logInfo(`Email: ${applicant.worker_email}`);
      logInfo(`Status: ${applicant.status}`);
    }

    // ========================================================================
    // STEP 13: Business Confirms Booking
    // ========================================================================
    logStep(13, 'BUSINESS CONFIRMS BOOKING');
    
    const confirmBooking = await apiRequest(`/bookings/${testData.bookingId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${testData.businessToken}`
      },
      body: JSON.stringify({
        status: 'confirmed'
      })
    });

    if (!confirmBooking.success) {
      logError(`Failed to confirm booking: ${confirmBooking.error}`);
      process.exit(1);
    }

    logSuccess('Booking confirmed by business');
    logInfo(`New Status: ${confirmBooking.data.data.status}`);
    logInfo(`Confirmed At: ${confirmBooking.data.data.confirmed_at}`);

    // ========================================================================
    // STEP 14: Test Cancelled Shift Cannot Be Booked
    // ========================================================================
    logStep(14, 'TEST CANCELLED SHIFT CANNOT BE BOOKED');
    
    // Create a new shift
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 14);
    const endDate2 = new Date(futureDate2);
    endDate2.setHours(endDate2.getHours() + 8);

    const createShift2 = await apiRequest('/shifts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testData.businessToken}`
      },
      body: JSON.stringify({
        title: 'Test Cancelled Shift',
        location: 'Test Location',
        start_time: futureDate2.toISOString(),
        end_time: endDate2.toISOString(),
        pay_rate: 15
      })
    });

    if (!createShift2.success) {
      logError(`Failed to create second shift: ${createShift2.error}`);
      process.exit(1);
    }

    const shift2Id = createShift2.data.data.id;
    logInfo(`Created shift ${shift2Id}`);

    // Cancel the shift
    const cancelShift = await apiRequest(`/shifts/${shift2Id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${testData.businessToken}`
      },
      body: JSON.stringify({
        status: 'cancelled'
      })
    });

    if (!cancelShift.success) {
      logError(`Failed to cancel shift: ${cancelShift.error}`);
      process.exit(1);
    }

    logInfo('Shift cancelled');

    // Try to book the cancelled shift
    const bookCancelled = await apiRequest('/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testData.workerToken}`
      },
      body: JSON.stringify({
        shift_id: shift2Id
      })
    });

    if (bookCancelled.success) {
      logError('Cancelled shift was bookable - BUG!');
      process.exit(1);
    }

    logSuccess('Cancelled shift correctly cannot be booked');
    logInfo(`Error: ${bookCancelled.error}`);

    // ========================================================================
    // STEP 15: Worker Cancels Booking
    // ========================================================================
    logStep(15, 'WORKER CANCELS BOOKING');
    
    const cancelBooking = await apiRequest(`/bookings/${testData.bookingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${testData.workerToken}`
      }
    });

    if (!cancelBooking.success) {
      logError(`Failed to cancel booking: ${cancelBooking.error}`);
      process.exit(1);
    }

    logSuccess('Booking cancelled successfully');
    logInfo(cancelBooking.data.message);

    // ========================================================================
    // SUMMARY
    // ========================================================================
    log('\n' + '='.repeat(70), 'cyan');
    log('TEST SUMMARY', 'cyan');
    log('='.repeat(70), 'cyan');
    
    logSuccess('All marketplace features working correctly!');
    log('');
    log('✓ Business can create shifts', 'green');
    log('✓ Available shifts can be listed', 'green');
    log('✓ Shift details can be retrieved', 'green');
    log('✓ Worker (with RTW) can book shifts', 'green');
    log('✓ Worker can view their bookings', 'green');
    log('✓ Business can view shift bookings', 'green');
    log('✓ Business can confirm bookings', 'green');
    log('✓ Duplicate bookings are prevented', 'green');
    log('✓ Cancelled shifts cannot be booked', 'green');
    log('✓ Role-based access control enforced', 'green');
    log('');
    
    log('🎉 All tests passed!', 'yellow');
    log('');

  } catch (error) {
    logError(`\nTest failed with error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests();
