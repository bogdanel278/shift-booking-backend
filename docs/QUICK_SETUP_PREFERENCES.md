# Quick Setup: Experience & Uniform Features

## 🚀 1-Minute Setup

### Step 1: Run Database Migration
```sql
-- Copy and paste this into Supabase SQL Editor

-- Add to business_profiles
ALTER TABLE business_profiles
ADD COLUMN IF NOT EXISTS default_uniform_instructions TEXT,
ADD COLUMN IF NOT EXISTS default_min_experience TEXT DEFAULT 'entry',
ADD COLUMN IF NOT EXISTS default_ppe_required BOOLEAN DEFAULT false;

-- Add to shifts
ALTER TABLE shifts 
ADD COLUMN IF NOT EXISTS min_experience_level TEXT DEFAULT 'entry',
ADD COLUMN IF NOT EXISTS uniform_instructions TEXT,
ADD COLUMN IF NOT EXISTS ppe_required BOOLEAN DEFAULT false;

-- Add constraints
ALTER TABLE shifts 
ADD CONSTRAINT shifts_min_experience_level_check 
CHECK (min_experience_level IN ('entry', 'pro', 'expert'));

ALTER TABLE business_profiles 
ADD CONSTRAINT business_profiles_default_min_experience_check 
CHECK (default_min_experience IN ('entry', 'pro', 'expert'));

-- Add index
CREATE INDEX IF NOT EXISTS idx_shifts_min_experience_level 
ON shifts(min_experience_level) 
WHERE deleted_at IS NULL;
```

### Step 2: Restart App
```bash
# In terminal
npx expo start -c
```

### Step 3: Test Features
1. Open app → Profile Hub → Preferences
2. Set experience level: ⭐⭐ Professional
3. Type uniform: "Full black attire, non-slip shoes"
4. Toggle PPE required: ON
5. Save

6. Create new shift
7. Verify fields auto-filled! ✅

---

## 📱 How to Use

### Setting Defaults (One Time)
```
Profile Hub → Preferences → Set defaults → Save
```

### Creating Shifts (Auto-filled!)
```
Create Shift → Experience & Uniform pre-filled → Override if needed → Post
```

---

## 🎨 Experience Levels

| Level | Icon | Experience | Use For |
|-------|------|------------|---------|
| Entry | ⭐ | 0-1 years | General positions, trainees |
| Pro | ⭐⭐ | 2-5 years | Skilled roles, supervisors |
| Expert | ⭐⭐⭐ | 5+ years | Specialist roles, managers |

---

## 💡 Uniform Templates

**Quick Copy-Paste Options:**
- `Full Black (Smart)` - Formal service roles
- `Casual (Clean)` - Relaxed environments
- `Safety Gear Provided` - Industrial/construction
- `Full black attire, non-slip shoes required` - Food service
- `Smart business casual, closed-toe shoes` - Office/retail

---

## ✅ Verification

After migration, run this to check:

```sql
-- Check business_profiles columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'business_profiles' 
AND column_name LIKE 'default_%';

-- Check shifts columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'shifts' 
AND column_name IN ('min_experience_level', 'uniform_instructions', 'ppe_required');
```

Should return 6 rows total (3 for each table).

---

## 🐛 Troubleshooting

**Preferences not saving?**
- Check Supabase console for errors
- Verify business_profiles columns exist
- Check user has valid business profile

**Shifts not auto-filling?**
- Confirm preferences saved first
- Check console logs for fetch errors
- Verify default values in database

**TypeScript errors?**
- Run `npx expo start -c` to clear cache
- Check all imports are correct
- Verify database types updated

---

## 📊 What's Changed

| File | Changes |
|------|---------|
| `PreferencesModal.tsx` | Full implementation (was "Coming Soon") |
| `CreateShiftScreen.tsx` | Added experience + uniform sections |
| `database.ts` | 6 new type definitions |
| Database | 6 new columns, 2 constraints, 1 index |

---

## 🎯 Quick Test Script

```typescript
// Test flow:
1. Profile → Preferences → Set Pro ⭐⭐
2. Create Shift → Should auto-select Pro ⭐⭐
3. Override to Expert ⭐⭐⭐
4. Create shift → Database should have 'expert'
5. Check Supabase dashboard → Verify saved
```

---

**That's it! Features are ready to use.** 🚀
