# Business Verification System - Setup & Implementation Guide

## 🎯 Overview

Complete business verification system with:
- ✅ Companies House API integration for UK business lookup
- ✅ Insurance document upload to Supabase Storage
- ✅ Shift creation guarding (verified businesses only)
- ✅ Indeed Flex-style UI with high contrast and clean design
- ✅ Auto-fill business address in shift creation

---

## 📋 Prerequisites

### 1. Companies House API Key
1. Register at https://developer.company-information.service.gov.uk/
2. Create an API key (free tier available)
3. Add to `.env` file:
```bash
COMPANIES_HOUSE_API_KEY=your_api_key_here
```

### 2. Supabase Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Create new bucket: `verification-docs`
3. Settings:
   - Public: **NO** (private)
   - File size limit: 5MB
   - Allowed types: `application/pdf`

---

## 🚀 Installation Steps

### Step 1: Database Migration
Run the SQL migration in Supabase SQL Editor:
```bash
# File location:
docs/database_migration_verification.sql
```

This will:
- Create `verification_status` enum type
- Add verification columns to `business_profiles`
- Set up storage policies for insurance documents

### Step 2: Install Dependencies
```bash
# Already installed in the project:
npx expo install expo-document-picker
```

### Step 3: Environment Variables
Create/update `.env` file:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
COMPANIES_HOUSE_API_KEY=your_companies_house_key
```

### Step 4: Start Development Server
```bash
npm start
# or
npx expo start --clear
```

---

## 📁 Files Created/Modified

### New Files Created:
1. **`src/services/companiesHouseService.ts`**
   - Companies House API integration
   - Company data fetching and validation
   - Address formatting utilities

2. **`src/components/modals/VerificationModal.tsx`**
   - Full verification flow UI
   - Company number input + auto-fetch
   - Insurance document upload
   - Submission to Supabase

3. **`src/components/modals/VerificationRequiredModal.tsx`**
   - Clean modal shown when unverified users try to create shifts
   - Redirect to profile verification
   - Feature list display

4. **`docs/database_migration_verification.sql`**
   - Complete database schema updates
   - Storage bucket policies

### Modified Files:
1. **`src/types/database.ts`**
   - Added verification fields to business_profiles type
   - Added v_status enum type

2. **`src/screens/ProfileHubScreen.tsx`**
   - Added verification status tracking
   - New "Business Verification" tile with status badge
   - Badge colors: Red (Unverified), Amber (Pending), Green (Verified)

3. **`src/screens/DashboardScreen.tsx`**
   - Verification status check before shift creation
   - Disabled FAB button style when not verified
   - VerificationRequiredModal integration

4. **`src/screens/CreateShiftScreen.tsx`**
   - Already has address auto-fill from business profile
   - Works with new business_address column

---

## 🎨 UI/UX Features

### Verification Badge Colors
```typescript
'unverified' → Red badge (#F44336)
'pending'    → Amber badge (#FF9800)
'verified'   → Green badge (#4CAF50)
'rejected'   → Red badge (#F44336)
```

### Disabled Create Shift Button
- Opacity: 0.5
- Background: Gray (#B0B0B0)
- Shows modal on click explaining verification requirement

### Profile Verification Tile
- Icon: 🔐
- Position: First tile in ProfileHub
- Subtitle: "Verify identity and upload insurance"
- Badge: Dynamic status indicator

---

## 🔄 User Flow

### For New Businesses:
1. **Sign Up** → Account created (v_status: 'unverified')
2. **Complete Profile** → Add basic info
3. **Try to Create Shift** → Blocked with modal
4. **Click "Complete Verification"** → Redirected to ProfileHub
5. **Open Verification Tile** → VerificationModal opens
6. **Enter Company Number** → Fetch from Companies House
7. **Company Data Auto-Fills** → Trading name and address populated
8. **Upload Insurance PDF** → Required document
9. **Submit for Review** → v_status changes to 'pending'
10. **Admin Reviews** (manual step) → v_status becomes 'verified'
11. **Create Shifts** ✅ → Now unlocked

### For Verified Businesses:
1. **Login** → Dashboard shows shifts
2. **Click Create Shift** → Opens CreateShiftScreen
3. **Location Auto-Filled** → From business_address
4. **Fill Other Fields** → Date, time, pay rate, etc.
5. **Submit** → Shift created ✅

---

## 🔒 Security Features

### Storage Policies:
- Users can only upload to their own folder
- Users can only read their own documents
- Path structure: `{userId}/{filename}`

### Verification Checks:
- Frontend: Button disabled if not verified
- Backend: Should add RLS policy to shifts table
  ```sql
  CREATE POLICY "Only verified businesses can create shifts"
  ON shifts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE user_id = auth.uid()
      AND v_status = 'verified'
    )
  );
  ```

---

## 🧪 Testing Checklist

### Verification Flow:
- [ ] Enter valid UK company number (e.g., "00000006")
- [ ] Fetch company data from Companies House API
- [ ] Verify company name and address auto-fill
- [ ] Upload insurance PDF (< 5MB)
- [ ] Submit and check v_status changes to 'pending'
- [ ] Manually update v_status to 'verified' in Supabase
- [ ] Verify Create Shift button becomes enabled

### Shift Creation Guard:
- [ ] Try creating shift when unverified → Modal shown
- [ ] Check FAB button is grayed out
- [ ] Click "Complete Verification" → Redirects to Profile
- [ ] After verification → Create Shift works

### Address Auto-Fill:
- [ ] Open CreateShiftScreen
- [ ] Verify location field pre-filled with business_address
- [ ] Can override with "Use different location"
- [ ] Submit shift with auto-filled location

---

## 📊 Database Schema Reference

### business_profiles Table (New Columns):
```sql
v_status             verification_status  DEFAULT 'unverified'
company_number       TEXT                 NULL
vat_number           TEXT                 NULL  (optional)
insurance_doc_url    TEXT                 NULL
business_address     TEXT                 NULL
trading_name         TEXT                 NULL
```

### verification_status Enum:
```sql
'unverified' | 'pending' | 'verified' | 'rejected'
```

---

## 🐛 Troubleshooting

### Companies House API Issues:
```typescript
// Error: 404 Company not found
→ Check company number format (8 digits or 2 letters + 6 digits)

// Error: 401 Unauthorized
→ Verify API key in .env file
→ Check Base64 encoding: btoa(`${API_KEY}:`)

// Error: CORS issues
→ Use Expo Go or device, not web browser
```

### Document Upload Issues:
```typescript
// Error: No bucket found
→ Create 'verification-docs' bucket in Supabase Storage

// Error: Permission denied
→ Check storage policies are applied
→ Verify user is authenticated

// Error: File too large
→ Max size is 5MB for PDFs
→ Compress PDF before upload
```

### Verification Status Not Updating:
```typescript
// Check database query:
SELECT v_status FROM business_profiles WHERE user_id = 'your-user-id';

// Manually update for testing:
UPDATE business_profiles 
SET v_status = 'verified' 
WHERE user_id = 'your-user-id';
```

---

## 🎯 Admin Panel (Future Enhancement)

To complete the system, build an admin dashboard to:
1. View all pending verifications
2. Review uploaded insurance documents
3. Approve/reject verifications
4. Send email notifications to businesses

Suggested tech stack:
- Next.js admin dashboard
- Supabase RLS with admin role
- Email service (SendGrid/Resend)

---

## 📚 API Reference

### Companies House API Endpoint:
```
GET https://api.company-information.service.gov.uk/company/{company_number}

Headers:
  Authorization: Basic {base64(API_KEY:)}
  Accept: application/json

Response:
{
  "company_name": "STRING",
  "company_number": "STRING",
  "registered_office_address": {
    "address_line_1": "STRING",
    "locality": "STRING",
    "postal_code": "STRING",
    "country": "STRING"
  },
  "company_status": "active",
  "type": "ltd",
  ...
}
```

### Supabase Storage Upload:
```typescript
const { data, error } = await supabase.storage
  .from('verification-docs')
  .upload(`${userId}/${filename}`, blob, {
    contentType: 'application/pdf',
    upsert: false
  });
```

---

## ✅ Success Criteria

System is working correctly when:
1. ✅ Unverified users cannot create shifts
2. ✅ Verification modal shows company data from Companies House
3. ✅ Insurance documents upload to Supabase Storage
4. ✅ Verification status updates from 'unverified' → 'pending'
5. ✅ Profile badge shows correct color
6. ✅ Create Shift button enables after verification
7. ✅ Business address auto-fills in CreateShiftScreen

---

**Status**: ✅ Fully Implemented  
**Version**: 1.0  
**Last Updated**: March 16, 2026
