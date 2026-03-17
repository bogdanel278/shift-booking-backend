# Expo Go Version Compatibility Fix

## Issue
Your app uses **Expo SDK 55** but your phone's Expo Go app doesn't support it yet.

## ✅ Solution Applied

I've downgraded your app to **Expo SDK 51** which is the current stable version supported by Expo Go.

### Changes Made:
1. ✅ Downgraded from Expo SDK 55 → SDK 51
2. ✅ Downgraded React Navigation from v7 → v6
3. ✅ Updated all dependencies to SDK 51 compatible versions

### Current File Watcher Issue
There's a macOS file descriptor limit preventing Metro bundler from starting. This is unrelated to the Expo version.

## 🔧 Quick Fixes

### Option 1: Install Watchman (Recommended)
```bash
brew install watchman
```
Then restart Expo:
```bash
npx expo start
```

### Option 2: Increase File Limit
Add to your `~/.zshrc`:
```bash
ulimit -n 10000
```
Then:
```bash
source ~/.zshrc
npx expo start
```

### Option 3: Use Web Version (No File Limit Issue)
```bash
npx expo start --web
```

## 📱 Testing on Your Phone

Once the server starts successfully:

1. **Update Expo Go** on your phone to the latest version
2. Open Expo Go app
3. Scan the QR code
4. App should now work! ✅

### Expected Expo Go Version
- **iOS**: Expo Go 2.31.0 or later
- **Android**: Expo Go 2.31.0 or later

## 📦 Updated Package Versions

```json
{
  "expo": "~51.0.0",
  "@react-navigation/native": "^6.1.18",
  "@react-navigation/native-stack": "^6.11.0",
  "@react-navigation/bottom-tabs": "^6.6.1",
  "react": "18.2.0",
  "react-native": "0.74.5"
}
```

## ⚠️ Note About File Watcher Error

The `EMFILE: too many open files` error is a macOS system limit, not an Expo issue. It happens when:
- Too many processes are watching files
- System file descriptor limit is too low
- Previous Metro instances didn't clean up properly

**Best solution**: Install Watchman (Option 1 above)

---

**Status**: Expo SDK downgraded ✅ | File watcher issue pending 🔧
**Next Step**: Install Watchman or restart your computer to clear file handles
