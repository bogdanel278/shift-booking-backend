# 🚀 Quick Start Guide

## ✅ Setup Complete!

Your app now has a fully functional navigation system with:
- ✅ **NavigationContainer** wrapping the entire app
- ✅ **AuthStack** (Login/Register) for unauthenticated users
- ✅ **AppStack** (Dashboard/CreateShift) for authenticated users  
- ✅ **Supabase onAuthStateChange listener** for automatic stack switching

## 📋 Before You Start

### 1. Add Your Supabase Credentials

Edit `.env` and add your Supabase anon key:

```bash
SUPABASE_URL=https://vekgwgzobfnxoocmnqhs.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
```

To find your anon key:
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Go to Settings → API
4. Copy the `anon` `public` key

### 2. (Optional) Update Database Types

If you want to ensure your TypeScript types match your exact database schema:

```bash
npm run scan-db YOUR_DATABASE_PASSWORD
```

This will scan your database and update `src/types/database.ts`.

## 🎬 Running the App

### Start Development Server

```bash
npm start
```

This will open the Expo dev tools. From there you can:

### Run on iOS Simulator
```bash
npm run ios
```
Or press `i` in the terminal after `npm start`

### Run on Android Emulator
```bash
npm run android
```
Or press `a` in the terminal after `npm start`

### Run on Web Browser
```bash
npm run web
```
Or press `w` in the terminal after `npm start`

### Run on Physical Device
1. Install "Expo Go" app on your phone
2. Scan the QR code shown in terminal

## 🧪 Testing the Navigation Flow

### Test 1: Login Flow
1. App starts → You should see **Login screen**
2. Enter credentials → Click "Sign In"
3. ✅ Should automatically switch to **Dashboard**
4. Dashboard should show your shifts

### Test 2: Registration Flow
1. From Login → Click "Sign Up"
2. Fill in business name, email, password
3. Click "Sign Up"
4. Check your email for verification
5. Click verification link
6. ✅ Should automatically switch to **Dashboard**

### Test 3: Create Shift Flow
1. On Dashboard → Click the **blue "+"** FAB button
2. Form slides up as modal
3. Fill in shift details:
   - Role: "Server"
   - Date: "2026-03-15"
   - Start: "09:00"
   - End: "17:00"
   - Rate: "25"
4. Click "Create Shift"
5. ✅ Returns to Dashboard with new shift visible

### Test 4: Logout Flow
1. On Dashboard → Click "Logout"
2. Confirm alert
3. ✅ Should automatically switch to **Login screen**

### Test 5: Session Persistence
1. Login successfully
2. Close app completely (force quit)
3. Reopen app
4. ✅ Should still be logged in (Dashboard shows)

## 🔍 Navigation Architecture

```
App.tsx
└── NavigationContainer
    ├── [No Session] → AuthStack
    │   ├── Login
    │   └── Register
    │
    └── [Has Session] → AppStack
        ├── Dashboard
        └── CreateShift (modal)
```

### How It Works

The app automatically switches between stacks using:

```typescript
// In App.tsx
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (_event, session) => {
    setSession(session);
  }
);

return (
  <NavigationContainer>
    {session ? <AppNavigator /> : <AuthNavigator />}
  </NavigationContainer>
);
```

**Key Events:**
- User logs in → `session` becomes truthy → Shows **AppStack**
- User logs out → `session` becomes null → Shows **AuthStack**
- No manual navigation needed! 🎉

## 📱 Key Features

### Authentication (AuthStack)
- ✅ Email/password login
- ✅ Business registration with role metadata
- ✅ Form validation
- ✅ Error handling
- ✅ Auto-switch to Dashboard on success

### Dashboard (AppStack)
- ✅ Shows all shifts for logged-in business
- ✅ Filters by `business_id == user.id`
- ✅ Pull-to-refresh
- ✅ Empty state message
- ✅ Logout button
- ✅ Floating Action Button (FAB) to create shifts

### Create Shift (AppStack - Modal)
- ✅ Complete form with validation
- ✅ Maps to exact database columns
- ✅ Auto-sets `business_id` from logged-in user
- ✅ ISO timestamp formatting for PostgreSQL
- ✅ Modal presentation (slides from bottom)
- ✅ Cancel and success flows

## 🔒 Security Features

✅ **Auto business_id assignment** - Users can only create shifts for themselves
✅ **Session persistence** - AsyncStorage keeps users logged in
✅ **Environment variables** - API keys never in code
✅ **Type safety** - TypeScript prevents navigation errors

## 📁 File Structure

```
business-app/
├── App.tsx                          ← Main entry with NavigationContainer
├── src/
│   ├── navigation/
│   │   ├── AuthNavigator.tsx       ← Login, Register stack
│   │   └── AppNavigator.tsx        ← Dashboard, CreateShift stack
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   └── CreateShiftScreen.tsx
│   ├── api/
│   │   └── supabase.ts             ← Client config
│   └── types/
│       ├── database.ts             ← DB schema types
│       └── env.d.ts                ← Env var types
├── .env                            ← Add your keys here!
└── package.json
```

## 🐛 Troubleshooting

### Issue: "Missing environment variables" error
**Solution:** Add your Supabase anon key to `.env`

### Issue: App shows blank screen
**Solution:** 
1. Check terminal for errors
2. Ensure `.env` file exists
3. Try clearing cache: `expo start -c`

### Issue: Can't login
**Solution:**
1. Verify Supabase credentials in `.env`
2. Check if user exists in Supabase dashboard
3. Check terminal logs for error messages

### Issue: Shifts not loading
**Solution:**
1. Run `npm run scan-db` to verify table structure
2. Check if `shifts` table exists
3. Verify `business_id` column exists
4. Check Supabase logs

### Issue: Navigation not switching after login
**Solution:**
1. Check console for auth state changes
2. Verify `onAuthStateChange` is firing
3. Clear app storage and try again

## 📚 Documentation Files

- **BUILD_SUMMARY.md** - Complete build overview
- **NAVIGATION_GUIDE.md** - Detailed navigation architecture
- **employer_build_spec.md** - Original specification

## 🎯 Next Steps

Now that navigation is set up, you can:

1. ✅ Test the complete user flow
2. ✅ Add more screens (e.g., Shift Details, Edit Shift)
3. ✅ Customize styling and branding
4. ✅ Add push notifications
5. ✅ Implement shift applications from workers
6. ✅ Add real-time updates with Supabase subscriptions

---

**Ready to go!** 🚀

Run `npm start` and test your app!
