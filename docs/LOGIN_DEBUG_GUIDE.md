# 🔍 LOGIN DEBUGGING GUIDE

## Current Status
✅ App is running on web: http://localhost:8081  
✅ Supabase anon key is correctly configured  
✅ Environment variables are loaded

---

## How to Test Login

### Step 1: Open the App
Go to: **http://localhost:8081**

You should see the **Login Screen**

### Step 2: Create a Test Account First

Since you don't have an account yet, you need to register:

1. Click **"Sign Up"** on the login screen
2. Fill in the registration form:
   - **Business Name:** Test Restaurant
   - **Email:** test@example.com
   - **Password:** test123456
   - **Confirm Password:** test123456
3. Click **"Sign Up"**

**Expected Result:**
- ✅ Success message: "Account created successfully! Check your email..."
- ✅ Redirected back to Login screen

### Step 3: Check Your Email

Supabase sends a **verification email** to confirm your account.

**Important:** Check your email inbox for:
- **From:** Supabase
- **Subject:** "Confirm your signup"
- **Action:** Click the confirmation link

### Step 4: Login After Verification

1. Go back to the login screen
2. Enter:
   - **Email:** test@example.com
   - **Password:** test123456
3. Click **"Sign In"**

**Expected Result:**
- ✅ Login successful
- ✅ Automatically navigates to Dashboard
- ✅ Shows "My Shifts" screen

---

## Common Login Issues & Solutions

### Issue 1: "Email not confirmed"

**Problem:** You haven't clicked the verification link in your email

**Solution:**
1. Check your email (including spam folder)
2. Click the confirmation link
3. Try logging in again

**Alternative:** Disable email confirmation in Supabase:
1. Go to Supabase Dashboard
2. **Authentication** → **Email Auth**
3. Turn OFF "Enable email confirmations"

---

### Issue 2: "Invalid login credentials"

**Problem:** Email or password is wrong

**Solution:**
1. Double-check your email and password
2. Make sure you registered first
3. Try registering again with a different email

---

### Issue 3: Login button shows loading forever

**Problem:** Network error or wrong Supabase URL

**Solution:**
1. **Open browser console** (F12 or right-click → Inspect)
2. Go to **Console** tab
3. Look for error messages
4. Check if you see network errors

**Common errors:**
```
❌ "Failed to fetch" → Check your internet connection
❌ "Invalid API key" → Check SUPABASE_ANON_KEY in .env
❌ "Project not found" → Check SUPABASE_URL in .env
```

---

### Issue 4: App shows loading screen forever

**Problem:** Auth state listener not working

**Solution:**
1. Restart the app:
   ```bash
   # Press Ctrl+C in terminal
   npm run web
   ```
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard refresh (Ctrl+Shift+R)

---

## How to Debug Errors

### Option 1: Browser Console (Web)

1. **Open http://localhost:8081**
2. **Press F12** (or right-click → Inspect)
3. Go to **Console** tab
4. Try logging in
5. Look for error messages in red

**What to look for:**
- Network errors
- Supabase errors
- JavaScript errors

### Option 2: Terminal Logs

Watch the terminal where you ran `npm run web`

**What to look for:**
```
LOG  Auth state changed: SIGNED_IN    ← Good! ✅
LOG  Auth state changed: SIGNED_OUT   ← User logged out
ERROR Login error: [message]          ← Problem! ❌
```

---

## Testing Checklist

### ✅ Pre-Login Checklist
- [ ] App loads at http://localhost:8081
- [ ] Login screen appears
- [ ] Can type email and password
- [ ] Sign Up button works

### ✅ Registration Flow
- [ ] Can click "Sign Up"
- [ ] Registration form appears
- [ ] Can fill in all fields
- [ ] Can submit registration
- [ ] Success message appears
- [ ] Email verification sent

### ✅ Login Flow (After Email Verification)
- [ ] Can type email and password
- [ ] Sign In button works
- [ ] No error messages
- [ ] Dashboard appears
- [ ] Shows "My Shifts" header

---

## Quick Test Commands

### Test with an existing Supabase user (if you have one)
```
1. Go to Supabase Dashboard
2. Authentication → Users
3. See if you have any users
4. Use their email + password to login
```

### Test Supabase connection
Open browser console (F12) and run:
```javascript
// This tests if Supabase is configured correctly
import { supabase } from './src/api/supabase.ts'
await supabase.auth.getSession()
// Should return: { data: { session: null }, error: null }
```

---

## What Should Happen (Step by Step)

### Correct Flow:
```
1. Open http://localhost:8081
   → See Login Screen ✅

2. Click "Sign Up"
   → See Registration Form ✅

3. Fill form + Submit
   → Success message ✅
   → Email sent ✅

4. Click email verification link
   → Account confirmed ✅

5. Go back to app + Login
   → Loading spinner appears ✅
   → Dashboard appears ✅
   → See "My Shifts" (0 shifts) ✅

6. Click blue "+" button
   → Create Shift modal opens ✅

7. Fill shift form + Submit
   → Success message ✅
   → Back to Dashboard ✅
   → See your new shift ✅
```

---

## Still Not Working?

### Share these details:

1. **What happens when you click "Sign In"?**
   - Error message?
   - Loading forever?
   - Nothing happens?

2. **Browser Console Errors**
   - Open F12 → Console
   - Copy/paste any red error messages

3. **Network Tab**
   - Open F12 → Network
   - Try logging in
   - Look for failed requests (red)
   - Share the error details

4. **Did you verify your email?**
   - Yes/No
   - Can't find the email

---

## Test Account Setup (Quick Start)

If you want to skip email verification:

### Disable Email Verification in Supabase:
1. Go to https://supabase.com/dashboard
2. Open your project
3. **Authentication** → **Email Auth**
4. **Uncheck** "Enable email confirmations"
5. Save

Now you can:
1. Register → Immediate success (no email needed)
2. Login → Works immediately

---

## Current .env Configuration

Your `.env` is correctly configured:
```env
SUPABASE_URL=https://vekgwgzobfnxoocmnqhs.supabase.co ✅
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ✅
```

---

## Next Steps

1. **Open http://localhost:8081**
2. **Try registering a new account**
3. **Check your email for verification**
4. **Login after verification**
5. **If it fails, share the error message**

The login code is correct - most likely you either:
- Need to register first
- Need to verify your email
- Have email confirmation enabled in Supabase

Let me know what error you see! 🔍
