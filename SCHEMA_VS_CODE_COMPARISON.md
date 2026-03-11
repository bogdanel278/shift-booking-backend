# Database Schema vs Backend Code Comparison Report
**Generated:** 2026-03-11  
**Status:** ⚠️ MISMATCHES FOUND

---

## Executive Summary

The database schema defines **11 tables**, but the backend only implements **8 tables**. Additionally, there is **1 missing field** in an existing model.

### Tables Status
- ✅ **Fully Implemented:** 7 tables (users, worker_profiles, business_profiles, bookings, timesheets, reviews, notifications)
- ⚠️ **Partially Implemented:** 1 table (shifts - missing search_vector field)
- ❌ **Not Implemented:** 3 tables (payouts, documents, audit_logs)

---

## Detailed Comparison by Table

### 1. ✅ users
- **Schema:** Complete (14 columns)
- **Model:** [userModel.ts](src/models/userModel.ts) - ✅ All columns present
- **Service:** [userService.ts](src/services/userService.ts) - ✅ Implemented
- **Controller:** [userController.ts](src/controllers/userController.ts) - ✅ Implemented
- **Routes:** [userRoutes.ts](src/routes/userRoutes.ts) - ✅ Implemented
- **Status:** ✅ **COMPLETE**

### 2. ✅ worker_profiles
- **Schema:** Complete (13 columns)
- **Model:** [workerProfileModel.ts](src/models/workerProfileModel.ts) - ✅ All columns present
- **Service:** [workerProfileService.ts](src/services/workerProfileService.ts) - ✅ Implemented
- **Controller:** [workerProfileController.ts](src/controllers/workerProfileController.ts) - ✅ Implemented
- **Routes:** [workerProfileRoutes.ts](src/routes/workerProfileRoutes.ts) - ✅ Implemented
- **Status:** ✅ **COMPLETE**

### 3. ✅ business_profiles
- **Schema:** Complete (13 columns)
- **Model:** [businessProfileModel.ts](src/models/businessProfileModel.ts) - ✅ All columns present
- **Service:** [businessProfileService.ts](src/services/businessProfileService.ts) - ✅ Implemented
- **Controller:** [businessProfileController.ts](src/controllers/businessProfileController.ts) - ✅ Implemented
- **Routes:** [businessProfileRoutes.ts](src/routes/businessProfileRoutes.ts) - ✅ Implemented
- **Status:** ✅ **COMPLETE**

### 4. ⚠️ shifts
- **Schema:** Complete (17 columns including `search_vector`)
- **Model:** [shiftModel.ts](src/models/shiftModel.ts) - ⚠️ **MISSING `search_vector` field**
- **Service:** [shiftService.ts](src/services/shiftService.ts) - ✅ Implemented
- **Controller:** [shiftController.ts](src/controllers/shiftController.ts) - ✅ Implemented
- **Routes:** [shiftRoutes.ts](src/routes/shiftRoutes.ts) - ✅ Implemented
- **Status:** ⚠️ **INCOMPLETE**

#### Missing Field:
```typescript
// MISSING in Shift interface:
search_vector: any | null; // TSVECTOR field for full-text search
```

**Impact:** The database trigger `update_shift_search_vector` automatically maintains this field, but TypeScript interface doesn't reflect it. Full-text search functionality may work at DB level but won't be type-safe.

---

### 5. ✅ bookings
- **Schema:** Complete (12 columns)
- **Model:** [bookingModel.ts](src/models/bookingModel.ts) - ✅ All columns present
- **Service:** [bookingService.ts](src/services/bookingService.ts) - ✅ Implemented
- **Controller:** [bookingController.ts](src/controllers/bookingController.ts) - ✅ Implemented
- **Routes:** [bookingRoutes.ts](src/routes/bookingRoutes.ts) - ✅ Implemented
- **Status:** ✅ **COMPLETE**

### 6. ✅ timesheets
- **Schema:** Complete (17 columns)
- **Model:** [timesheetModel.ts](src/models/timesheetModel.ts) - ✅ All columns present
- **Service:** [timesheetService.ts](src/services/timesheetService.ts) - ✅ Implemented
- **Controller:** [timesheetController.ts](src/controllers/timesheetController.ts) - ✅ Implemented
- **Routes:** [timesheetRoutes.ts](src/routes/timesheetRoutes.ts) - ✅ Implemented
- **Status:** ✅ **COMPLETE**

---

### 7. ❌ payouts
- **Schema:** Complete (11 columns)
- **Model:** ❌ **NOT IMPLEMENTED** - No payoutModel.ts
- **Service:** ❌ **NOT IMPLEMENTED** - No payoutService.ts
- **Controller:** ❌ **NOT IMPLEMENTED** - No payoutController.ts
- **Routes:** ❌ **NOT IMPLEMENTED** - No payoutRoutes.ts
- **Status:** ❌ **MISSING COMPLETELY**

#### Schema Details:
```sql
CREATE TABLE payouts (
  id UUID PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES users(id),
  timesheet_id UUID REFERENCES timesheets(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method payment_method NOT NULL,  -- ENUM: bank_transfer, paypal, stripe, cash
  status payout_status DEFAULT 'pending',  -- ENUM: pending, processing, completed, failed, cancelled
  transaction_id VARCHAR(255),
  notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

**Impact:** Payment processing functionality is completely missing. Workers cannot receive payments through the system.

---

### 8. ✅ reviews
- **Schema:** Complete (10 columns)
- **Model:** [reviewModel.ts](src/models/reviewModel.ts) - ✅ All columns present
- **Service:** [reviewService.ts](src/services/reviewService.ts) - ✅ Implemented
- **Controller:** [reviewController.ts](src/controllers/reviewController.ts) - ✅ Implemented
- **Routes:** [reviewRoutes.ts](src/routes/reviewRoutes.ts) - ✅ Implemented
- **Status:** ✅ **COMPLETE**

### 9. ✅ notifications
- **Schema:** Complete (10 columns)
- **Model:** [notificationModel.ts](src/models/notificationModel.ts) - ✅ All columns present
- **Service:** [notificationService.ts](src/services/notificationService.ts) - ✅ Implemented
- **Controller:** [notificationController.ts](src/controllers/notificationController.ts) - ✅ Implemented
- **Routes:** [notificationRoutes.ts](src/routes/notificationRoutes.ts) - ✅ Implemented
- **Status:** ✅ **COMPLETE**

---

### 10. ❌ documents
- **Schema:** Complete (12 columns)
- **Model:** ❌ **NOT IMPLEMENTED** - No documentModel.ts
- **Service:** ❌ **NOT IMPLEMENTED** - No documentService.ts
- **Controller:** ❌ **NOT IMPLEMENTED** - No documentController.ts
- **Routes:** ❌ **NOT IMPLEMENTED** - No documentRoutes.ts
- **Status:** ❌ **MISSING COMPLETELY**

#### Schema Details:
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  type document_type NOT NULL,  -- ENUM: id_card, passport, work_permit, background_check, certification, business_license, insurance, other
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  status document_status DEFAULT 'pending',  -- ENUM: pending, verified, rejected, expired
  notes TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

**Impact:** Document verification system is completely missing. Cannot verify worker credentials or business licenses.

---

### 11. ❌ audit_logs
- **Schema:** Complete (10 columns)
- **Model:** ❌ **NOT IMPLEMENTED** - No auditLogModel.ts
- **Service:** ❌ **NOT IMPLEMENTED** (Read-only model typically doesn't need full service)
- **Controller:** ❌ **NOT IMPLEMENTED**
- **Routes:** ❌ **NOT IMPLEMENTED**
- **Status:** ❌ **MISSING** (Lower priority - system-managed)

#### Schema Details:
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE
);
```

**Note:** Audit logs are automatically populated by database triggers. However, a read-only model would be useful for viewing audit trails through the API.

**Impact:** Cannot query audit trail through API. Security and compliance monitoring is limited to direct database queries.

---

## Missing Backend Files Summary

### Critical (Affects Core Features):
1. ❌ `src/models/payoutModel.ts` - Payment processing model
2. ❌ `src/services/payoutService.ts` - Payment business logic
3. ❌ `src/controllers/payoutController.ts` - Payment API handlers
4. ❌ `src/routes/payoutRoutes.ts` - Payment endpoints
5. ❌ `src/models/documentModel.ts` - Document verification model
6. ❌ `src/services/documentService.ts` - Document verification logic
7. ❌ `src/controllers/documentController.ts` - Document API handlers
8. ❌ `src/routes/documentRoutes.ts` - Document endpoints

### Non-Critical (System/Admin Features):
9. ❌ `src/models/auditLogModel.ts` - Audit trail queries (read-only)
10. ❌ `src/controllers/auditLogController.ts` - Audit trail API (optional)
11. ❌ `src/routes/auditLogRoutes.ts` - Audit trail endpoints (optional)

---

## Field-Level Mismatches

### shifts table
**File:** [src/models/shiftModel.ts](src/models/shiftModel.ts)

**Missing Field:**
```typescript
// Currently in database but NOT in TypeScript interface:
search_vector: any | null; // or string | null
```

**Location to fix:** Line 6-21 in shiftModel.ts (Shift interface)

**Suggested Fix:**
```typescript
export interface Shift {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  location: string;
  requirements: string | null;
  start_time: Date;
  end_time: Date;
  pay_rate: number;
  max_workers: number | null;
  category: string | null;
  status: ShiftStatus;
  search_vector: any | null;  // ← ADD THIS LINE
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
```

---

## ENUM Types Coverage

### ✅ Implemented in Backend:
- `user_role` - ✅ Defined in userModel.ts
- `shift_status` - ✅ Defined in shiftModel.ts
- `booking_status` - ✅ Defined in bookingModel.ts
- `timesheet_status` - ✅ Defined in timesheetModel.ts
- `review_type` - ✅ Defined in reviewModel.ts
- `notification_type` - ✅ Defined in notificationModel.ts

### ❌ Missing in Backend:
- `payment_method` - ❌ Would be in payoutModel.ts (not created)
- `payout_status` - ❌ Would be in payoutModel.ts (not created)
- `document_type` - ❌ Would be in documentModel.ts (not created)
- `document_status` - ❌ Would be in documentModel.ts (not created)

---

## Priority Recommendations

### 🔴 HIGH PRIORITY (Critical for MVP):
1. **Add `search_vector` field to Shift interface** - Low effort, enables full-text search
2. **Implement Payout system** - Critical for worker payments
   - Create payoutModel.ts with complete CRUD
   - Create payoutService.ts with payment validation
   - Create payoutController.ts with proper authorization
   - Create payoutRoutes.ts (POST, GET, PATCH endpoints)
   - Register routes in app.ts

### 🟡 MEDIUM PRIORITY (Important for production):
3. **Implement Document verification system** - Important for compliance
   - Create documentModel.ts with upload/verify methods
   - Create documentService.ts with file validation
   - Create documentController.ts with file handling
   - Create documentRoutes.ts (upload, verify, list endpoints)
   - Register routes in app.ts

### 🟢 LOW PRIORITY (Nice to have):
4. **Implement Audit Log queries** - Read-only access for admins
   - Create auditLogModel.ts with read-only methods
   - Create auditLogController.ts for admin endpoints
   - Create auditLogRoutes.ts (GET only, admin-restricted)

---

## Database Triggers & Functions Status

### ✅ Implemented in Schema:
- ✅ Auto-updating `updated_at` on all tables (9 triggers)
- ✅ Auto-updating `search_vector` on shifts
- ✅ Double-booking prevention on bookings
- ✅ Shift capacity enforcement on bookings
- ✅ Audit logging on important tables (users, shifts, bookings, payouts, timesheets)

### ⚠️ Backend Implementation Notes:
- Triggers work automatically at database level
- Backend doesn't need to handle these manually
- However, backend needs to respect trigger constraints (e.g., handle "Shift is already at full capacity" exception)

---

## Routes Registration Status in app.ts

### ✅ Currently Registered:
```typescript
app.use('/api/users', userRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/worker-profiles', workerProfileRoutes);
app.use('/api/business-profiles', businessProfileRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
```

### ❌ Missing Routes (need to be added after creating files):
```typescript
// TO BE ADDED:
app.use('/api/payouts', payoutRoutes);        // ← Add after creating payoutRoutes.ts
app.use('/api/documents', documentRoutes);    // ← Add after creating documentRoutes.ts
app.use('/api/audit-logs', auditLogRoutes);   // ← Add after creating auditLogRoutes.ts (optional)
```

---

## Impact Assessment

### Current Backend Coverage: 72.7%
- **8 out of 11 tables** have complete implementation
- **40+ API endpoints** currently available
- **3 major tables** completely missing

### Missing Functionality:
1. **Payment Processing** - Cannot pay workers (CRITICAL)
2. **Document Verification** - Cannot verify credentials (HIGH)
3. **Audit Trail API** - Cannot view system logs through API (LOW)

### Risk Level: 🔴 HIGH
The missing payout system means workers cannot receive payments, which is a core marketplace function. This should be prioritized immediately for MVP completion.

---

## Next Steps

1. **Immediate:** Fix search_vector field in shiftModel.ts (5 minutes)
2. **Within 1 day:** Implement complete Payout system (models, services, controllers, routes)
3. **Within 2 days:** Implement Document verification system
4. **Optional:** Implement Audit Log read API (for admin dashboard)

---

**Report End**
