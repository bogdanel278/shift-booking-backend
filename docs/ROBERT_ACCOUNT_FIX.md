# 🔒 Why robert@gmail.com Cannot Create Shifts

## ❌ **Root Cause: Account Not Verified**

Your account **"Robert's Restaurant"** has verification status: **`unverified`**

The app has a **hard guard** on the CreateShift screen that blocks all unverified businesses from posting shifts. This is a security feature to ensure only legitimate businesses can post shifts.

---

## 📊 Current Account Status

```
User: robert@gmail.com
Company: Robert's Restaurant
User ID: 6d10849a-8bd9-46e3-90da-edc2580241d2
Verification Status: ❌ UNVERIFIED
Created: March 12, 2026
Can Create Shifts: ❌ NO
```

---

## 🚫 What You're Seeing

When you try to create a shift, you see a **lock screen** with:

```
🔒 Verification Required

You must complete business verification 
before you can post shifts.

This helps us ensure all shifts are posted 
by legitimate businesses.

[Go to Verification]

⏳ Your verification is pending review (if you submitted)
```

This is the security guard implemented in `CreateShiftScreen.tsx`

---

## ✅ **3 Ways to Fix This**

### **Option 1: Proper Verification (Production Method)** ⭐ Recommended

1. Open the app
2. Go to **Profile Hub**
3. Tap **"Business Verification"** (first tile)
4. Fill in the verification form:
   - UK Company Number (e.g., 12345678)
   - VAT Number (e.g., GB999999999)
   - Upload Insurance Document (PDF)
5. Tap **Submit for Verification**
6. Status changes to **"Pending"**
7. Admin approves → Status becomes **"Verified"** ✅
8. You can now create shifts!

**Note**: For testing, you can approve yourself using Option 2 or 3.

---

### **Option 2: Manual Approval in Supabase Dashboard** (Quick)

1. Open Supabase Dashboard: https://vekgwgzobfnxoocmnqhs.supabase.co
2. Go to **Table Editor**
3. Select **`business_profiles`** table
4. Find the row with:
   - `company_name = "Robert's Restaurant"`
   - `user_id = "6d10849a-8bd9-46e3-90da-edc2580241d2"`
5. Click on the `v_status` field
6. Change from `unverified` → `verified`
7. Save
8. ✅ Done! Reload app and try creating a shift

---

### **Option 3: SQL Script** (Fastest) ⚡

**Copy and paste this into Supabase SQL Editor:**

```sql
-- Verify Robert's Restaurant account
UPDATE business_profiles
SET v_status = 'verified',
    company_number = 'DEV123456',
    vat_number = 'GB999999999',
    business_address = '123 Test Street, London, UK'
WHERE user_id = '6d10849a-8bd9-46e3-90da-edc2580241d2'
AND company_name = 'Robert''s Restaurant';

-- Verify it worked
SELECT 
  company_name,
  v_status,
  company_number,
  created_at
FROM business_profiles
WHERE user_id = '6d10849a-8bd9-46e3-90da-edc2580241d2';
```

**Expected result:**
```
company_name        | v_status | company_number | created_at
--------------------|----------|----------------|---------------------------
Robert's Restaurant | verified | DEV123456      | 2026-03-12T13:28:33...
```

✅ **Account now verified! You can create shifts immediately.**

---

## 🔍 How to Confirm It's Fixed

### Method 1: Check in App
1. Close and reopen the app
2. Go to **Profile Hub**
3. Look at **Business Verification** tile
4. Badge should show: **"Verified"** in green ✅
5. Try to create a shift
6. Should work without lock screen!

### Method 2: Check in Database
```sql
SELECT v_status FROM business_profiles 
WHERE user_id = '6d10849a-8bd9-46e3-90da-edc2580241d2';
```
Should return: `verified`

---

## 📋 All Accounts Status Summary

Currently you have **13 business profiles** in the database:

| # | Company Name | Status | Can Create Shifts? |
|---|--------------|--------|--------------------|
| 1 | Cafe | ✅ Verified | ✅ YES |
| 2 | **Robert's Restaurant** | ❌ Unverified | ❌ **NO** ← This is robert@gmail.com |
| 3-13 | Various test accounts | ❌ Unverified | ❌ NO |

Only **Profile #1 (Cafe)** can create shifts right now.

---

## 🎯 Quick Fix Command

**Just run this SQL and you're done:**

```sql
UPDATE business_profiles
SET v_status = 'verified'
WHERE user_id = '6d10849a-8bd9-46e3-90da-edc2580241d2';
```

---

## 🤔 Why This Security Guard Exists

This was implemented in the **Business Verification System** (following BUSINESS_CORE_SPEC.md):

**Purpose:**
- Prevent spam shifts from unverified businesses
- Ensure only legitimate companies can hire workers
- Protect workers from fraudulent job postings
- Comply with UK employment regulations
- Build trust in the platform

**Code Location:**
- `src/screens/CreateShiftScreen.tsx` (lines 227-271)
- Hard guard checks `v_status` on mount
- Shows lock screen if not verified
- Only allows shift creation if `v_status === 'verified'`

---

## 🔧 For Development Testing

If you want to **disable the verification guard** temporarily for testing:

### Option A: Comment out the guard
In `CreateShiftScreen.tsx`, find this code around line 227:

```typescript
// HARD GUARD: Show verification required screen if not verified
if (checkingVerification) {
    return (
        <View style={styles.container}>
            <View style={styles.centerContent}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Checking verification status...</Text>
            </View>
        </View>
    );
}

if (verificationStatus !== 'verified') {
    return (
        // ... lock screen UI
    );
}
```

**Comment it out:**
```typescript
// Temporarily disabled for testing
// if (verificationStatus !== 'verified') {
//     return (
//         // ... lock screen UI
//     );
// }
```

**⚠️ Warning:** Don't forget to re-enable this in production!

---

## 📞 Need Help?

**Files to check:**
- `scripts/verify-robert-account.sql` - Ready-to-run SQL fix
- `scripts/diagnose-robert.js` - Diagnostic script
- `docs/VERIFY_USER_GUIDE.md` - Detailed verification guide

**Quick verification:**
```bash
node scripts/diagnose-robert.js
```

---

## ✅ **Recommended Action**

**Run this now in Supabase SQL Editor:**

```sql
UPDATE business_profiles
SET v_status = 'verified'
WHERE company_name = 'Robert''s Restaurant';
```

Then reload your app and try creating a shift. Should work immediately! 🚀

---

**Status**: Issue identified ✅  
**Fix available**: Yes ✅  
**Estimated fix time**: 30 seconds ⚡
