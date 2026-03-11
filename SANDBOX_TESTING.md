# Vouchsafe Sandbox Testing - Quick Start

## ✅ All Tests Working!

The Vouchsafe sandbox integration is fully functional and tested.

---

## 🚀 Quick Test (10 seconds)

```bash
npm run test:sandbox
```

This automatically tests all three sandbox codes:
- **PASS12345** → ✅ APPROVED
- **FAIL12345** → ❌ REJECTED
- **ERROR1234** → ⚠️  ERROR

**Expected Output:**
```
╔════════════════════════════════════════════╗
║           ✅ RESULT: PASS                   ║
╚════════════════════════════════════════════╝

╔════════════════════════════════════════════╗
║           ❌ RESULT: FAIL                   ║
╚════════════════════════════════════════════╝

╔════════════════════════════════════════════╗
║           ⚠️  RESULT: ERROR                 ║
╚════════════════════════════════════════════╝
```

---

## 🎮 Interactive Testing

For manual testing with any share code:

```bash
npm run test:rtw
```

**Interactive Flow:**

1. **Choose authentication:**
   - Option 1: Auto-register test user (quick)
   - Option 2: Login with existing account

2. **Select verification method:**
   - Option 3: Share Code

3. **Enter share code:**
   - `PASS12345` (will approve)
   - `FAIL12345` (will reject)
   - `ERROR1234` (will error)

4. **Enter date of birth:**
   - Any valid date, e.g., `1990-01-01`

5. **View result:**
   ```
   ================================================
                ✅ RESULT: PASS
   ================================================
   ```

---

## 📋 Manual Testing (curl)

If you prefer command-line testing:

```bash
# Step 1: Register worker and save token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/register/worker \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ex.com","password":"Pass123","first_name":"Test","last_name":"User"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")

# Step 2: Submit share code
curl -X POST http://localhost:3000/api/workers/right-to-work/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "verification_method": "share_code",
    "share_code": "PASS12345",
    "date_of_birth": "1990-01-01"
  }' | python3 -m json.tool

# Step 3: Check status
curl -X GET http://localhost:3000/api/workers/right-to-work/status \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## 🔍 What Each Code Does

| Code | Result | Status | Details |
|------|--------|--------|---------|
| **PASS12345** | ✅ PASS | `approved` | Valid right-to-work, provider reference generated |
| **FAIL12345** | ❌ FAIL | `rejected` | Invalid/expired, reason: "expired_visa" |
| **ERROR1234** | ⚠️ ERROR | `failed` | Service unavailable error |

---

## 🛠️ Prerequisites

Make sure the server is running:

```bash
npm start
```

Check server health:
```bash
curl http://localhost:3000/health
# Should return: {"status":"OK","timestamp":"..."}
```

---

## 📚 Full Documentation

- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Complete testing instructions
- **[AUTH_RTW_API_DOCS.md](AUTH_RTW_API_DOCS.md)** - API documentation
- **[FINAL_SUMMARY.md](FINAL_SUMMARY.md)** - Implementation summary

---

## ✨ Test Results

```
▶ Test 1: PASS12345
   Result: ✅ PASS
   Status: approved
   Provider: Vouchsafe
   
▶ Test 2: FAIL12345
   Result: ❌ FAIL
   Status: rejected
   Reason: Invalid or expired
   
▶ Test 3: ERROR1234
   Result: ⚠️  ERROR
   Status: failed
   Reason: Service error
```

**All tests passing! ✅**
