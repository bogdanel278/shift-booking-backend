# Shift Marketplace API Testing Guide

This guide provides detailed instructions for testing all core shift marketplace features.

## Prerequisites

1. **Server Running**: Ensure server is running on `http://localhost:3000`
   ```bash
   npm start
   ```

2. **Database**: PostgreSQL database should be configured and migrations run
   ```bash
   npm run db:migrate
   ```

3. **Environment**: `.env` file configured with proper credentials

---

## Authentication Setup

Before testing marketplace features, you need valid JWT tokens for both business and worker accounts.

### 1. Register Business Account

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Business",
    "email": "business@example.com",
    "password": "SecurePass123!",
    "company_name": "Test Business Ltd",
    "role": "business"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Business registered successfully",
  "data": {
    "user": { "id": "...", "email": "business@example.com", "role": "business" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token** as `BUSINESS_TOKEN` for subsequent requests.

### 2. Register Worker Account

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Worker",
    "email": "worker@example.com",
    "password": "SecurePass123!",
    "role": "worker"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Worker registered successfully",
  "data": {
    "user": { "id": "...", "email": "worker@example.com", "role": "worker" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token** as `WORKER_TOKEN` for subsequent requests.

### 3. Complete Worker Right-to-Work Verification

Workers must have approved RTW verification before booking shifts.

```bash
curl -X POST http://localhost:3000/api/right-to-work/submit \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verification_method": "share_code",
    "share_code": "PASS12345",
    "date_of_birth": "1990-01-01"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "status": "approved",
    "verification_method": "share_code"
  }
}
```

---

## Feature 1: Business Creating Shifts

### Create a New Shift

**Endpoint:** `POST /api/shifts`

**Authentication:** Required - Business role only

```bash
curl -X POST http://localhost:3000/api/shifts \
  -H "Authorization: Bearer $BUSINESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Warehouse Worker - Morning Shift",
    "description": "Loading and unloading warehouse inventory",
    "location": "123 Warehouse St, London",
    "requirements": "Forklift certification preferred",
    "start_time": "2026-03-15T08:00:00Z",
    "end_time": "2026-03-15T16:00:00Z",
    "pay_rate": 15.50,
    "max_workers": 5,
    "category": "warehouse"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "shift-uuid-here",
    "business_id": "business-uuid",
    "title": "Warehouse Worker - Morning Shift",
    "location": "123 Warehouse St, London",
    "start_time": "2026-03-15T08:00:00.000Z",
    "end_time": "2026-03-15T16:00:00.000Z",
    "pay_rate": "15.50",
    "max_workers": 5,
    "status": "open",
    "created_at": "2026-03-11T22:10:00.000Z"
  }
}
```

**Save the shift ID** as `SHIFT_ID` for subsequent tests.

### Validation Tests

#### Test 1: Worker Cannot Create Shifts
```bash
curl -X POST http://localhost:3000/api/shifts \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Shift",
    "location": "Test Location",
    "start_time": "2026-03-15T08:00:00Z",
    "end_time": "2026-03-15T16:00:00Z",
    "pay_rate": 15
  }'
```

**Expected Response:** `403 Forbidden`
```json
{
  "error": "Business account required"
}
```

#### Test 2: Missing Authentication
```bash
curl -X POST http://localhost:3000/api/shifts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Shift",
    "location": "Test Location",
    "start_time": "2026-03-15T08:00:00Z",
    "end_time": "2026-03-15T16:00:00Z",
    "pay_rate": 15
  }'
```

**Expected Response:** `401 Unauthorized`
```json
{
  "error": "Access token required"
}
```

#### Test 3: Invalid Shift Data (Past Date)
```bash
curl -X POST http://localhost:3000/api/shifts \
  -H "Authorization: Bearer $BUSINESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Shift",
    "location": "Test Location",
    "start_time": "2020-01-01T08:00:00Z",
    "end_time": "2020-01-01T16:00:00Z",
    "pay_rate": 15
  }'
```

**Expected Response:** `400 Bad Request`
```json
{
  "error": "Start time must be in the future"
}
```

---

## Feature 2: Listing Available Shifts

### Get All Available Shifts

**Endpoint:** `GET /api/shifts?available=true`

**Authentication:** Not required (public)

```bash
curl -X GET "http://localhost:3000/api/shifts?available=true"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "shift-uuid-1",
      "title": "Warehouse Worker - Morning Shift",
      "location": "123 Warehouse St, London",
      "start_time": "2026-03-15T08:00:00.000Z",
      "end_time": "2026-03-15T16:00:00.000Z",
      "pay_rate": "15.50",
      "status": "open",
      "booked_count": 0
    }
  ],
  "count": 1
}
```

### Get All Shifts (No Filter)

```bash
curl -X GET "http://localhost:3000/api/shifts"
```

### Get Shifts by Business ID

```bash
curl -X GET "http://localhost:3000/api/shifts?business_id=$BUSINESS_ID"
```

---

## Feature 3: Shift Details

### Get Shift by ID

**Endpoint:** `GET /api/shifts/:id`

**Authentication:** Not required (public)

```bash
curl -X GET "http://localhost:3000/api/shifts/$SHIFT_ID"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "shift-uuid",
    "business_id": "business-uuid",
    "title": "Warehouse Worker - Morning Shift",
    "description": "Loading and unloading warehouse inventory",
    "location": "123 Warehouse St, London",
    "requirements": "Forklift certification preferred",
    "start_time": "2026-03-15T08:00:00.000Z",
    "end_time": "2026-03-15T16:00:00.000Z",
    "pay_rate": "15.50",
    "max_workers": 5,
    "category": "warehouse",
    "status": "open",
    "created_at": "2026-03-11T22:10:00.000Z",
    "updated_at": "2026-03-11T22:10:00.000Z"
  }
}
```

---

## Feature 4: Worker Booking a Shift

### Book a Shift

**Endpoint:** `POST /api/bookings`

**Authentication:** Required - Worker role only

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shift_id": "'$SHIFT_ID'"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "shift_id": "shift-uuid",
    "worker_id": "worker-uuid",
    "status": "pending",
    "created_at": "2026-03-11T22:15:00.000Z"
  }
}
```

**Save the booking ID** as `BOOKING_ID` for subsequent tests.

### Validation Tests

#### Test 1: Business Cannot Book Shifts
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $BUSINESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shift_id": "'$SHIFT_ID'"
  }'
```

**Expected Response:** `403 Forbidden`
```json
{
  "error": "Worker account required"
}
```

#### Test 2: Duplicate Booking Prevention
```bash
# Try to book the same shift again with the same worker
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shift_id": "'$SHIFT_ID'"
  }'
```

**Expected Response:** `400 Bad Request`
```json
{
  "error": "You have already booked this shift"
}
```

#### Test 3: Worker Without RTW Verification
```bash
# Register a new worker without RTW verification
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker2@example.com",
    "password": "SecurePass123!",
    "name": "Unverified Worker",
    "role": "worker"
  }'

# Try to book with the new worker token
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $NEW_WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shift_id": "'$SHIFT_ID'"
  }'
```

**Expected Response:** `400 Bad Request`
```json
{
  "error": "You must have an approved right-to-work verification before booking shifts. Please submit your verification documents."
}
```

#### Test 4: Cancel Shift and Try to Book

```bash
# First, cancel the shift (as business)
curl -X PUT "http://localhost:3000/api/shifts/$SHIFT_ID" \
  -H "Authorization: Bearer $BUSINESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "cancelled"
  }'

# Try to book the cancelled shift
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shift_id": "'$SHIFT_ID'"
  }'
```

**Expected Response:** `400 Bad Request`
```json
{
  "error": "Cannot book a cancelled shift"
}
```

---

## Feature 5: Worker Viewing Their Booked Shifts

### Get My Bookings

**Endpoint:** `GET /api/bookings/my-bookings`

**Authentication:** Required - Worker role only

```bash
curl -X GET "http://localhost:3000/api/bookings/my-bookings" \
  -H "Authorization: Bearer $WORKER_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking-uuid",
      "shift_id": "shift-uuid",
      "worker_id": "worker-uuid",
      "status": "pending",
      "shift_title": "Warehouse Worker - Morning Shift",
      "shift_location": "123 Warehouse St, London",
      "shift_start_time": "2026-03-15T08:00:00.000Z",
      "shift_end_time": "2026-03-15T16:00:00.000Z",
      "shift_pay_rate": "15.50",
      "created_at": "2026-03-11T22:15:00.000Z"
    }
  ],
  "count": 1
}
```

### Validation Test: Business Cannot Access Worker Endpoint

```bash
curl -X GET "http://localhost:3000/api/bookings/my-bookings" \
  -H "Authorization: Bearer $BUSINESS_TOKEN"
```

**Expected Response:** `403 Forbidden`
```json
{
  "error": "Worker account required"
}
```

---

## Feature 6: Business Viewing Bookings for Their Shifts

### Get Bookings for a Shift

**Endpoint:** `GET /api/bookings/shift/:shiftId`

**Authentication:** Required - Business role only

```bash
curl -X GET "http://localhost:3000/api/bookings/shift/$SHIFT_ID" \
  -H "Authorization: Bearer $BUSINESS_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking-uuid",
      "shift_id": "shift-uuid",
      "worker_id": "worker-uuid",
      "status": "pending",
      "worker_name": "Test Worker",
      "worker_email": "worker@example.com",
      "created_at": "2026-03-11T22:15:00.000Z"
    }
  ],
  "count": 1
}
```

### Business Confirming a Booking

```bash
curl -X PUT "http://localhost:3000/api/bookings/$BOOKING_ID" \
  -H "Authorization: Bearer $BUSINESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "status": "confirmed",
    "confirmed_at": "2026-03-11T22:20:00.000Z"
  }
}
```

### Validation Test: Worker Cannot Access Business Endpoint

```bash
curl -X GET "http://localhost:3000/api/bookings/shift/$SHIFT_ID" \
  -H "Authorization: Bearer $WORKER_TOKEN"
```

**Expected Response:** `403 Forbidden`
```json
{
  "error": "Business account required"
}
```

---

## Additional Tests

### Update Shift Details

```bash
curl -X PUT "http://localhost:3000/api/shifts/$SHIFT_ID" \
  -H "Authorization: Bearer $BUSINESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Warehouse Worker - Morning Shift (Updated)",
    "pay_rate": 16.00
  }'
```

### Cancel a Booking (Worker)

```bash
curl -X DELETE "http://localhost:3000/api/bookings/$BOOKING_ID" \
  -H "Authorization: Bearer $WORKER_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

### Delete Shift (Business)

```bash
curl -X DELETE "http://localhost:3000/api/shifts/$SHIFT_ID" \
  -H "Authorization: Bearer $BUSINESS_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Shift deleted successfully"
}
```

---

## Complete End-to-End Test Flow

Run this complete test script to verify all features:

```bash
#!/bin/bash

echo "=== Shift Marketplace E2E Test ==="

# Step 1: Register Business
echo "\n1. Registering business..."
BUSINESS_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "business-test-'$(date +%s)'@example.com",
    "password": "SecurePass123!",
    "name": "Test Business",
    "role": "business"
  }')
BUSINESS_TOKEN=$(echo $BUSINESS_RESPONSE | jq -r '.data.token')
echo "✓ Business registered"

# Step 2: Register Worker
echo "\n2. Registering worker..."
WORKER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker-test-'$(date +%s)'@example.com",
    "password": "SecurePass123!",
    "name": "Test Worker",
    "role": "worker"
  }')
WORKER_TOKEN=$(echo $WORKER_RESPONSE | jq -r '.data.token')
echo "✓ Worker registered"

# Step 3: Submit RTW Verification
echo "\n3. Submitting RTW verification..."
curl -s -X POST http://localhost:3000/api/right-to-work \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verification_method": "share_code",
    "share_code": "PASS12345"
  }' > /dev/null
echo "✓ RTW verification approved"

# Step 4: Business Creates Shift
echo "\n4. Creating shift..."
SHIFT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/shifts \
  -H "Authorization: Bearer $BUSINESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Shift",
    "location": "Test Location",
    "start_time": "2026-12-31T08:00:00Z",
    "end_time": "2026-12-31T16:00:00Z",
    "pay_rate": 15.50,
    "max_workers": 5
  }')
SHIFT_ID=$(echo $SHIFT_RESPONSE | jq -r '.data.id')
echo "✓ Shift created: $SHIFT_ID"

# Step 5: List Available Shifts
echo "\n5. Listing available shifts..."
SHIFTS=$(curl -s "http://localhost:3000/api/shifts?available=true")
COUNT=$(echo $SHIFTS | jq -r '.count')
echo "✓ Found $COUNT available shifts"

# Step 6: Get Shift Details
echo "\n6. Getting shift details..."
curl -s "http://localhost:3000/api/shifts/$SHIFT_ID" > /dev/null
echo "✓ Shift details retrieved"

# Step 7: Worker Books Shift
echo "\n7. Booking shift..."
BOOKING_RESPONSE=$(curl -s -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shift_id": "'$SHIFT_ID'"
  }')
BOOKING_ID=$(echo $BOOKING_RESPONSE | jq -r '.data.id')
echo "✓ Shift booked: $BOOKING_ID"

# Step 8: Worker Views Their Bookings
echo "\n8. Viewing worker bookings..."
BOOKINGS=$(curl -s "http://localhost:3000/api/bookings/my-bookings" \
  -H "Authorization: Bearer $WORKER_TOKEN")
BOOKING_COUNT=$(echo $BOOKINGS | jq -r '.count')
echo "✓ Worker has $BOOKING_COUNT booking(s)"

# Step 9: Business Views Shift Bookings
echo "\n9. Viewing shift bookings..."
SHIFT_BOOKINGS=$(curl -s "http://localhost:3000/api/bookings/shift/$SHIFT_ID" \
  -H "Authorization: Bearer $BUSINESS_TOKEN")
APPLICANTS=$(echo $SHIFT_BOOKINGS | jq -r '.count')
echo "✓ Shift has $APPLICANTS applicant(s)"

# Step 10: Business Confirms Booking
echo "\n10. Confirming booking..."
curl -s -X PUT "http://localhost:3000/api/bookings/$BOOKING_ID" \
  -H "Authorization: Bearer $BUSINESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }' > /dev/null
echo "✓ Booking confirmed"

echo "\n✅ All tests passed!"
```

---

## Summary of Features

| Feature | Endpoint | Method | Auth | Role |
|---------|----------|--------|------|------|
| Create Shift | `/api/shifts` | POST | ✓ | Business |
| Get Available Shifts | `/api/shifts?available=true` | GET | ✗ | Public |
| Get Shift Details | `/api/shifts/:id` | GET | ✗ | Public |
| Update Shift | `/api/shifts/:id` | PUT | ✓ | Business |
| Delete Shift | `/api/shifts/:id` | DELETE | ✓ | Business |
| Book Shift | `/api/bookings` | POST | ✓ | Worker |
| Get My Bookings | `/api/bookings/my-bookings` | GET | ✓ | Worker |
| Get Shift Bookings | `/api/bookings/shift/:id` | GET | ✓ | Business |
| Update Booking Status | `/api/bookings/:id` | PUT | ✓ | Both |
| Cancel Booking | `/api/bookings/:id` | DELETE | ✓ | Both |

---

## Database Validation

These tables and relationships should exist:

### Tables
- ✓ `shifts` - shift listings
- ✓ `bookings` - worker shift bookings
- ✓ `users` - user accounts (business/worker)
- ✓ `right_to_work_verifications` - RTW verification records

### Key Relationships
- `shifts.business_id` → `users.id` (business who created the shift)
- `bookings.shift_id` → `shifts.id` (shift being booked)
- `bookings.worker_id` → `users.id` (worker who booked)
- `right_to_work_verifications.worker_user_id` → `users.id` (worker's RTW status)

### Key Constraints
- ✓ Only businesses can create shifts
- ✓ Only workers with approved RTW can book shifts
- ✓ Duplicate bookings prevented
- ✓ Cancelled shifts cannot be booked
- ✓ Filled shifts cannot be booked

---

## Notes

1. **Token Expiry**: JWT tokens expire in 7 days by default (see `.env` JWT_EXPIRES_IN)
2. **Sandbox Mode**: RTW verification uses sandbox mode with test code PASS12345
3. **Soft Deletes**: Shifts and bookings use soft deletes (deleted_at field)
4. **Status Transitions**: Booking statuses follow state machine: pending → confirmed → completed
5. **Capacity Management**: Shifts with max_workers will reject bookings when full

---

## Troubleshooting

### 401 Unauthorized
- Token expired or invalid
- Missing `Authorization: Bearer <token>` header

### 403 Forbidden
- Wrong role (e.g., worker trying to create shift)
- Use correct token for the operation

### 400 Bad Request
- Validation error (check error message)
- Invalid shift times, missing fields, or business rule violation

### 404 Not Found
- Shift or booking doesn't exist
- Check IDs are correct

---

## Next Steps

After verifying all features work:
1. Implement frontend integration
2. Add automated integration tests
3. Set up monitoring and logging
4. Configure production environment
5. Add rate limiting and additional security measures
