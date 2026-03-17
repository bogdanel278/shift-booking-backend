# Navigation Architecture

## Overview

The app uses a **dual-stack navigation system** that automatically switches between authentication and application screens based on the user's login state.

## Navigation Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │    NavigationContainer                              │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │  Supabase onAuthStateChange Listener         │ │    │
│  │  │  - Monitors auth state in real-time          │ │    │
│  │  │  - Fires on login/logout/token refresh        │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  │                       │                             │    │
│  │                       ▼                             │    │
│  │            Is user authenticated?                   │    │
│  │                       │                             │    │
│  │          ┌────────────┴────────────┐               │    │
│  │          │                         │               │    │
│  │        NO│                         │YES            │    │
│  │          ▼                         ▼               │    │
│  │  ┌──────────────┐         ┌──────────────┐       │    │
│  │  │  AuthStack   │         │   AppStack   │       │    │
│  │  └──────────────┘         └──────────────┘       │    │
│  └────────┬─────────────────────────┬─────────────┘    │
│           │                          │                    │
└───────────┼──────────────────────────┼────────────────────┘
            │                          │
            ▼                          ▼
```

## Stack Details

### 1. AuthStack (Not Authenticated)
**File:** `src/navigation/AuthNavigator.tsx`

```
┌─────────────────────────────────────┐
│          AuthNavigator              │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐                  │
│  │ LoginScreen  │ ◄───────────┐   │
│  └──────┬───────┘              │   │
│         │                      │   │
│         │ "Sign Up"            │   │
│         ▼                      │   │
│  ┌───────────────┐             │   │
│  │RegisterScreen │             │   │
│  └──────┬────────┘             │   │
│         │                      │   │
│         │ "Already have        │   │
│         │  account?"           │   │
│         └──────────────────────┘   │
│                                     │
│  After successful sign up/login:   │
│  → Auto switches to AppStack       │
└─────────────────────────────────────┘
```

**Screens:**
- **Login** - Email/password authentication
  - Calls `supabase.auth.signInWithPassword()`
  - Link to Register screen
  
- **Register** - New business account creation
  - Calls `supabase.auth.signUp()`
  - Sets `role: 'business'` in user metadata
  - Link back to Login

**Auto-Switch Trigger:**
- When `supabase.auth.signInWithPassword()` succeeds
- When user verifies email after registration
- The `onAuthStateChange` listener detects this and switches to AppStack

### 2. AppStack (Authenticated)
**File:** `src/navigation/AppNavigator.tsx`

```
┌──────────────────────────────────────────┐
│           AppNavigator                   │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────┐                 │
│  │ DashboardScreen    │                 │
│  │                    │                 │
│  │ • Shows all shifts │                 │
│  │ • Logout button    │                 │
│  │ • FAB button       │                 │
│  └─────────┬──────────┘                 │
│            │                             │
│            │ Press FAB "+"               │
│            │                             │
│            ▼                             │
│  ┌─────────────────────┐                │
│  │ CreateShiftScreen   │ (Modal)        │
│  │                     │                │
│  │ • Shift form        │                │
│  │ • Maps to DB cols   │                │
│  │ • Cancel button     │                │
│  └─────────┬───────────┘                │
│            │                             │
│            │ After creation              │
│            │ or Cancel                   │
│            ▼                             │
│  Back to Dashboard                      │
│  (with refreshed data)                  │
│                                          │
│  Logout action:                         │
│  → Calls supabase.auth.signOut()        │
│  → Auto switches to AuthStack           │
└──────────────────────────────────────────┘
```

**Screens:**
- **Dashboard** - Main screen for authenticated users
  - Fetches shifts where `business_id == user.id`
  - Shows shift cards with details
  - **FAB (Floating Action Button)** navigates to CreateShift
  - Logout button calls `supabase.auth.signOut()`
  
- **CreateShift** - Modal form to create new shift
  - Presented as modal (slides up from bottom)
  - Maps form fields to database columns
  - Auto-sets `business_id` from logged-in user
  - Cancel button returns to Dashboard
  - Success returns to Dashboard with refresh

**Auto-Switch Trigger:**
- When user clicks Logout and `supabase.auth.signOut()` completes
- The `onAuthStateChange` listener detects this and switches to AuthStack

## Authentication State Management

### Initial Load
```typescript
useEffect(() => {
  // Check if user has existing session (from AsyncStorage)
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setLoading(false);
  });
}, []);
```

### Real-time Auth Listener
```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (_event, session) => {
    console.log('Auth state changed:', _event);
    setSession(session);
  }
);
```

**Events Detected:**
- `SIGNED_IN` - User logged in
- `SIGNED_OUT` - User logged out
- `TOKEN_REFRESHED` - Session token auto-refreshed
- `USER_UPDATED` - User profile updated

### Conditional Rendering
```typescript
<NavigationContainer>
  {session ? <AppNavigator /> : <AuthNavigator />}
</NavigationContainer>
```

## Data Flow

### Login Flow
```
1. User enters credentials in LoginScreen
2. Call supabase.auth.signInWithPassword()
3. Supabase validates and returns session
4. onAuthStateChange fires with SIGNED_IN event
5. App.tsx updates session state
6. NavigationContainer switches to AppNavigator
7. Dashboard loads and fetches user's shifts
```

### Logout Flow
```
1. User clicks Logout in Dashboard
2. Alert confirmation
3. Call supabase.auth.signOut()
4. Supabase clears session from storage
5. onAuthStateChange fires with SIGNED_OUT event
6. App.tsx clears session state
7. NavigationContainer switches to AuthNavigator
8. Login screen appears
```

### Create Shift Flow
```
1. User clicks FAB on Dashboard
2. Navigate to CreateShift (modal presentation)
3. User fills form and submits
4. Insert shift with business_id = user.id
5. Success alert shown
6. Navigate back to Dashboard
7. Dashboard refreshes and shows new shift
```

## Security Features

✅ **Automatic business_id assignment**
- `business_id` is always set from `auth.user.id`
- Users cannot create shifts for other businesses

✅ **Row-Level Security (RLS) Ready**
- All queries filter by `business_id == auth.uid()`
- Can add RLS policies for additional security

✅ **Session Persistence**
- Sessions stored in AsyncStorage
- User stays logged in across app restarts
- Auto token refresh prevents expired sessions

✅ **Environment Variables**
- API keys stored in `.env` (gitignored)
- Never committed to version control

## Type Safety

All navigation routes are typed:

```typescript
// AuthStack types
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
}

// AppStack types
type AppStackParamList = {
  Dashboard: undefined;
  CreateShift: undefined;
}

// Usage in screens
navigation.navigate('CreateShift'); // ✅ Type-safe
navigation.navigate('InvalidRoute'); // ❌ TypeScript error
```

## File Structure

```
src/
├── navigation/
│   ├── AuthNavigator.tsx   ← Auth screens stack
│   ├── AppNavigator.tsx    ← App screens stack
│   └── (RootNavigator.tsx) ← Not used (logic in App.tsx)
├── screens/
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── DashboardScreen.tsx
│   └── CreateShiftScreen.tsx
└── api/
    └── supabase.ts         ← Client with auth listener
```

## Testing the Flow

### Test Login
1. Start app → Should see Login screen
2. Enter credentials → Click Sign In
3. Should auto-switch to Dashboard
4. Dashboard shows your shifts

### Test Logout
1. From Dashboard → Click Logout
2. Confirm alert
3. Should auto-switch to Login screen

### Test Persistence
1. Login successfully
2. Close app completely
3. Reopen app
4. Should still be logged in (Dashboard shows)

### Test Registration
1. From Login → Click "Sign Up"
2. Fill form → Click Sign Up
3. Check email for verification
4. Click verification link
5. Should auto-switch to Dashboard

---

**Summary:** The navigation uses a clean separation between authenticated and unauthenticated states, with automatic switching powered by Supabase's auth state listener. No manual navigation logic needed! 🎯
