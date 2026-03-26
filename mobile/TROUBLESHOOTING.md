# Profile Picture Upload - Troubleshooting Guide

## What I've Fixed

I've added comprehensive debugging and diagnostics to help identify the issue:

### 1. Enhanced Error Handling
- ✅ Added image load error detection in ProfileScreen
- ✅ Shows alert when image fails to load with the URL
- ✅ Falls back to initials avatar on error

### 2. Improved Upload Service
- ✅ Detailed console logging throughout upload process
- ✅ Logs file size, type, path, and generated URL
- ✅ Better error messages with full error details

### 3. Added Diagnostics Tool
- ✅ Created `/mobile/src/services/supabaseDiagnostics.ts`
- ✅ Added "Run Supabase Diagnostics" button in Profile screen (Settings section)
- ✅ Checks bucket existence, public access, and upload capability

### 4. Created Setup Guide
- ✅ Created `/mobile/SUPABASE_SETUP.md` with step-by-step instructions

## Next Steps to Fix Your Issue

### Step 1: Check Supabase Configuration

1. Do you have a Supabase project set up?
2. Check if you have a `.env` file in `/mobile/` directory

If NOT, create `/mobile/.env` with:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 2: Run Diagnostics

1. Restart your app if you just added/modified `.env`
2. Go to Profile screen
3. Scroll down to Settings
4. Tap **"Run Supabase Diagnostics"**
5. Check the console output

The diagnostics will tell you exactly what's wrong:
- ❌ Bucket doesn't exist
- ❌ Bucket is not public
- ❌ Cannot upload files
- ❌ Missing credentials

### Step 3: Fix Based on Diagnostics

#### If "Supabase credentials not found":
1. Make sure `.env` file exists in `/mobile/` directory
2. Make sure it has the correct values
3. Restart Expo completely: Stop server, then `npm start`

#### If "Bucket not found":
1. Go to Supabase Dashboard > Storage
2. Click "New Bucket"
3. Name it exactly: `user_profile_pictures`
4. Make it **Public** ✓
5. Click Create

#### If "Bucket is not public":
1. Go to Supabase Dashboard > Storage
2. Click on `user_profile_pictures` bucket
3. Click the 3 dots menu > Edit bucket
4. Toggle "Public bucket" to ON
5. Save

#### If "Upload test failed":
This means policies are missing. Go to your bucket:
1. Click on bucket > Policies tab
2. Add these policies:

**Public Read:**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'user_profile_pictures' );
```

**Authenticated Upload:**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'user_profile_pictures' );
```

### Step 4: Test Again

After fixing the issues:
1. Go to Profile screen
2. Tap on your profile picture
3. Select "Take Photo" or "Choose from Library"
4. Watch the console for detailed logs:
   - `=== UPLOAD DEBUG INFO ===`
   - File details
   - Upload status
   - Public URL

5. The success alert will now show the URL
6. If image still doesn't load, the Image component will show an error alert with the URL

### Step 5: Check in Browser

Copy the URL from the success alert or error message and paste it in your browser. If you can see the image in your browser, the upload worked but there might be a React Native Image loading issue.

## Common Issues

### Issue: Image uploads but shows "error not found"

**Most likely cause:** Bucket is not public

**Solution:**
1. Make bucket public (see Step 3 above)
2. Try uploading again
3. Old URLs from when bucket was private won't work - upload a new picture

### Issue: "Network request failed"

**Possible causes:**
- Wrong Supabase URL in `.env`
- Internet connection issue
- Supabase project is paused (free tier)

### Issue: Console shows URL but image won't display

**Debug steps:**
1. Copy the URL from console
2. Open it in your phone/simulator browser
3. If it loads there but not in the app, check image format
4. If it doesn't load in browser either, bucket is not public

## Files Changed

- `/mobile/src/screens/ProfileScreen.tsx` - Added error handling, diagnostics button
- `/mobile/src/services/uploadService.ts` - Enhanced logging
- `/mobile/src/services/supabaseDiagnostics.ts` - New diagnostics tool
- `/mobile/SUPABASE_SETUP.md` - Detailed setup instructions

## Need More Help?

Check the console logs when you:
1. Upload a picture
2. Load the profile screen
3. Run diagnostics

The logs will show exactly what's happening at each step.
