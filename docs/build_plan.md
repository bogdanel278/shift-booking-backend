# Project: Coople-style Business App (Flex Design)

## 1. Global Navigation Style
- **Mobile:** Bottom Tab Bar (Home/Shifts, Post Shift, Timesheets, Profile).
- **Web:** Sidebar or Top Navigation (Responsive).
- **Theme:** Minimalist, high-contrast (Blue/White), similar to Indeed Flex.

## 2. Authentication & Profile Guard
- **Initial Check:** On login, fetch the `businesses` table row for `auth.uid()`.
- **The Guard:** If `trading_name`, `logo_url`, or `business_address` is null, the user is LOCKED into the `CompleteProfileScreen`.
- **Navigation Logic:** The Bottom Tab Bar remains hidden or disabled until the profile is 100% complete.

## 3. Screens to Build
- **Login/Register:** Connect to existing Supabase Auth.
- **CompleteProfile:** Form for Trading Name, Industry, Address, and Logo URL.
- **Dashboard (Home):** - Header: Circular Logo (Left), Trading Name (Center), Settings/Logout (Right).
    - Content: Card-based list of active shifts (Job Title, Date, Fulfillment rate).
- **CreateShift:** A multi-step form (Role, Date/Time, Pay Rate, Location).
- **ProfileDetails:** A screen to edit existing business information.

## 4. Technical Constraints
- **React Native Web:** Use only cross-platform compatible components.
- **Supabase Client:** Use the existing client in `src/api/supabase.ts`.
- **No New Tables:** Use the existing `businesses` and `shifts` tables.