# Authentication & Right-to-Work Verification Audit Report
**Date:** 2026-03-11  
**Project:** Shift Booking Backend

---

## PART 1: AUDIT FINDINGS

### ✅ What Already EXISTS:

#### Database Schema:
- ✅ `users` table with `password_hash` column
- ✅ `worker_profiles` table (basic fields)
- ✅ `business_profiles` table (basic fields)
- ✅ User role ENUM: 'worker' | 'business'
- ✅ Email uniqueness constraint
- ✅ Soft delete support (deleted_at)

#### Backend Code:
- ✅ UserModel with CRUD operations
- ✅ WorkerProfileModel with CRUD operations
- ✅ BusinessProfileModel with CRUD operations
- ✅ UserService (basic)
- ✅ Basic error handling middleware
- ✅ CORS support
- ✅ PostgreSQL connection configured

### ❌ What's MISSING:

#### Authentication & Authorization:
- ❌ No JWT token generation/verification
- ❌ No bcrypt password hashing
- ❌ No registration endpoints (POST /api/auth/register/worker, POST /api/auth/register/business)
- ❌ No login endpoint (POST /api/auth/login)
- ❌ No authentication middleware (validateToken)
- ❌ No role-based authorization middleware
- ❌ No "me" endpoint (GET /api/auth/me)
- ❌ No auth routes or controller

#### Right-to-Work Verification:
- ❌ No right_to_work_verifications table
- ❌ No right-to-work models
- ❌ No right-to-work service
- ❌ No right-to-work controller
- ❌ No right-to-work routes
- ❌ No Vouchsafe integration service
- ❌ No verification endpoints

#### Database schema gaps:
- ❌ Users table missing: first_name, last_name (currently has "name")
- ❌ Worker profiles missing: date_of_birth, address_line_1, address_line_2, city, postcode, nationality, right_to_work_status
- ❌ Business profiles missing: company_number, business_type, contact_name, business_address (has generic "address")
- ❌ No right_to_work_verifications table

#### NPM Packages:
- ❌ bcrypt or bcryptjs not installed
- ❌ jsonwebtoken not installed
- ❌ @types/bcrypt not installed
- ❌ @types/jsonwebtoken not installed
- ❌ axios not installed (for Vouchsafe API calls)
- ❌ @types/axios not installed

### 📋 Files to CREATE:

1. **Middleware:**
   - src/middleware/authMiddleware.ts (JWT validation)
   - src/middleware/roleMiddleware.ts (role checking)

2. **Auth System:**
   - src/controllers/authController.ts
   - src/routes/authRoutes.ts
   - src/services/authService.ts
   - src/utils/jwt.ts
   - src/utils/passwordUtils.ts

3. **Right-to-Work System:**
   - src/models/rightToWorkModel.ts
   - src/services/rightToWorkService.ts
   - src/services/vouchsafeService.ts
   - src/controllers/rightToWorkController.ts
   - src/routes/rightToWorkRoutes.ts

4. **Testing:**
   - scripts/testRightToWork.ts

5. **Database:**
   - database-migrations/003_auth_rtw.sql (new migration)

### 📝 Files to MODIFY:

1. **Database Schema:**
   - database-schema-complete.sql (add right_to_work_verifications table, update users/profiles)

2. **Models:**
   - src/models/userModel.ts (add first_name, last_name fields)
   - src/models/workerProfileModel.ts (add RTW fields)
   - src/models/businessProfileModel.ts (add missing fields)

3. **Application:**
   - src/app.ts (register auth and RTW routes)
   - package.json (add new scripts)
   - .env (add JWT and Vouchsafe variables)

---

## PART 2: IMPLEMENTATION PLAN

### Phase 1: NPM Packages & Environment
- Install bcryptjs, jsonwebtoken, axios, @types/bcryptjs, @types/jsonwebtoken, @types/axios
- Update .env with JWT_SECRET, JWT_EXPIRES_IN, Vouchsafe credentials

### Phase 2: Database Schema Updates
- Add first_name, last_name to users (split name)
- Add RTW fields to worker_profiles
- Add missing fields to business_profiles
- Create right_to_work_verifications table

### Phase 3: Authentication System
- Create password hashing utilities
- Create JWT utilities
- Create auth service (register, login)
- Create auth controller
- Create auth middleware
- Create role middleware
- Create auth routes
- Update app.ts

### Phase 4: Right-to-Work Verification
- Create right_to_work_verifications model
- Create Vouchsafe service
- Create right-to-work service
- Create right-to-work controller
- Create right-to-work routes
- Update app.ts

### Phase 5: Testing
- Create terminal test script
- Add npm test:rtw script

---

## PART 3: REQUIRED ENVIRONMENT VARIABLES

```env
# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Vouchsafe Integration
VOUCHSAFE_CLIENT_ID=cmmm59d400001viihnspty8e5
VOUCHSAFE_CLIENT_SECRET=your-vouchsafe-client-secret
VOUCHSAFE_BASE_URL=https://api.vouchsafe.co.uk
VOUCHSAFE_ENVIRONMENT=sandbox
```

---

## PART 4: ARCHITECTURE DECISIONS

1. **Password Hashing:** bcryptjs with salt rounds = 10
2. **JWT:** HS256 algorithm, 7-day expiration by default
3. **Token Storage:** Client-side (not stored in DB)
4. **Authorization:** Bearer token in Authorization header
5. **Right-to-Work Storage:** Minimal sensitive data, encrypted passport numbers
6. **Vouchsafe Integration:** Isolated service layer, easy to swap providers
7. **Verification Flow:** Async (submit → pending → provider check → approved/rejected)

---

## PART 5: API ENDPOINTS TO IMPLEMENT

### Authentication:
- POST /api/auth/register/worker
- POST /api/auth/register/business
- POST /api/auth/login
- GET /api/auth/me

### Right-to-Work:
- POST /api/workers/right-to-work/submit
- GET /api/workers/right-to-work/status
- GET /api/admin/right-to-work/pending (admin only)
- PATCH /api/admin/right-to-work/:id/review (admin only)

---

**End of Audit Report**
