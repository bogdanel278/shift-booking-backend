# Spec: Premium Business Profile Hub (Flex-Inspired)

## 1. Visual Hierarchy
- **Header Section:** A large, circular logo on the left. To the right, the Trading Name in Bold, followed by a 'Verified' badge and the Industry Type.
- **Stats Row:** Below the header, show 3 quick stats: [Total Shifts Posted] [Average Rating] [Active Workers].

## 2. Menu-Driven Navigation (The "Indeed Flex" Way)
Instead of one long form, use a list of navigable "tiles" or "rows":
- **Company Details:** (Trading Name, Legal Name, Description, Website)
- **Primary Location:** (Address, Arrival Instructions, Map Pin)
- **Preferences:** (Default Pay Rates, Default Shift Times)
- **Account Security:** (Email, Reset Password)
- **Danger Zone:** (Logout, Delete Account)

## 3. Interaction Design
- **Read-Only Mode:** By default, the profile is "Read-Only" with an 'Edit' button at the top right.
- **Inline Editing:** When 'Edit' is clicked, the fields transform into inputs with a 'Save' and 'Cancel' button appearing at the bottom.
- **Image Picker:** Click the Logo circle to trigger the camera roll/file uploader to update the `logo_url`.

## 4. UI/UX Style
- **Background:** Soft grey (#F5F7FA) or Dark Charcoal (#1A1A1B).
- **Cards:** White (or dark glass) cards with a thin 1px border.
- **Icons:** Use Lucide or FontAwesome icons for each menu item (e.g., a Building icon for Company Details).
- **Web Layout:** On Web, the menu stays on the left, and the content opens in a large pane on the right.