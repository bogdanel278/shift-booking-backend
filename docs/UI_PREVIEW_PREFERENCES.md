# UI Preview: Experience & Uniform Features

## 📱 Preferences Modal (Profile Hub)

```
┌─────────────────────────────────────────┐
│  Close    Default Shift Preferences Save│
├─────────────────────────────────────────┤
│                                         │
│  Set default values that will auto-fill │
│  when creating new shifts. You can      │
│  always change them per shift.          │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Minimum Experience Level          │ │
│  │ Choose the default minimum        │ │
│  │ experience for your shifts        │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ ⭐  Entry Level (0-1 years) │ │ │ <- Tappable
│  │  └─────────────────────────────┘ │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ ⭐⭐ Professional (2-5 yrs)  │ │ │ <- Active (highlighted)
│  │  └─────────────────────────────┘ │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ ⭐⭐⭐ Expert (5+ years)     │ │ │ <- Tappable
│  │  └─────────────────────────────┘ │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Uniform & PPE Requirements        │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ PPE Required          [ON ]│ │ │ <- Toggle switch
│  │  │ Safety equipment needed     │ │ │
│  │  └─────────────────────────────┘ │ │
│  │                                   │ │
│  │  Default Uniform Instructions     │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ Full black attire (smart),  │ │ │ <- Multi-line
│  │  │ non-slip shoes required     │ │ │    text area
│  │  │                             │ │ │
│  │  └─────────────────────────────┘ │ │
│  │  💡 Common templates: "Full Black│ │
│  │  (Smart)", "Casual (Clean)"...  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ℹ️ These defaults will auto fill  │ │ <- Info box
│  │   when you create a new shift.    │ │
│  │   You can modify them anytime.    │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 📱 Create Shift Screen (New Sections)

```
┌─────────────────────────────────────────┐
│  Cancel      Create Shift               │
├─────────────────────────────────────────┤
│                                         │
│  [Existing fields: Title, Location,    │
│   Date, Time, Pay Rate, Description]    │
│                                         │
│  ┌─ NEW SECTION ────────────────────┐  │
│  │ Minimum Experience Level          │  │
│  │ Select the minimum experience     │  │
│  │ required for this shift           │  │
│  │                                   │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │ ⭐  Entry Level             │ │  │
│  │  │     0-1 years experience    │ │  │ <- Inactive
│  │  └─────────────────────────────┘ │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │ ⭐⭐ Professional            │ │  │
│  │  │     2-5 years experience    │ │  │ <- Active (auto-filled!)
│  │  └─────────────────────────────┘ │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │ ⭐⭐⭐ Expert                 │ │  │
│  │  │     5+ years experience     │ │  │ <- Inactive
│  │  └─────────────────────────────┘ │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌─ NEW SECTION ────────────────────┐  │
│  │ Uniform & PPE Requirements        │  │
│  │                                   │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │ PPE Required          [ON ]│ │  │ <- Auto-filled!
│  │  │ Personal Protective         │ │  │
│  │  │ Equipment needed            │ │  │
│  │  └─────────────────────────────┘ │  │
│  │                                   │  │
│  │  Uniform Instructions (Optional)  │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │ Full black attire (smart),  │ │  │ <- Auto-filled!
│  │  │ non-slip shoes required     │ │  │
│  │  │                             │ │  │
│  │  └─────────────────────────────┘ │  │
│  │  💡 Common templates: "Full Black│  │
│  │  (Smart)", "Casual (Clean)"...  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │      Create Shift                  │  │ <- Create button
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🎨 Visual Design Elements

### Experience Buttons

**Inactive State:**
```
┌─────────────────────────────┐
│ ⭐  Entry Level             │
│     0-1 years experience    │
└─────────────────────────────┘
```
- Background: Light gray (#F9FAFB)
- Border: Gray (#E5E7EB)
- Text: Dark gray (#333)

**Active State:**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ⭐⭐ Professional            ┃
┃     2-5 years experience    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```
- Background: Light indigo (#EEF2FF)
- Border: Indigo (#6366F1) - thicker
- Text: Indigo (#4F46E5) - bold

### PPE Toggle

**OFF:**
```
┌─────────────────────────────┐
│ PPE Required          [OFF]│
│ Safety equipment needed     │
└─────────────────────────────┘
```
- Switch: Gray

**ON:**
```
┌─────────────────────────────┐
│ PPE Required          [ON ]│
│ Safety equipment needed     │
└─────────────────────────────┘
```
- Switch: Green (#34D399)

### Uniform Text Area

```
┌─────────────────────────────┐
│ Full black attire (smart),  │
│ non-slip shoes required.    │
│ Hair must be tied back.     │
│                             │
└─────────────────────────────┘
```
- Multi-line input
- Min height: 100px
- Placeholder text visible when empty
- Gray border (#E5E7EB)

---

## 📐 Measurements

| Element | Size | Spacing |
|---------|------|---------|
| Experience button | Full width | 12px gap between |
| Button padding | 14px | - |
| Icon size | 20px | 12px right margin |
| Title text | 16px bold | - |
| Subtitle text | 13px regular | 2px top margin |
| Toggle row | Full width | 12px padding |
| Text area | Min 100px height | - |
| Section padding | 16px | - |
| Border radius | 8-10px | - |

---

## 🎯 Interaction States

### Experience Buttons
1. **Default**: Gray background, gray border
2. **Hover** (web): Subtle shadow
3. **Active**: Indigo background, indigo border
4. **Disabled**: Opacity 60%, no interaction

### PPE Toggle
1. **OFF**: Gray track, white thumb
2. **ON**: Green track, white thumb
3. **Disabled**: Opacity 60%

### Save Button (Preferences)
1. **Default**: Blue text "Save"
2. **Saving**: Spinner replacing text
3. **Success**: Shows alert, closes modal

### Text Areas
1. **Empty**: Shows placeholder
2. **Focused**: Blue border
3. **Filled**: Normal border
4. **Disabled**: Gray background

---

## 🌈 Color Palette

```css
/* Backgrounds */
--bg-inactive: #F9FAFB
--bg-active: #EEF2FF
--bg-screen: #F5F7FA
--bg-white: #FFFFFF

/* Borders */
--border-gray: #E5E7EB
--border-indigo: #6366F1

/* Text */
--text-dark: #111827
--text-normal: #333333
--text-gray: #6B7280
--text-indigo: #4F46E5

/* Accents */
--accent-blue: #007AFF
--accent-green: #34D399
--accent-indigo: #6366F1
```

---

## 📱 Responsive Behavior

### Mobile (< 800px width)
- Full width buttons
- Stacked layout
- Touch-friendly 44px minimum tap targets

### Web (> 800px width)
- Max width: 800px centered
- Hover states visible
- Keyboard navigation support

---

## ✨ Animations

1. **Modal open**: Slide up from bottom
2. **Button tap**: Scale 0.98 for 100ms
3. **Toggle switch**: Smooth slide (200ms)
4. **Save success**: Fade alert in/out
5. **Form submit**: Button loading state

---

## 🔍 Accessibility

- ✅ Minimum 44x44pt touch targets
- ✅ Sufficient color contrast (WCAG AA)
- ✅ Clear label/value associations
- ✅ Screen reader friendly
- ✅ Keyboard navigation (web)

---

## 💡 Smart Defaults Flow

```
User sets preferences:
  Experience: Pro ⭐⭐
  Uniform: "Full black attire"
  PPE: ON
         ↓
Saves to business_profiles
         ↓
User opens CreateShift
         ↓
Auto-loads from database
         ↓
Form pre-filled:
  ✅ Experience: Pro ⭐⭐
  ✅ Uniform: "Full black attire"
  ✅ PPE: ON
         ↓
User can override if needed
         ↓
Creates shift with values saved
```

---

This UI matches the clean, professional aesthetic of Indeed Flex while maintaining consistency with your existing design system! 🎨
