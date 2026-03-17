# Verify User - Quick Guide

## 🎯 Two Ways to Verify a User Account

---

## Method 1: SQL Query (Fastest) ⚡

### Step 1: Get User Email
Make sure you know the email address of the account you want to verify.

### Step 2: Run SQL in Supabase
1. Go to: https://supabase.com/dashboard/project/vekgwgzobfnxoocmnqhs/editor
2. Click "SQL Editor" in the left sidebar
3. Click "+ New query"
4. Paste this SQL (replace `user@example.com` with the actual email):

```sql
-- Find user by email and update verification status
UPDATE business_profiles
SET v_status = 'verified'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);

-- Verify the change
SELECT 
  u.email,
  bp.v_status,
  bp.company_name,
  bp.business_address
FROM auth.users u
JOIN business_profiles bp ON bp.user_id = u.id
WHERE u.email = 'user@example.com';
```

5. Click "Run" (or press Cmd+Enter)
6. Check the results - `v_status` should now be `'verified'`

### Done! ✅
The user can now create shifts immediately.

---

## Method 2: Node.js Script

### Step 1: Get User ID
1. Go to: https://supabase.com/dashboard/project/vekgwgzobfnxoocmnqhs/auth/users
2. Find the user by email
3. Copy their UUID (looks like: `123e4567-e89b-12d3-a456-426614174000`)

### Step 2: Run Script
```bash
node scripts/verify-user.js <user_id>
```

Example:
```bash
node scripts/verify-user.js 123e4567-e89b-12d3-a456-426614174000
```

---

## Method 3: Direct SQL by User ID (If you have it)

```sql
-- Update by user_id directly
UPDATE business_profiles
SET v_status = 'verified'
WHERE user_id = '123e4567-e89b-12d3-a456-426614174000';

-- Check the result
SELECT * FROM business_profiles WHERE user_id = '123e4567-e89b-12d3-a456-426614174000';
```

---

## 🔍 Check Current Status

To see all users and their verification status:

```sql
SELECT 
  u.email,
  u.created_at,
  bp.v_status,
  bp.company_name,
  bp.business_address,
  bp.company_number
FROM auth.users u
LEFT JOIN business_profiles bp ON bp.user_id = u.id
ORDER BY u.created_at DESC;
```

---

## 🎯 Quick SQL Templates

### Verify Multiple Users at Once:
```sql
UPDATE business_profiles
SET v_status = 'verified'
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('user1@example.com', 'user2@example.com', 'user3@example.com')
);
```

### Set Status to Pending:
```sql
UPDATE business_profiles
SET v_status = 'pending'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

### Set Status to Rejected:
```sql
UPDATE business_profiles
SET v_status = 'rejected'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

### Reset to Unverified:
```sql
UPDATE business_profiles
SET v_status = 'unverified'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

---

## 🧪 Testing After Verification

1. **Reload the app** on your device (pull down to refresh or restart)
2. **Check Profile screen** - Badge should show "Verified" in green
3. **Check Dashboard** - "Create Shift" button should be enabled (blue)
4. **Click Create Shift** - Should see the form (not lock screen)
5. **Create a test shift** - Should work without errors

---

## ⚠️ Troubleshooting

### "No rows updated"
- User might not have a business_profiles record yet
- Solution: Have user complete profile in the app first

### "User not found"
- Check email spelling
- Check user exists in Authentication → Users

### Changes not showing in app
- Pull down to refresh the screen
- Or fully close and restart the app
- App checks verification status on each screen load

---

## 📝 What Email Do You Want to Verify?

Just provide me with the email address and I'll give you the exact SQL to run!

Format: `user@example.com`
