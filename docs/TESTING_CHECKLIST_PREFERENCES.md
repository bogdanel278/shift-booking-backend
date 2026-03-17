# Testing Checklist: Experience & Uniform Features

## ✅ Pre-Testing Setup

- [ ] Run database migration (`docs/database_migration_preferences.sql`)
- [ ] Verify 6 new columns exist in Supabase
- [ ] Clear app cache: `npx expo start -c`
- [ ] App builds without TypeScript errors
- [ ] Have test business account ready

---

## 🧪 Test Suite 1: Preferences Modal

### Opening the Modal
- [ ] Open Profile Hub
- [ ] Tap "Preferences" tile
- [ ] Modal slides up from bottom
- [ ] Title shows "Default Shift Preferences"
- [ ] Close and Save buttons visible

### Experience Level Selection
- [ ] All three options visible: Entry ⭐, Pro ⭐⭐, Expert ⭐⭐⭐
- [ ] Tap "Entry Level" - button highlights (indigo background)
- [ ] Tap "Professional" - button highlights, Entry unhighlights
- [ ] Tap "Expert" - button highlights, Professional unhighlights
- [ ] Active button has indigo border and text

### PPE Toggle
- [ ] Toggle is OFF by default (gray)
- [ ] Tap toggle - switches to ON (green)
- [ ] Tap again - switches to OFF
- [ ] Toggle animates smoothly

### Uniform Instructions
- [ ] Text area shows placeholder text
- [ ] Tap text area - keyboard appears
- [ ] Type: "Full black attire, non-slip shoes"
- [ ] Text wraps to multiple lines
- [ ] Helper text visible below with emoji 💡

### Saving Preferences
- [ ] Tap "Save" button
- [ ] Loading spinner appears
- [ ] Success alert shows
- [ ] Modal closes automatically
- [ ] No errors in console

### Persistence Test
- [ ] Reopen Preferences modal
- [ ] Experience level matches what you saved
- [ ] Uniform text matches what you saved
- [ ] PPE toggle matches what you saved

---

## 🧪 Test Suite 2: Create Shift Auto-Fill

### Initial Load
- [ ] Open CreateShift screen
- [ ] Scroll to Experience section
- [ ] Experience matches saved preference
- [ ] Scroll to Uniform section
- [ ] Uniform text matches saved preference
- [ ] PPE toggle matches saved preference

### Override Test
- [ ] Change experience from Pro to Expert
- [ ] Change uniform text to something different
- [ ] Toggle PPE to opposite state
- [ ] Create the shift
- [ ] Check Supabase dashboard
- [ ] Shift saved with OVERRIDDEN values (not defaults)

### Empty Preferences Test
- [ ] Go to Preferences
- [ ] Set experience to Entry
- [ ] Clear uniform text (empty)
- [ ] Toggle PPE to OFF
- [ ] Save
- [ ] Create new shift
- [ ] Experience defaults to Entry ⭐
- [ ] Uniform text is empty
- [ ] PPE is OFF

---

## 🧪 Test Suite 3: Experience Level UI

### Visual States
- [ ] Inactive buttons: Gray background, gray border
- [ ] Active button: Indigo background, indigo border
- [ ] Active text: Bold indigo color
- [ ] Star icons: ⭐, ⭐⭐, ⭐⭐⭐ clearly visible
- [ ] Years text: "0-1 years", "2-5 years", "5+ years"

### Interaction
- [ ] Buttons respond to touch immediately
- [ ] Only one button can be active at a time
- [ ] Tap disabled (while loading) - no response
- [ ] Buttons are large enough for easy tapping

---

## 🧪 Test Suite 4: Uniform & PPE UI

### PPE Toggle
- [ ] Toggle row has clear layout
- [ ] Title: "PPE Required" visible
- [ ] Subtitle: "Personal Protective Equipment needed"
- [ ] Toggle switch on right side
- [ ] Switch changes color when toggled
- [ ] iOS: Smooth native toggle
- [ ] Android: Material design toggle

### Uniform Text Area
- [ ] Text area shows placeholder when empty
- [ ] Multi-line input works correctly
- [ ] Typing flows naturally
- [ ] Can paste text (try long text)
- [ ] Can delete text
- [ ] Border color changes on focus
- [ ] Helper text with templates visible

---

## 🧪 Test Suite 5: Database Integration

### Check business_profiles
```sql
SELECT 
  default_min_experience,
  default_uniform_instructions,
  default_ppe_required
FROM business_profiles
WHERE user_id = 'YOUR_USER_ID';
```
- [ ] default_min_experience: 'entry' | 'pro' | 'expert'
- [ ] default_uniform_instructions: Text or NULL
- [ ] default_ppe_required: true | false

### Check shifts
```sql
SELECT 
  title,
  min_experience_level,
  uniform_instructions,
  ppe_required
FROM shifts
WHERE business_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 5;
```
- [ ] min_experience_level: 'entry' | 'pro' | 'expert'
- [ ] uniform_instructions: Text or NULL
- [ ] ppe_required: true | false
- [ ] Values match what you selected when creating shift

---

## 🧪 Test Suite 6: Edge Cases

### No Business Profile
- [ ] Create user without business_profiles entry
- [ ] Open CreateShift
- [ ] Should not crash
- [ ] Defaults to: Entry ⭐, empty uniform, PPE OFF

### Very Long Uniform Text
- [ ] Type 500+ characters in uniform field
- [ ] Save preferences
- [ ] Text saves correctly
- [ ] Text displays correctly in CreateShift
- [ ] No text overflow issues

### Rapid Toggling
- [ ] Toggle PPE ON/OFF 10 times quickly
- [ ] No crashes or freezes
- [ ] Final state correct

### Network Errors
- [ ] Turn on Airplane Mode
- [ ] Try to save preferences
- [ ] Should show error alert
- [ ] Turn off Airplane Mode
- [ ] Try again - should work

### Multiple Users
- [ ] User A sets preferences: Pro, "Black attire", PPE ON
- [ ] User B sets preferences: Entry, "Casual", PPE OFF
- [ ] User A creates shift - sees THEIR defaults
- [ ] User B creates shift - sees THEIR defaults
- [ ] No cross-contamination

---

## 🧪 Test Suite 7: Platform Testing

### iOS Testing
- [ ] Modal animations smooth
- [ ] Switch uses iOS native style
- [ ] Text input keyboard correct
- [ ] Star emojis render correctly
- [ ] Touch targets feel natural

### Android Testing
- [ ] Modal animations smooth
- [ ] Switch uses Material design
- [ ] Text input keyboard correct
- [ ] Star emojis render correctly
- [ ] Back button closes modal

### Web Testing (if applicable)
- [ ] Modal displays correctly
- [ ] Buttons have hover states
- [ ] Keyboard navigation works
- [ ] Text areas resizable
- [ ] Max width 800px applied

---

## 🧪 Test Suite 8: Performance

### Load Time
- [ ] Preferences modal opens < 500ms
- [ ] CreateShift loads < 1000ms
- [ ] Auto-fill happens instantly
- [ ] No janky animations

### Memory
- [ ] Open/close Preferences 20 times
- [ ] No memory leaks
- [ ] App remains responsive

---

## 🧪 Test Suite 9: User Experience

### First-Time User
- [ ] Open Preferences for first time
- [ ] UI is self-explanatory
- [ ] Defaults make sense (Entry, empty, OFF)
- [ ] Helper text is helpful
- [ ] Save button obvious

### Power User
- [ ] Can set preferences quickly (< 30 seconds)
- [ ] Shift creation faster with auto-fill
- [ ] Can override when needed
- [ ] Workflow feels natural

---

## 🧪 Test Suite 10: Error Handling

### Validation
- [ ] Can't save invalid experience level
- [ ] Check constraint prevents bad data
- [ ] Empty uniform text saves as NULL

### Failed Saves
- [ ] If save fails, shows error alert
- [ ] Modal stays open
- [ ] User can retry
- [ ] Data not lost

### Failed Loads
- [ ] If load fails, shows error in console
- [ ] Defaults to safe values
- [ ] User can still create shift

---

## 📊 Test Results Template

```
Date: _______________
Tester: _______________
Platform: iOS / Android / Web

Test Suite | Pass | Fail | Notes
-----------|------|------|------
1. Preferences Modal | ✓/✗ | ✓/✗ | 
2. Auto-Fill | ✓/✗ | ✓/✗ | 
3. Experience UI | ✓/✗ | ✓/✗ | 
4. Uniform UI | ✓/✗ | ✓/✗ | 
5. Database | ✓/✗ | ✓/✗ | 
6. Edge Cases | ✓/✗ | ✓/✗ | 
7. Platform | ✓/✗ | ✓/✗ | 
8. Performance | ✓/✗ | ✓/✗ | 
9. UX | ✓/✗ | ✓/✗ | 
10. Errors | ✓/✗ | ✓/✗ | 

Overall Pass Rate: ____%
Ready for Production: YES / NO
```

---

## 🐛 Common Issues & Fixes

### Issue: Preferences don't save
**Fix**: Check Supabase RLS policies allow UPDATE on business_profiles

### Issue: Auto-fill not working
**Fix**: Verify SELECT includes all 3 new columns

### Issue: Experience buttons not highlighting
**Fix**: Check conditional style logic in CreateShiftScreen

### Issue: Database constraint error
**Fix**: Ensure only 'entry', 'pro', or 'expert' values used

### Issue: TypeScript errors
**Fix**: Run `npx expo start -c` to clear cache

---

## ✅ Sign-Off Checklist

Before marking as production-ready:

- [ ] All 10 test suites passed
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Database migration successful
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Performance acceptable
- [ ] UX smooth and intuitive
- [ ] Edge cases handled
- [ ] Error handling works

**Tested by**: _______________  
**Date**: _______________  
**Approved**: YES / NO  

---

**Happy Testing! 🎉**
