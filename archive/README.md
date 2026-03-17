# Archive

This folder contains files that are no longer actively used but kept for reference.

## 📦 Archived Components

### Replaced Components
- **DashboardHeader.tsx** - Replaced by `FlexHeader.tsx`
  - Old header component with different layout
  - FlexHeader provides better UX (logo left, name center, logout right)

### Deprecated Navigation
- **RootNavigator.tsx** - Logic moved to `App.tsx`
  - Was handling profile guard and auth switching
  - Now handled directly in App.tsx for simpler structure

## 🛠️ Utility Scripts (Used During Setup)

These scripts were used during initial development and database setup:

- **check-columns.js** - Verified database column names
- **fix-user.js** - Fixed missing user records in database
- **scan-schema.js** - Generated TypeScript types from database schema
- **test-supabase.js** - Tested Supabase connection

## ⚠️ Important Notes

- **Don't delete these files** - They may be useful for reference or troubleshooting
- **Don't import these files** - Use the newer replacements instead
- **Utility scripts** - May still be useful if you need to regenerate types or debug database

## 🔄 Migration Notes

### DashboardHeader → FlexHeader
```tsx
// Old (archived)
import DashboardHeader from '../components/DashboardHeader';
<DashboardHeader tradingName={name} logoUrl={url} shiftsCount={count} ... />

// New (current)
import FlexHeader from '../components/FlexHeader';
<FlexHeader tradingName={name} logoUrl={url} onLogout={handleLogout} />
```

### RootNavigator → App.tsx
```tsx
// Old (archived)
// RootNavigator.tsx handled profile guard

// New (current)
// App.tsx handles profile guard directly
// Check isProfileComplete state in App.tsx
```

## 📅 Archive Date

Files archived: March 14, 2026
