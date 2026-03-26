# Authentication & Right-to-Work Verification API Documentation
**Version:** 1.0.0  
**Base URL:** `http://localhost:3000/api`

---

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Right-to-Work Verification Endpoints](#right-to-work-verification-endpoints)
3. [Sample Requests](#sample-requests)
4. [Error Responses](#error-responses)

---

## Authentication Endpoints

### 1. Register Worker
**POST** `/auth/register/worker`

Register a new worker account.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "phone": "+447123456789"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Worker registered successfully",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "worker",
      "is_verified": false,
      "is_active": true,
      "created_at": "2026-03-11T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Register Business
**POST** `/auth/register/business`

Register a new business account.

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@company.com",
  "password": "SecurePass123!",
  "phone": "+447987654321",
  "company_name": "Acme Corporation",
  "company_number": "12345678",
  "business_type": "Limited Company",
  "business_address": "123 Business St, London, SW1A 1AA"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Business registered successfully",
  "data": {
    "user": {
      "id": "223e4567-e89b-12d3-a456-426614174000",
      "name": "Jane Smith",
      "email": "jane@company.com",
      "role": "business",
      "is_verified": false,
      "is_active": true,
      "created_at": "2026-03-11T10:35:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Login
**POST** `/auth/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "worker",
      "is_verified": false,
      "is_active": true,
      "last_login_at": "2026-03-11T10:40:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Get Current User
**GET** `/auth/me`

Get the currently authenticated user's information.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "worker",
    "is_verified": false,
    "is_active": true,
    "created_at": "2026-03-11T10:30:00Z"
  }
}
```

---

## Right-to-Work Verification Endpoints

### 1. Submit Verification (Passport)
**POST** `/workers/right-to-work/submit`

Submit a passport for right-to-work verification.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "verification_method": "passport",
  "passport_number": "AB1234567",
  "passport_country": "GBR",
  "passport_expiry_date": "2028-12-31"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Right-to-work verification submitted successfully",
  "data": {
    "id": "323e4567-e89b-12d3-a456-426614174000",
    "worker_user_id": "123e4567-e89b-12d3-a456-426614174000",
    "verification_method": "passport",
    "status": "pending",
    "passport_number": "*******4567",
    "passport_country": "GBR",
    "passport_expiry_date": "2028-12-31",
    "submitted_at": "2026-03-11T10:45:00Z"
  }
}
```

---

### 2. Submit Verification (Visa)
**POST** `/workers/right-to-work/submit`

Submit a visa for right-to-work verification.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "verification_method": "visa",
  "visa_type": "Tier 2 General",
  "visa_expiry_date": "2027-06-30",
  "visa_reference": "GWF-1234567890"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Right-to-work verification submitted successfully",
  "data": {
    "id": "423e4567-e89b-12d3-a456-426614174000",
    "worker_user_id": "123e4567-e89b-12d3-a456-426614174000",
    "verification_method": "visa",
    "status": "pending",
    "visa_type": "Tier 2 General",
    "visa_expiry_date": "2027-06-30",
    "visa_reference": "GWF-1234567890",
    "submitted_at": "2026-03-11T10:50:00Z"
  }
}
```

---

### 3. Submit Verification (Share Code)
**POST** `/workers/right-to-work/submit`

Submit a share code for automatic right-to-work verification via Vouchsafe.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "verification_method": "share_code",
  "share_code": "PASS12345",
  "date_of_birth": "1990-05-15"
}
```

**Sandbox Test Codes:**
- `PASS12345` - Verification will pass
- `FAIL12345` - Verification will fail
- `ERROR1234` - Will trigger an error

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Right-to-work verification submitted successfully",
  "data": {
    "id": "523e4567-e89b-12d3-a456-426614174000",
    "worker_user_id": "123e4567-e89b-12d3-a456-426614174000",
    "verification_method": "share_code",
    "status": "approved",
    "share_code": "PAS*****45",
    "provider_name": "Vouchsafe",
    "provider_reference": "VOUCHSAFE-1710155555000",
    "submitted_at": "2026-03-11T10:55:00Z",
    "checked_at": "2026-03-11T10:55:01Z"
  }
}
```

---

### 4. Get Verification Status
**GET** `/workers/right-to-work/status`

Get the current verification status for the authenticated worker.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "has_verification": true,
    "status": "approved",
    "verification": {
      "id": "523e4567-e89b-12d3-a456-426614174000",
      "verification_method": "share_code",
      "status": "approved",
      "provider_name": "Vouchsafe",
      "submitted_at": "2026-03-11T10:55:00Z",
      "checked_at": "2026-03-11T10:55:01Z"
    }
  }
}
```

---

### 5. Get Pending Verifications (Admin)
**GET** `/admin/right-to-work/pending`

Get all pending verifications for admin review.

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "323e4567-e89b-12d3-a456-426614174000",
      "worker_user_id": "123e4567-e89b-12d3-a456-426614174000",
      "worker_name": "John Doe",
      "worker_email": "john.doe@example.com",
      "verification_method": "passport",
      "status": "pending",
      "passport_number": "*******4567",
      "passport_country": "GBR",
      "passport_expiry_date": "2028-12-31",
      "submitted_at": "2026-03-11T10:45:00Z"
    },
    {
      "id": "423e4567-e89b-12d3-a456-426614174000",
      "worker_user_id": "223e4567-e89b-12d3-a456-426614174000",
      "worker_name": "Jane Worker",
      "worker_email": "jane.worker@example.com",
      "verification_method": "visa",
      "status": "pending",
      "visa_type": "Tier 2 General",
      "visa_expiry_date": "2027-06-30",
      "submitted_at": "2026-03-11T11:00:00Z"
    }
  ]
}
```

---

### 6. Review Verification (Admin)
**PATCH** `/admin/right-to-work/:id/review`

Approve or reject a pending verification.

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

**Request Body:**
```json
{
  "status": "approved",
  "notes": "Passport verified successfully. Document is valid."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Verification reviewed successfully",
  "data": {
    "id": "323e4567-e89b-12d3-a456-426614174000",
    "worker_user_id": "123e4567-e89b-12d3-a456-426614174000",
    "verification_method": "passport",
    "status": "approved",
    "passport_number": "*******4567",
    "passport_country": "GBR",
    "passport_expiry_date": "2028-12-31",
    "submitted_at": "2026-03-11T10:45:00Z",
    "checked_at": "2026-03-11T11:10:00Z",
    "checked_by_user_id": "admin-user-id",
    "notes": "Passport verified successfully. Document is valid."
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: first_name, last_name, email, password"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid or expired token"
}
```

### 409 Conflict
```json
{
  "error": "Email already registered"
}
```

### 422 Unprocessable Entity
```json
{
  "error": "Password must be at least 8 characters long"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

---

## Authentication Flow

1. **Register** as worker or business → Receive JWT token
2. **Login** with credentials → Receive JWT token
3. **Include token** in Authorization header for protected endpoints
4. Token expires after 7 days (configurable)

---

## Right-to-Work Verification Flow

### For Workers:
1. Submit verification with one of three methods:
   - Passport (manual review)
   - Visa (manual review)
   - Share code (automatic via Vouchsafe)
2. Wait for approval/rejection
3. Check status anytime

### For Admins:
1. View pending verifications
2. Review documents/details
3. Approve or reject with notes

---

## Testing

### Run Terminal Test Script:
```bash
npm run test:rtw
```

This interactive script will guide you through:
- Logging in
- Selecting verification method
- Entering required details
- Submitting verification
- Checking status

---

**End of Documentation**
