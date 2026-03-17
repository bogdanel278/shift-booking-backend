# Spec: Shift Guarding & Smart Date Inputs

## 1. Hard Feature Guard (The Lock)
- **Logic:** In `CreateShiftScreen.tsx`, add a check at the very top of the `handleSubmit` or `useEffect`.
- **Action:** If `v_status !== 'verified'`, the screen must render a 'Blocked' UI state instead of the form. 
- **Redirect:** Provide a large 'Go to Verification' button that sends them back to the Profile Hub.

## 2. Smart Date/Time Inputs
- **Library:** Use `@react-native-community/datetimepicker` (or the built-in HTML5 `<input type="datetime-local">` for Web).
- **Behavior:** - Replace text inputs with a clickable 'Date' row and a 'Time' row.
    - Clicking 'Date' opens a **Calendar Picker**.
    - Clicking 'Time' opens a **Clock/Wheel Picker**.
- **Validation:** - End Time must be at least 1 hour after Start Time.
    - Dates in the past must be disabled.

## 3. Location Auto-Fill (Enforcement)
- **Constraint:** The 'Location' field should be a 'Read-only' display of the Business Profile address by default, with a small 'Edit' button if they need to change it for a one-off shift.