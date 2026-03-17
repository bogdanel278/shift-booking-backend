# 🗂️ Create Storage Bucket - Quick Guide

## Step-by-Step Instructions

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/vekgwgzobfnxoocmnqhs/storage/buckets

### 2. Create New Bucket
- Click the **"New bucket"** button (top right)

### 3. Configure Bucket Settings
```
Name:              verification-docs
Public:            ❌ NO (keep it private/unchecked)
File size limit:   5 MB
Allowed MIME:      application/pdf
```

### 4. Click "Create bucket"

### 5. Verify Creation
You should see "verification-docs" in your buckets list with:
- 🔒 Private icon
- 0 objects (empty)

## ✅ Done!

The storage policies will be automatically applied when you run the SQL migration file.

---

## 🔐 Security Note

The bucket is **private** which means:
- Users can only access their own documents
- Files are stored in path: `{userId}/{filename}`
- Storage policies from the SQL migration control access

## 🧪 Testing

After creating the bucket, test by:
1. Opening the app
2. Going to Profile → Business Verification
3. Uploading a test PDF insurance document
4. Check Supabase Storage to see the file appear

---

**Time to complete**: ~30 seconds ⏱️
