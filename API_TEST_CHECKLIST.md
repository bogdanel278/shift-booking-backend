# API Test Checklist - Business, Shifts & Bookings Flow

## 📋 Quick Reference

- ✅ = Test Passed
- ❌ = Test Failed
- ⏭️ = Skipped

---

## 1. Business Registration

### Endpoint Details
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Auth Required:** No
- **Role Required:** None

### Request Body
```json
{
  "email": "business@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Smith",
  "company_name": "Smith Catering Ltd",
  "role": "business",
  "phone": "+447700900123",
  "business_type": "hospitality"
}
```

### Expected Success Response (201)
```json
{
  "success": true,
  "message": "Business registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Smith",
      "email": "business@example.com",
      "role": "business",
      "is_active": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Common Failure Cases
| Case | Status | Response |
|------|--------|----------|
| Missing company_name | 400 | `{"error": "Missing required fields: first_name, last_name, email, password, company_name"}` |
| Email already exists | 409 | `{"error": "Email already registered"}` |
| Weak password (<8 chars) | 400 | `{"error": "Password must be at least 8 characters long"}` |
| Invalid role | 400 | `{"error": "Invalid role. Must be 'worker' or 'business'"}` |

### Test Checklist
- [ ] Register with valid data
- [ ] Register with existing email (should fail)
- [ ] Register with weak password (should fail)
- [ ] Register without company_name (should fail)
- [ ] Verify token is returned
- [ ] Verify business profile is auto-created

---

## 2. Business Login

### Endpoint Details
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Auth Required:** No
- **Role Required:** None

### Request Body
```json
{
  "email": "business@example.com",
  "password": "SecurePass123!"
}
```

### Expected Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Smith",
      "email": "business@example.com",
      "role": "business"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Common Failure Cases
| Case | Status | Response |
|------|--------|----------|
| Wrong password | 401 | `{"error": "Invalid email or password"}` |
| Non-existent email | 401 | `{"error": "Invalid email or password"}` |
| Missing credentials | 400 | `{"error": "Email and password are required"}` |
| Inactive account | 403 | `{"error": "Account is inactive. Please contact support."}` |

### Test Checklist
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Login with non-existent email (should fail)
- [ ] Verify token is returned
- [ ] Verify token can be used for authenticated requests

---

## 3. Get Business Profile

### Endpoint Details
- **Method:** `GET`
- **URL:** `/api/business/profile`
- **Auth Required:** Yes (Bearer token)
- **Role Required:** Business

### Request Body
None (GET request)

### Headers
```
Authorization: Bearer <token>
```

### Expected Success Response (200)
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "company_name": "Smith Catering Ltd",
  "description": null,
  "business_type": "hospitality",
  "tax_id": null,
  "website_url": null,
  "logo_url": null,
  "is_verified": false,
  "rating": null,
  "total_reviews": 0,
  "total_shifts_posted": 0,
  "created_at": "2026-03-11T10:00:00.000Z",
  "updated_at": "2026-03-11T10:00:00.000Z"
}
```

### Common Failure Cases
| Case | Status | Response |
|------|--------|----------|
| Missing token | 401 | `{"error": "Access token required"}` |
| Invalid token | 401 | `{"error": "Invalid or expired token"}` |
| Worker attempting access | 403 | `{"error": "Access denied. Business role required."}` |

### Test Checklist
- [ ] Get profile with valid business token
- [ ] Get profile without token (should fail)
- [ ] Get profile with worker token (should fail)
- [ ] Get profile with expired token (should fail)

---

## 4. Update Business Profile

### Endpoint Details
- **Method:** `PUT`
- **URL:** `/api/business/profile`
- **Auth Required:** Yes (Bearer token)
- **Role Required:** Business

### Request Body
```json
{
  "description": "Premier catering services for all occasions",
  "website_url": "https://smithcatering.com",
  "business_type": "restaurant"
}
```

### Expected Success Response (200)
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "company_name": "Smith Catering Ltd",
  "description": "Premier catering services for all occasions",
  "business_type": "restaurant",
  "website_url": "https://smithcatering.com",
  "is_verified": false,
  "updated_at": "2026-03-11T10:30:00.000Z"
}
```

### Common Failure Cases
| Case | Status | Response |
|------|--------|----------|
| Missing token | 401 | `{"error": "Access token required"}` |
| Invalid URL format | 400 | `{"error": "Invalid website URL format"}` |
| Profile not found | 404 | `{"error": "Business profile not found"}` |

### Test Checklist
- [ ] Update description
- [ ] Update website_url
- [ ] Update business_type
- [ ] Update multiple fields at once
- [ ] Attempt to update without token (should fail)

---

## 5. Create Shift

### Endpoint Details
- **Method:** `POST`
- **URL:** `/api/shifts`
- **Auth Required:** Yes (Bearer token)
- **Role Required:** Business

### Request Body
```json
{
  "title": "Wedding Event Staff",
  "description": "Experienced servers needed for luxury wedding",
  "location": "The Grand Hotel, London",
  "requirements": "Smart attire, hospitality experience preferred",
  "start_time": "2026-03-25T09:00:00Z",
  "end_time": "2026-03-25T17:00:00Z",
  "pay_rate": 18.50,
  "max_workers": 5,
  "category": "hospitality"
}
```

### Expected Success Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business_id": "uuid",
    "title": "Wedding Event Staff",
    "description": "Experienced servers needed for luxury wedding",
    "location": "The Grand Hotel, London",
    "requirements": "Smart attire, hospitality experience preferred",
    "start_time": "2026-03-25T09:00:00.000Z",
    "end_time": "2026-03-25T17:00:00.000Z",
    "pay_rate": 18.50,
    "max_workers": 5,
    "category": "hospitality",
    "status": "draft",
    "created_at": "2026-03-11T10:00:00.000Z"
  }
}
```

### Common Failure Cases
| Case | Status | Response |
|------|--------|----------|
| Missing token | 401 | `{"error": "Access token required"}` |
| Worker attempting to create | 403 | `{"error": "Access denied. Business role required."}` |
| Missing required fields | 400 | `{"error": "Title is required"}` |
| Start time in past | 400 | `{"error": "Start time must be in the future"}` |
| End time before start | 400 | `{"error": "End time must be after start time"}` |
| Invalid pay_rate | 400 | `{"error": "Pay rate must be greater than 0"}` |

### Test Checklist
- [ ] Create shift with all fields
- [ ] Create shift with minimum required fields
- [ ] Create without token (should fail)
- [ ] Create with worker token (should fail)
- [ ] Create with past start_time (should fail)
- [ ] Create with end_time before start_time (should fail)
- [ ] Create with negative pay_rate (should fail)

---

## 6. List Business Shifts

### Endpoint Details
- **Method:** `GET`
- **URL:** `/api/business/shifts`
- **Auth Required:** Yes (Bearer token)
- **Role Required:** Business

### Request Body
None (GET request)

### Expected Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "business_id": "uuid",
      "title": "Wedding Event Staff",
      "location": "The Grand Hotel, London",
      "start_time": "2026-03-25T09:00:00.000Z",
      "end_time": "2026-03-25T17:00:00.000Z",
      "pay_rate": 18.50,
      "max_workers": 5,
      "status": "draft"
    }
  ],
  "count": 1
}
```

### Common Failure Cases
| Case | Status | Response |
|------|--------|----------|
| Missing token | 401 | `{"error": "Access token required"}` |
| Worker attempting access | 403 | `{"error": "Access denied. Business role required."}` |

### Test Checklist
- [ ] List shifts as business owner
- [ ] List shifts without token (should fail)
- [ ] List shifts with worker token (should fail)
- [ ] Verify only own shifts are returned

---

## 7. Edit Shift

### Endpoint Details
- **Method:** `PUT`
- **URL:** `/api/shifts/:id`
- **Auth Required:** Yes (Bearer token)
- **Role Required:** Business (must own the shift)

### Request Body
```json
{
  "pay_rate": 20.00,
  "max_workers": 6,
  "description": "Updated description"
}
```

### Expected Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business_id": "uuid",
    "title": "Wedding Event Staff",
    "description": "Updated description",
    "pay_rate": 20.00,
    "max_workers": 6,
    "updated_at": "2026-03-11T11:00:00.000Z"
  }
}
```

### Common Failure Cases
| Case | Status | Response |
|------|--------|----------|
| Missing token | 401 | `{"error": "Access token required"}` |
| Not shift owner | 403 | `{"error": "Not authorized to update this shift"}` |
| Shift not found | 404 | `{"error": "Shift not found"}` |
| Invalid pay_rate | 400 | `{"error": "Pay rate must be greater than 0"}` |
| Invalid status value | 400 | `{"error": "invalid input value for enum shift_status"}` |

### Test Checklist
- [ ] Update pay_rate
- [ ] Update max_workers
- [ ] Update description
- [ ] Update multiple fields
- [ ] Update without token (should fail)
- [ ] Update shift owned by another business (should fail)
- [ ] Update non-existent shift (should fail)

---

## 8. Cancel Shift

### Endpoint Details
- **Method:** `PATCH`
- **URL:** `/api/shifts/:id/cancel`
- **Auth Required:** Yes (Bearer token)
- **Role Required:** Business (must own the shift)

### Request Body
None (or empty object)

### Expected Success Response (200)
```json
{
  "success": true,
  "message": "Shift cancelled successfully",
  "data": {
    "id": "uuid",
    "business_id": "uuid",
    "title": "Wedding Event Staff",
    "status": "cancelled",
    "updated_at": "2026-03-11T12:00:00.000Z"
  }
}
```

### Common Failure Cases
| Case | Status | Response |
|------|--------|----------|
| Missing token | 401 | `{"error": "Access token required"}` |
| Not shift owner | 403 | `{"error": "Not authorized to cancel this shift"}` |
| Shift not found | 404 | `{"error": "Shift not found"}` |
| Already cancelled | 400 | `{"error": "Shift is already cancelled"}` |

### Test Checklist
- [ ] Cancel a shift as owner
- [ ] Cancel already cancelled shift (should fail)
- [ ] Cancel without token (should fail)
- [ ] Cancel shift owned by another business (should fail)

---

## 9. List Available Shifts

### Endpoint Details
- **Method:** `GET`
- **URL:** `/api/shifts?available=true`
- **Auth Required:** No
- **Role Required:** None

### Request Body
None (GET request)

### Expected Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "business_id": "uuid",
      "title": "Wedding Event Staff",
      "description": "Experienced servers needed",
      "location": "The Grand Hotel, London",
      "start_time": "2026-03-25T09:00:00.000Z",
      "end_time": "2026-03-25T17:00:00.000Z",
      "pay_rate": 20.00,
      "max_workers": 6,
      "status": "published",
      "category": "hospitality"
    }
  ],
  "count": 1
}
```

### Common Failure Cases
None (public endpoint)

### Test Checklist
- [ ] List available shifts without authentication
- [ ] Verify only future shifts are returned
- [ ] Verify cancelled shifts are not returned
- [ ] Verify draft shifts are not returned

---

## 10. Worker Registration

### Endpoint Details
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Auth Required:** No
- **Role Required:** None

### Request Body
```json
{
  "email": "worker@example.com",
  "password": "WorkerPass123!",
  "first_name": "Jane",
  "last_name": "Doe",
  "role": "worker",
  "phone": "+447700900456"
}
```

### Expected Success Response (201)
```json
{
  "success": true,
  "message": "Worker registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Jane Doe",
      "email": "worker@example.com",
      "role": "worker",
      "is_active": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Common Failure Cases
| Case | Status | Response |
|------|--------|----------|
| Missing required fields | 400 | `{"error": "Missing required fields: first_name, last_name, email, password"}` |
| Email already exists | 409 | `{"error": "Email already registered"}` |
| Weak password | 400 | `{"error": "Password must be at least 8 characters long"}` |

### Test Checklist
- [ ] Register worker with valid data
- [ ] Register with existing email (should fail)
- [ ] Register with weak password (should fail)
- [ ] Verify token is returned
- [ ] Verify worker profile is auto-created

---

## 11. Submit RTW Verification

### Endpoint Details
- **Method:** `POST`
- **URL:** `/api/right-to-work/submit`
- **Auth Required:** Yes (Bearer token)
- **Role Required:** Worker

### Request Body (Passport)
```json
{
  "verification_method": "passport",
  "passport_number": "AB123456C",
  "passport_country": "GBR",
  "passport_expiry_date": "2030-12-31"
}
```

### Request Body (Share Code)
```json
{
  "verification_method": "share_code",
  "share_code": "ABC123XYZ",
  "date_of_birth": "1990-05-15"
}
```

### Expected Success Response (201)
```json
{
  "success": true,
  "message": "Right-to-work verification submitted successfully",
  "data": {
    "id": "uuid",
    "worker_user_id": "uuid",
    "verification_method": "passport",
    "status": "pending",
    "created_at": "2026-03-11T10:00:00.000Z"
  }
}
```

### Common Failure Cases
| Case | Status | Response |
|------|--------|----------|
| Missing token | 401 | `{"error": "Access token required"}` |
| Business attempting to submit | 403 | `{"error": "Access denied. Worker role required."}` |
| Invalid verification_method | 400 | `{"details": [{"field": "verification_method", "message": "Invalid verification method"}]}` |
| Missing required fields | 400 | `{"details": [{"field": "passport_number", "message": "Passport number is required"}]}` |
| Expired passport | 400 | `{"details": [{"field": "passport_expiry_date", "message": "Passport has expired"}]}` |
| Pending verification exists | 409 | `{"error": "You already have a pending verification. Please wait for review."}` |

### Test Checklist
- [ ] Submit passport verification
- [ ] Submit share code verification
- [ ] Submit visa verification
- [ ] Submit without token (should fail)
- [ ] Submit with business token (should fail)
- [ ] Submit with expired passport (should fail)
- [ ] Submit duplicate when pending (should fail)

---

## 12. Book a Shift

### Endpoint Details
- **Method:** `POST`
- **URL:** `/api/bookings`
- **Auth Required:** Yes (Bearer token)
- **Role Required:** Worker

### Request Body
```json
{
  "shift_id": "uuid",
  "notes": "I have 3 years of hospitality experience"
}
```

### Expected Success Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "worker_id": "uuid",
    "shift_id": "uuid",
    "status": "confirmed",
    "notes": "I have 3 years of hospitality experience",
    "created_at": "2026-03-11T10:00:00.000Z"
  }
}
```

### Common Failure Cases
| Case | Status | Response |
|------|--------|----------|
| Missing token | 401 | `{"error": "Access token required"}` |
| Business attempting to book | 403 | `{"error": "Access denied. Worker role required."}` |
| No RTW verification | 403 | `{"error": "You must have an approved right-to-work verification before booking shifts"}` |
| Shift not found | 404 | `{"error": "Shift not found"}` |
| Shift cancelled | 400 | `{"error": "This shift has been cancelled and is no longer accepting bookings"}` |
| Shift full | 400 | `{"error": "This shift is full"}` |
| Duplicate booking | 409 | `{"error": "You have already booked this shift"}` |

### Test Checklist
- [ ] Book shift with verified RTW
- [ ] Book without token (should fail)
- [ ] Book without RTW verification (should fail)
- [ ] Book with business token (should fail)
- [ ] Book cancelled shift (should fail)
- [ ] Book same shift twice (should fail)
- [ ] Book full shift (should fail)

---

## 13. View Worker Bookings

### Endpoint Details
- **Method:** `GET`
- **URL:** `/api/bookings/my-bookings`
- **Auth Required:** Yes (Bearer token)
- **Role Required:** Worker

### Request Body
None (GET request)

### Expected Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "worker_id": "uuid",
      "shift_id": "uuid",
      "status": "confirmed",
      "notes": "I have 3 years of experience",
      "created_at": "2026-03-11T10:00:00.000Z",
      "shift": {
        "id": "uuid",
        "title": "Wedding Event Staff",
        "location": "The Grand Hotel, London",
        "start_time": "2026-03-25T09:00:00.000Z",
        "end_time": "2026-03-25T17:00:00.000Z",
        "pay_rate": 20.00,
        "status": "published"
      }
    }
  ],
  "count": 1
}
```

### Common Failure Cases
| Case | Status | Response |
|------|--------|----------|
| Missing token | 401 | `{"error": "Access token required"}` |
| Business attempting access | 403 | `{"error": "Access denied. Worker role required."}` |

### Test Checklist
- [ ] View bookings as worker
- [ ] View without token (should fail)
- [ ] View with business token (should fail)
- [ ] Verify only own bookings are returned

---

## 14. View Shift Bookings (Business)

### Endpoint Details
- **Method:** `GET`
- **URL:** `/api/shifts/:id/bookings`
- **Auth Required:** Yes (Bearer token)
- **Role Required:** Business (must own the shift)

### Request Body
None (GET request)

### Expected Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "worker_id": "uuid",
      "shift_id": "uuid",
      "status": "confirmed",
      "notes": "I have 3 years of experience",
      "created_at": "2026-03-11T10:00:00.000Z",
      "worker": {
        "id": "uuid",
        "full_name": "Jane Doe",
        "email": "worker@example.com"
      }
    }
  ],
  "count": 1
}
```

### Common Failure Cases
| Case | Status | Response |
|------|--------|----------|
| Missing token | 401 | `{"error": "Access token required"}` |
| Not shift owner | 403 | `{"error": "Not authorized to view bookings for this shift"}` |
| Shift not found | 404 | `{"error": "Shift not found"}` |

### Test Checklist
- [ ] View bookings for own shift
- [ ] View without token (should fail)
- [ ] View bookings for another business's shift (should fail)
- [ ] View bookings for non-existent shift (should fail)

---

## 📊 Overall Test Summary

### Business Flow
- [ ] Complete business registration → profile → shift creation flow
- [ ] Business can view and edit their own shifts
- [ ] Business can cancel their shifts
- [ ] Business can view bookings for their shifts

### Worker Flow
- [ ] Complete worker registration → RTW verification → shift booking flow
- [ ] Worker can view available shifts
- [ ] Worker can book shifts (with RTW verification)
- [ ] Worker can view their own bookings

### Security Tests
- [ ] All protected endpoints reject requests without tokens
- [ ] Role-based access control works (business vs worker)
- [ ] Users can only access/modify their own resources
- [ ] Expired tokens are rejected

### Data Validation Tests
- [ ] Required fields are validated
- [ ] Date/time constraints are enforced
- [ ] Enum values are validated
- [ ] Duplicate prevention works

---

## 🔧 Testing Tools

### Using cURL
```bash
# Register business
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","first_name":"John","last_name":"Smith","company_name":"Test Co","role":"business"}'

# Get profile (with auth)
curl -X GET http://localhost:3000/api/business/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using the Test Script
```bash
# Run complete marketplace flow test
node test-marketplace-complete-flow.js
```

### Using Postman/Insomnia
1. Import this document as a guide
2. Create environment variables for:
   - `base_url`: http://localhost:3000
   - `business_token`: (obtained from registration/login)
   - `worker_token`: (obtained from registration/login)
   - `shift_id`: (obtained from shift creation)

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Access token required" | Include `Authorization: Bearer <token>` header |
| "Invalid or expired token" | Re-login to get a new token |
| "Access denied" | Check you're using the correct role's token |
| "Shift not found" | Verify the shift ID exists and hasn't been deleted |
| "RTW verification required" | Submit RTW verification before booking shifts |

---

## 📝 Notes

- All timestamps are in ISO 8601 format with UTC timezone
- UUIDs are returned as strings in responses
- The field name is `max_workers` (not `workers_needed`)
- Shift status enum values: `draft`, `published`, `in_progress`, `completed`, `cancelled`
- Booking status enum values: `pending`, `confirmed`, `cancelled`, `completed`
- Business profiles are automatically created during registration
- Worker profiles are automatically created during registration
