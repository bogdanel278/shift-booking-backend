# Spec: Employer-Side App (Coople Clone)
**Status:** Implementation Phase 1
**Stack:** Expo (React Native), TypeScript, Supabase (PostgreSQL)

---

## 1. Core Architecture Constraints
- **Platform Parity:** Must use `react-native-web`. Code must run on iOS, Android, and Web browsers without platform-specific forks where possible.
- **Database Integrity:** - **CRITICAL:** DO NOT run `CREATE TABLE` scripts.
    - Use the existing connection: `postgresql://postgres.vekgwgzobfnxoocmnqhs:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`.
    - Always query the database schema first to map existing column names (e.g., `id`, `created_at`, `business_id`, `shift_status`) before writing insert logic.
- **Type Safety:** Generate TypeScript interfaces based on the actual Supabase table definitions.

## 2. Setup & Dependencies
Install the following exactly:
- `expo`, `typescript`
- `@supabase/supabase-js`
- `@react-navigation/native`, `@react-navigation/stack`
- `react-native-screens`, `react-native-safe-area-context`
- `react-native-dotenv` (for API Key security)

## 3. Required Features & Logic
### A. Authentication (Existing Users)
- **Login Screen:** Use `supabase.auth.signInWithPassword`.
- **Register Screen:** Use `supabase.auth.signUp`. Ensure a `metadata` field or a `profiles` table link identifies the user as a 'Business' role.
- **Session Management:** Persistence using `AsyncStorage`.

### B. Employer Dashboard
- **View:** A list of "My Shifts" created by the logged-in Business ID.
- **Responsiveness:** On Web, show a sidebar; on Mobile, use a Bottom Tab bar.
- **Data Fetching:** Fetch from the `shifts` table where `business_id == auth.uid()`.

### C. Shift Creation Engine
- **The Button:** A prominent Floating Action Button (FAB) or Header button "Create Shift".
- **The Form:** Must include:
    - Role/Title (String)
    - Date & Time Pickers (Must be ISO string for Postgres `timestamptz`)
    - Hourly Rate (Numeric)
    - Location/Address
- **Safety Check:** Before submitting, verify the `business_id` is passed to the insert query to link the shift to the correct employer.

## 4. Folder Structure
/src
  /api (Supabase client & queries)
  /components (Button, Input, ShiftCard)
  /navigation (AppNavigator, AuthNavigator)
  /screens (Login, Register, Dashboard, CreateShift)
  /types (Database types)