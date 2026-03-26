# Complete Marketplace API Documentation

## Overview
This document describes all API endpoints for the complete marketplace flow, including:
- Business onboarding (registration, login, profile management)
- Shift management (create, edit, list, cancel)  
- Worker onboarding and Right to Work verification
- Booking system (create bookings, view bookings)

---

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Business Onboarding

### 1.1 Register Business
**POST** `/api/auth/register`

Creates a new business user account.

**Request Body:**
```json
{
  "email": "business@example.com",
  "password": "SecurePassword123!",
  "full_name": "Business Owner Name",
  "role": "business"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "business@example.com",
    "full_name": "Business Owner Name",
    "role": "business"
  },
  "token": "jwt_token_here"
}
```

---

### 1.2 Business Login
**POST** `/api/auth/login`

Authenticates a business user.

**Request Body:**
```json
{
  "email": "business@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "business@example.com",
    "full_name": "Business Owner Name",
    "role": "business"
  },
  "token": "jwt_token_here"
}
```

---

### 1.3 Create Business Profile
**POST** `/api/business-profiles`

Creates a business profile with company details.

**Request Body:**
```json
{
  "user_id": "uuid",
  "company_name": "Test Catering Company",
  "business_type": "restaurant",
  "description": "Fine dining and event catering",
  "address": "123 Business St, London",
  "phone_number": "+447700900123",
  "website": "https://testcatering.com",
  "registration_number": "GB123456789",
  "verified": false
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "company_name": "Test Catering Company",
  "business_type": "restaurant",
  "description": "Fine dining and event catering",
  "address": "123 Business St, London",
  "phone_number": "+447700900123",
  "website": "https://testcatering.com",
  "registration_number": "GB123456789",
  "verified": false,
  "rating": 0.0,
  "total_shifts_posted": 0,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

### 1.4 Get Current Business Profile
**GET** `/api/business/profile`

🔒 **Authentication Required** (Business role)

Retrieves the authenticated business's profile.

**Response (200):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "company_name": "Test Catering Company",
  "business_type": "restaurant",
  "description": "Fine dining and event catering",
  "address": "123 Business St, London",
  "phone_number": "+447700900123",
  "website": "https://testcatering.com",
  "verified": true,
  "rating": 4.8,
  "total_shifts_posted": 25
}
```

---

### 1.5 Update Business Profile
**PUT** `/api/business/profile`

🔒 **Authentication Required** (Business role)

Updates the authenticated business's profile.

**Request Body:**
```json
{
  "description": "Premier fine dining and luxury event catering",
  "phone_number": "+447700900456",
  "website": "https://newwebsite.com"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "company_name": "Test Catering Company",
  "description": "Premier fine dining and luxury event catering",
  "phone_number": "+447700900456",
  "website": "https://newwebsite.com",
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

---

## 2. Shift Management

### 2.1 Create Shift
**POST** `/api/shifts`

🔒 **Authentication Required** (Business role)

Creates a new shift.

**Request Body:**
```json
{
  "title": "Wedding Event Staff",
  "description": "Experienced servers needed for luxury wedding",
  "location": "The Grand Hotel, London",
  "requirements": "Smart attire, hospitality experience preferred",
  "start_time": "2024-12-25T09:00:00Z",
  "end_time": "2024-12-25T17:00:00Z",
  "pay_rate": 18.50,
  "max_workers": 5,
  "category": "hospitality"
}
```

**Response (201):**
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
    "start_time": "2024-12-25T09:00:00.000Z",
    "end_time": "2024-12-25T17:00:00.000Z",
    "pay_rate": 18.50,
    "max_workers": 5,
    "category": "hospitality",
    "status": "published",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2.2 List Business Shifts
**GET** `/api/business/shifts`

🔒 **Authentication Required** (Business role)

Lists all shifts created by the authenticated business.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "business_id": "uuid",
      "title": "Wedding Event Staff",
      "location": "The Grand Hotel, London",
      "start_time": "2024-12-25T09:00:00.000Z",
      "end_time": "2024-12-25T17:00:00.000Z",
      "pay_rate": 18.50,
      "max_workers": 5,
      "status": "published"
    }
  ],
  "count": 1
}
```

---

### 2.3 Edit Shift
**PUT** `/api/shifts/:id`

🔒 **Authentication Required** (Business role, must own the shift)

Updates a shift's details.

**Request Body:**
```json
{
  "pay_rate": 20.00,
  "max_workers": 6,
  "status": "published"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business_id": "uuid",
    "title": "Wedding Event Staff",
    "pay_rate": 20.00,
    "max_workers": 6,
    "status": "published",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 2.4 Cancel Shift
**PATCH** `/api/shifts/:id/cancel`

🔒 **Authentication Required** (Business role, must own the shift)

Cancels a shift by setting its status to 'cancelled'.

**Response (200):**
```json
{
  "success": true,
  "message": "Shift cancelled successfully",
  "data": {
    "id": "uuid",
    "business_id": "uuid",
    "title": "Wedding Event Staff",
    "status": "cancelled",
    "updated_at": "2024-01-01T15:00:00.000Z"
  }
}
```

**Business Rules:**
- Shift must exist and belong to the authenticated business
- Cannot cancel a shift that is already cancelled
- Existing bookings for cancelled shifts will be blocked from completion

---

### 2.5 List Available Shifts
**GET** `/api/shifts?available=true`

Lists all available shifts (future shifts that are published).

**Response (200):**
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
      "start_time": "2024-12-25T09:00:00.000Z",
      "end_time": "2024-12-25T17:00:00.000Z",
      "pay_rate": 20.00,
      "max_workers": 6,
      "status": "published",
      "category": "hospitality"
    }
  ],
  "count": 1
}
```

---

### 2.6 Get Shift Details
**GET** `/api/shifts/:id`

Retrieves details of a specific shift.

**Response (200):**
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
    "start_time": "2024-12-25T09:00:00.000Z",
    "end_time": "2024-12-25T17:00:00.000Z",
    "pay_rate": 20.00,
    "max_workers": 6,
    "status": "published",
    "category": "hospitality"
  }
}
```

---

## 3. Worker Onboarding

### 3.1 Register Worker
**POST** `/api/auth/register`

Creates a new worker user account.

**Request Body:**
```json
{
  "email": "worker@example.com",
  "password": "WorkerPassword123!",
  "full_name": "Worker Name",
  "role": "worker"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "worker@example.com",
    "full_name": "Worker Name",
    "role": "worker"
  },
  "token": "jwt_token_here"
}
```

---

### 3.2 Create Worker Profile
**POST** `/api/worker-profiles`

Creates a worker profile.

**Request Body:**
```json
{
  "user_id": "uuid",
  "date_of_birth": "1995-05-15",
  "phone_number": "+447700900789",
  "address": "456 Worker Road, London",
  "bio": "Experienced hospitality professional",
  "skills": ["customer service", "food service", "event management"],
  "experience_years": 3,
  "availability": {
    "weekdays": true,
    "weekends": true,
    "evenings": true
  },
  "verified": false,
  "rating": 0.0
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "date_of_birth": "1995-05-15",
  "phone_number": "+447700900789",
  "address": "456 Worker Road, London",
  "bio": "Experienced hospitality professional",
  "skills": ["customer service", "food service", "event management"],
  "experience_years": 3,
  "verified": false,
  "rating": 0.0,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

### 3.3 Submit Right to Work Verification
**POST** `/api/right-to-work`

🔒 **Authentication Required** (Worker role)

Submits Right to Work verification documents.

**Request Body:**
```json
{
  "user_id": "uuid",
  "document_type": "passport",
  "document_number": "AB123456C",
  "issuing_country": "GB",
  "expiry_date": "2030-12-31",
  "verification_method": "document_upload"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "document_type": "passport",
  "document_number": "AB123456C",
  "issuing_country": "GB",
  "expiry_date": "2030-12-31T00:00:00.000Z",
  "verification_method": "document_upload",
  "status": "verified_sandbox",
  "verified_at": "2024-01-01T00:00:00.000Z",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Note:** In sandbox mode, all RTW verifications are automatically approved with status `verified_sandbox`.

---

## 4. Booking System

### 4.1 Book a Shift
**POST** `/api/bookings`

🔒 **Authentication Required** (Worker role)

Creates a booking for a shift.

**Request Body:**
```json
{
  "shift_id": "uuid",
  "notes": "I have 3 years of hospitality experience"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "worker_id": "uuid",
    "shift_id": "uuid",
    "status": "confirmed",
    "notes": "I have 3 years of hospitality experience",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Business Rules:**
- Worker must have a valid RTW verification
- Worker cannot book the same shift twice
- Worker cannot book a cancelled shift
- Worker cannot book a filled shift (bookings >= max_workers)

---

### 4.2 View Worker Bookings
**GET** `/api/worker/bookings`

🔒 **Authentication Required** (Worker role)

Lists all bookings for the authenticated worker.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "worker_id": "uuid",
      "shift_id": "uuid",
      "status": "confirmed",
      "notes": "I have 3 years of hospitality experience",
      "created_at": "2024-01-01T00:00:00.000Z",
      "shift": {
        "id": "uuid",
        "title": "Wedding Event Staff",
        "location": "The Grand Hotel, London",
        "start_time": "2024-12-25T09:00:00.000Z",
        "end_time": "2024-12-25T17:00:00.000Z",
        "pay_rate": 20.00,
        "status": "published"
      }
    }
  ],
  "count": 1
}
```

**Alternative Endpoint:** `GET /api/bookings/my-bookings` (same functionality)

---

### 4.3 View Shift Bookings (Business)
**GET** `/api/shifts/:id/bookings`

🔒 **Authentication Required** (Business role, must own the shift)

Lists all bookings for a specific shift.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "worker_id": "uuid",
      "shift_id": "uuid",
      "status": "confirmed",
      "notes": "I have 3 years of hospitality experience",
      "created_at": "2024-01-01T00:00:00.000Z",
      "worker": {
        "id": "uuid",
        "full_name": "Worker Name",
        "email": "worker@example.com"
      }
    }
  ],
  "count": 1
}
```

---

## Field Reference

### Shift Status Values
- `draft` - Shift created but not published
- `published` - Shift is visible and bookable
- `in_progress` - Shift is currently happening
- `completed` - Shift has ended
- `cancelled` - Shift was cancelled

### Booking Status Values
- `pending` - Booking awaiting confirmation
- `confirmed` - Booking confirmed
- `cancelled` - Booking cancelled
- `completed` - Booking completed

### Business Types
- `restaurant`
- `hospitality`
- `retail`
- `healthcare`
- `construction`
- `logistics`
- `events`
- `other`

### Document Types (RTW)
- `passport`
- `visa`
- `national_id`
- `biometric_card`

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Testing

Run the complete marketplace flow test:

```bash
node test-marketplace-complete-flow.js
```

This will test all 16 endpoints in sequence:
1. Business registration
2. Business login
3. Create business profile
4. Get business profile
5. Update business profile
6. Create shift
7. List business shifts
8. Edit shift
9. Worker registration
10. Create worker profile
11. Submit RTW verification
12. List available shifts
13. Book shift
14. View worker bookings
15. View shift bookings
16. Cancel shift

---

## Notes on Field Names

⚠️ **Important:** The database and API use `max_workers` (not `workers_needed`) to represent the maximum number of workers that can be booked for a shift.

**Consistent field naming:**
- Database column: `max_workers`
- API request field: `max_workers`
- API response field: `max_workers`

---

## Route Aliases

For convenience, the following route aliases are available:

| Original Route | Alias Route | Purpose |
|----------------|-------------|---------|
| `/api/business-profiles/:userId` | `/api/business/profile` | Get/update current authenticated business profile |
| `/api/shifts?business_id=X` | `/api/business/shifts` | Get shifts for authenticated business |
| `/api/bookings/my-bookings` | `/api/worker/bookings` | Get bookings for authenticated worker |

---

## Authentication Flow Example

```javascript
// 1. Register or login
const authResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'business@example.com',
    password: 'password123'
  })
});

const { token } = await authResponse.json();

// 2. Use token for authenticated requests
const profileResponse = await fetch('http://localhost:3001/api/business/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const profile = await profileResponse.json();
```

---

This documentation covers all endpoints for the complete marketplace flow. For additional endpoints (users, timesheets, reviews, notifications, etc.), refer to the individual route files in `/src/routes/`.
