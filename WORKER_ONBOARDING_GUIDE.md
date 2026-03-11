# Worker Onboarding Flow - Complete Guide

**Last Updated:** March 11, 2026  
**Status:** Fully Implemented ✅

---

## Overview

This guide demonstrates the **complete worker onboarding journey** from registration to booking their first shift, including right-to-work verification.

### Flow Steps

1. **Worker Registration** - Create account
2. **Login** - Authenticate and receive JWT token
3. **View Profile** - See automatically created worker profile
4. **Update Profile** - Add skills, bio, availability, etc.
5. **Submit RTW Verification** - Submit right-to-work documents/codes
6. **Check RTW Status** - View verification status
7. **Attempt Booking** - Try to book shift (blocked if RTW not approved)
8. **Admin Review** - Admin reviews and approves RTW
9. **Book Shift** - Successfully book shift after RTW approval

---

## Prerequisites

### 1. Server Running
```bash
cd /tmp/shift-booking-backend
npm run build
npm start
```

Verify server is running:
```bash
curl http://localhost:3000/health
# Should return: {"status":"OK","timestamp":"..."}
```

### 2. Database Migrations Applied
```bash
npm run db:migrate
```

### 3. Admin User (Optional for Full Test)
To test admin approval, create an admin user:

```sql
-- Connect to your database and run:
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2a$10$YourHashedPasswordHere', -- Use bcrypt to hash 'AdminPass123'
  'admin'
);
```

Or update existing user:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## Automated Testing (Recommended)

### Run Complete Flow Test

```bash
npm run test:onboarding
```

This script automatically tests all 14 steps of the onboarding flow with colored output showing success/failure at each stage.

**What it tests:**
- ✅ Worker registration with validation
- ✅ Login and token generation
- ✅ Profile retrieval and updates
- ✅ RTW submission (sandbox mode)
- ✅ RTW status checking
- ✅ Booking blocked without RTW approval
- ✅ Admin RTW review (if admin available)
- ✅ Successful booking after RTW approval

---

## Manual Testing (Step by Step)

For hands-on testing or debugging, follow these manual curl commands:

### Step 1: Register Worker

```bash
curl -X POST http://localhost:3000/api/auth/register/worker \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Worker",
    "email": "john.worker@example.com",
    "password": "SecurePass123",
    "phone": "+447700900123",
    "date_of_birth": "1990-01-15",
    "address_line_1": "123 Worker Street",
    "city": "London",
    "postcode": "SW1A 1AA",
    "nationality": "British"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Worker registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "John Worker",
      "email": "john.worker@example.com",
      "role": "worker",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Save the token!** You'll need it for all subsequent requests.

```bash
export WORKER_TOKEN="<token-from-response>"
export WORKER_ID="<id-from-response>"
```

---

### Step 2: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.worker@example.com",
    "password": "SecurePass123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Step 3: Get Current User Info

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $WORKER_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "John Worker",
    "email": "john.worker@example.com",
    "role": "worker",
    "is_verified": false,
    "is_active": true
  }
}
```

---

### Step 4: View Worker Profile

```bash
curl -X GET http://localhost:3000/api/worker-profiles/me \
  -H "Authorization: Bearer $WORKER_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "user_id": "uuid-here",
    "bio": null,
    "skills": null,
    "hourly_rate": null,
    "years_of_experience": null,
    "certifications": null,
    "availability": null,
    "rating": null,
    "total_jobs_completed": 0
  }
}
```

Note: Profile is created automatically during registration but is empty.

---

### Step 5: Update Worker Profile

```bash
curl -X PUT http://localhost:3000/api/worker-profiles/me \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Experienced hospitality worker with 5 years in restaurants and hotels.",
    "skills": ["bartending", "waiter", "customer service", "food safety"],
    "hourly_rate": 12.50,
    "years_of_experience": 5,
    "certifications": ["Food Safety Level 2", "First Aid"],
    "availability": {
      "monday": {"available": true, "hours": "09:00-17:00"},
      "tuesday": {"available": true, "hours": "09:00-17:00"},
      "wednesday": {"available": true, "hours": "09:00-17:00"},
      "thursday": {"available": true, "hours": "09:00-17:00"},
      "friday": {"available": true, "hours": "09:00-17:00"},
      "saturday": {"available": false},
      "sunday": {"available": false}
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid-here",
    "user_id": "uuid-here",
    "bio": "Experienced hospitality worker...",
    "skills": ["bartending", "waiter", "customer service", "food safety"],
    "hourly_rate": 12.50,
    ...
  }
}
```

---

### Step 6: Submit Right-to-Work Verification

#### Option A: Share Code (Automatic Verification via Vouchsafe)

```bash
curl -X POST http://localhost:3000/api/right-to-work/submit \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verification_method": "share_code",
    "share_code": "PASS12345",
    "date_of_birth": "1990-01-15"
  }'
```

**Sandbox Test Codes:**
- `PASS12345` - Automatically approved ✅
- `FAIL12345` - Automatically rejected ❌
- `ERROR1234` - Simulates error

#### Option B: Passport (Manual Review Required)

```bash
curl -X POST http://localhost:3000/api/right-to-work/submit \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verification_method": "passport",
    "passport_number": "123456789",
    "passport_country": "GB",
    "passport_expiry_date": "2030-12-31",
    "document_file_url": "https://example.com/passport.pdf"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "rtw-uuid-here",
    "worker_user_id": "uuid-here",
    "verification_method": "share_code",
    "status": "approved",  // or "pending" for manual review
    "submitted_at": "2026-03-11T..."
  }
}
```

**Save RTW ID:**
```bash
export RTW_ID="<id-from-response>"
```

---

### Step 7: Check RTW Status

```bash
curl -X GET http://localhost:3000/api/right-to-work/status \
  -H "Authorization: Bearer $WORKER_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "rtw-uuid-here",
    "status": "approved",  // or "pending", "rejected", "failed"
    "verification_method": "share_code",
    "provider_name": "Vouchsafe",
    "submitted_at": "2026-03-11T...",
    "checked_at": "2026-03-11T..."
  }
}
```

**Status Values:**
- `pending` - Awaiting review
- `approved` - ✅ Can book shifts
- `rejected` - ❌ Cannot book shifts
- `failed` - Verification error

---

### Step 8: Create Test Shift (One-time Setup)

To test booking, you need a shift. Register a business and create one:

```bash
# Register business
curl -X POST http://localhost:3000/api/auth/register/business \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Business",
    "last_name": "Owner",
    "email": "business@example.com",
    "password": "BusinessPass123",
    "phone": "+447700900456",
    "company_name": "Test Restaurant Ltd",
    "company_number": "GB123456789"
  }'

export BUSINESS_TOKEN="<token-from-response>"
export BUSINESS_ID="<id-from-response>"

# Create shift
curl -X POST http://localhost:3000/api/shifts \
  -H "Authorization: Bearer $BUSINESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "'$BUSINESS_ID'",
    "title": "Restaurant Waiter",
    "description": "Busy restaurant needs experienced waiter",
    "location": "London, UK",
    "requirements": "Food safety certification preferred",
    "start_time": "2026-03-15T09:00:00Z",
    "end_time": "2026-03-15T17:00:00Z",
    "pay_rate": 12.50,
    "max_workers": 5,
    "category": "hospitality",
    "status": "published"
  }'

export SHIFT_ID="<id-from-response>"
```

---

### Step 9: Attempt to Book Shift

#### A. Without RTW Approval (Should Fail)

If your RTW status is still `pending`:

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shift_id": "'$SHIFT_ID'"
  }'
```

**Expected Response (Error):**
```json
{
  "error": "You must have an approved right-to-work verification before booking shifts. Please submit your verification documents."
}
```

This confirms the RTW validation is working! ✅

#### B. With RTW Approval (Should Succeed)

After RTW is approved:

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shift_id": "'$SHIFT_ID'"
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "shift_id": "shift-uuid",
    "worker_id": "worker-uuid",
    "status": "pending",
    "created_at": "2026-03-11T..."
  }
}
```

Success! Worker can now book shifts. ✅

---

### Step 10: Admin Reviews RTW (If Needed)

If RTW status is `pending`, admin needs to review:

#### A. Admin Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123"
  }'

export ADMIN_TOKEN="<token-from-response>"
```

#### B. View Pending RTW Verifications

```bash
curl -X GET http://localhost:3000/api/right-to-work/admin/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rtw-uuid",
      "worker_user_id": "worker-uuid",
      "worker_name": "John Worker",
      "worker_email": "john.worker@example.com",
      "verification_method": "passport",
      "status": "pending",
      "submitted_at": "2026-03-11T..."
    }
  ]
}
```

#### C. Approve RTW Verification

```bash
curl -X PATCH http://localhost:3000/api/right-to-work/admin/$RTW_ID/review \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "notes": "All documents verified. Worker approved for employment."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "rtw-uuid",
    "status": "approved",
    "checked_at": "2026-03-11T...",
    "checked_by_user_id": "admin-uuid",
    "notes": "All documents verified..."
  }
}
```

Now the worker can book shifts!

---

## Testing Complete Flow (Quick Commands)

Copy-paste this entire block for end-to-end testing:

```bash
#!/bin/bash

# 1. Register Worker
echo "=== Step 1: Register Worker ==="
WORKER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register/worker \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Worker",
    "email": "test.worker.'$(date +%s)'@example.com",
    "password": "TestPass123",
    "phone": "+447700900999"
  }')

WORKER_TOKEN=$(echo $WORKER_RESPONSE | jq -r '.data.token')
WORKER_ID=$(echo $WORKER_RESPONSE | jq -r '.data.user.id')

echo "Worker ID: $WORKER_ID"
echo "Token: ${WORKER_TOKEN:0:20}..."

# 2. View Profile
echo -e "\n=== Step 2: View Profile ==="
curl -s -X GET http://localhost:3000/api/worker-profiles/me \
  -H "Authorization: Bearer $WORKER_TOKEN" | jq

# 3. Update Profile
echo -e "\n=== Step 3: Update Profile ==="
curl -s -X PUT http://localhost:3000/api/worker-profiles/me \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Test worker profile",
    "skills": ["testing"],
    "hourly_rate": 10.00
  }' | jq

# 4. Submit RTW
echo -e "\n=== Step 4: Submit RTW ==="
RTW_RESPONSE=$(curl -s -X POST http://localhost:3000/api/right-to-work/submit \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verification_method": "share_code",
    "share_code": "PASS12345",
    "date_of_birth": "1990-01-01"
  }')

echo $RTW_RESPONSE | jq

# 5. Check RTW Status
echo -e "\n=== Step 5: Check RTW Status ==="
curl -s -X GET http://localhost:3000/api/right-to-work/status \
  -H "Authorization: Bearer $WORKER_TOKEN" | jq

echo -e "\n=== Flow Complete ==="
```

---

## Troubleshooting

### Issue: "Authentication required"
**Solution:** Make sure you're including the token in the Authorization header:
```bash
-H "Authorization: Bearer $WORKER_TOKEN"
```

### Issue: "RTW verification not approved"
**Solution:** Check RTW status. If pending, admin needs to approve. If using sandbox, use `PASS12345` code.

### Issue: "Email already registered"
**Solution:** Use a different email or add timestamp:
```bash
"email": "worker.$(date +%s)@example.com"
```

### Issue: "Cannot book shift that has already started"
**Solution:** Update shift start_time to be in the future:
```javascript
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
// Use tomorrow.toISOString() as start_time
```

### Issue: "Shift has reached maximum capacity"
**Solution:** Increase `max_workers` in shift or create a new shift.

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/register/worker` - Register new worker
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Worker Profile
- `GET /api/worker-profiles/me` - View my profile (requires auth)
- `PUT /api/worker-profiles/me` - Update my profile (requires auth)
- `GET /api/worker-profiles` - List all profiles
- `GET /api/worker-profiles/search?skills=x,y` - Search by skills

### Right-to-Work
- `POST /api/right-to-work/submit` - Submit verification (requires worker auth)
- `GET /api/right-to-work/status` - Check status (requires worker auth)
- `GET /api/right-to-work/admin/pending` - View pending (requires admin)
- `PATCH /api/right-to-work/admin/:id/review` - Approve/reject (requires admin)

### Bookings
- `POST /api/bookings` - Book shift (requires worker auth + approved RTW)
- `GET /api/bookings/worker/:workerId` - View my bookings

---

## Success Criteria

A successful onboarding flow includes:

✅ Worker can register with required information  
✅ Worker receives JWT token automatically  
✅ Worker profile is created automatically  
✅ Worker can update profile with skills and details  
✅ Worker can submit RTW verification  
✅ Worker can check RTW status  
✅ Booking is **blocked** without approved RTW  
✅ Admin can view pending RTW verifications  
✅ Admin can approve/reject RTW  
✅ Worker can book shifts **after** RTW approval  

---

## Next Steps

After successful onboarding:

1. **Business confirms booking** - `PATCH /api/bookings/:id` with `status: "confirmed"`
2. **Worker clocks in** - `POST /api/timesheets/clock-in`
3. **Worker clocks out** - `POST /api/timesheets/:id/clock-out`
4. **Business approves timesheet** - `POST /api/timesheets/:id/approve`
5. **Leave reviews** - `POST /api/reviews`

See IMPLEMENTATION_ROADMAP.md for full feature set.

---

**Questions?** Check FIXES_IMPLEMENTED.md for recent security improvements.
