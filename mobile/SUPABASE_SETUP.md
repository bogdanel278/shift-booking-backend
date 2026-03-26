# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for profile picture uploads.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details
5. Wait for the project to be created (this may take a few minutes)

## Step 2: Create Storage Bucket

1. In your Supabase dashboard, navigate to **Storage** in the left sidebar
2. Click **"New Bucket"**
3. Set the bucket name to: `user_profile_pictures`
4. **Important**: Make the bucket **Public** by toggling the "Public bucket" option
5. Click **"Create bucket"**

## Step 3: Set Storage Policies

After creating the bucket, you need to set up policies:

1. Click on the `user_profile_pictures` bucket
2. Go to **Policies** tab
3. Click **"New Policy"**

### Policy 1: Allow Public Read Access
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'user_profile_pictures' );
```

### Policy 2: Allow Authenticated Users to Upload
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'user_profile_pictures' );
```

### Policy 3: Allow Users to Update Their Own Files
```sql
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'user_profile_pictures' )
WITH CHECK ( bucket_id = 'user_profile_pictures' );
```

### Policy 4: Allow Users to Delete Their Own Files
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING ( bucket_id = 'user_profile_pictures' );
```

## Step 4: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (it looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 5: Configure Your Mobile App

1. Create a `.env` file in the `/mobile` directory (if it doesn't exist)
2. Add your Supabase credentials:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Replace `your-project-id` and `your-anon-key-here` with your actual values

## Step 6: Restart Your App

After setting up the `.env` file:

```bash
cd mobile
npm start
```

Then press `r` to reload the app, or restart it completely.

## Testing

1. Log in to the app
2. Go to Profile screen
3. Tap on the profile picture
4. Select "Take Photo" or "Choose from Library"
5. Select a picture
6. You should see console logs with upload progress
7. The picture should appear in your profile

## Troubleshooting

### Issue: "Upload Failed" error

**Check:**
- Bucket exists and is named exactly `user_profile_pictures`
- Bucket is set to **Public**
- Storage policies are created
- Environment variables are set correctly in `.env`
- App was restarted after adding `.env`

### Issue: Picture uploads but shows "error not found"

**Possible causes:**
1. **Bucket is not public** - Go back to Step 2 and make sure the bucket is marked as public
2. **Wrong URL format** - Check console logs for the generated URL
3. **Network issues** - Make sure your device/simulator can access the Supabase URL

### Issue: Console shows "Supabase credentials not found"

**Solution:**
- Make sure `.env` file exists in the `/mobile` directory
- File should start with `.env` (note the dot)
- Restart the Expo dev server completely

### Viewing Uploaded Files

1. Go to Supabase Dashboard > Storage > `user_profile_pictures`
2. You should see folders for each user ID
3. Click to view uploaded images

### Testing URLs Directly

Copy the public URL from the console logs and paste it in your browser. If you can see the image, the URL is correct and the bucket is properly configured.

## Security Note

The current setup allows anyone to read images (public bucket), but only authenticated users can upload. For production, you may want to implement more restrictive policies based on your security requirements.
