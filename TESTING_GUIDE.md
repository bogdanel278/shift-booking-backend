# Vouchsafe Sandbox Testing Guide

## Quick Test (Automated)

To automatically test all three sandbox codes:

```bash
npm run test:sandbox
```

This will test:
- ✅ PASS12345 → Expected result: **APPROVED**
- ❌ FAIL12345 → Expected result: **REJECTED**
- ⚠️  ERROR1234 → Expected result: **FAILED**

Example output:
```
╔════════════════════════════════════════════╗
║           ✅ RESULT: PASS                   ║
╚════════════════════════════════════════════╝
```

---

## Interactive Test (Manual)

To manually test right-to-work verification:

```bash
npm run test:rtw
```

### Step-by-Step Flow

**1. Choose Authentication**
```
🔐 Authentication Options:

1. Auto-register new test user (quick)
2. Login with existing account

Select option (1-2): 
```
- Enter `1` for quick testing (auto-registers a test user)
- Enter `2` to login with an existing account

**2. Choose Verification Method**
```
=== RIGHT-TO-WORK VERIFICATION ===

Verification Methods:
1. Passport
2. Visa
3. Share Code

Select method (1-3):
```
- Enter `3` for Share Code (to test Vouchsafe sandbox)

**3. Enter Share Code**
```
--- Share Code Details ---

💡 Sandbox Test Codes:
  PASS12345 - Will pass verification
  FAIL12345 - Will fail verification
  ERROR1234 - Will trigger an error

Share Code:
```
- Enter one of the sandbox codes: `PASS12345`, `FAIL12345`, or `ERROR1234`

**4. Enter Date of Birth**
```
Date of Birth (YYYY-MM-DD):
```
- Enter any valid date, e.g., `1990-01-01`

**5. View Results**

You'll see a result banner like:
```
================================================
             ✅ RESULT: PASS
================================================

📋 Details:
  Status: approved
  Method: share_code
  Provider: Vouchsafe
  Reference: VOUCHSAFE-1773242259766
  Notes: Share code verified successfully (sandbox)
  Submitted: 2026-03-11T15:10:59.766Z
```

**6. Check Status (Optional)**
```
Check status now? (y/n):
```
- Enter `y` to see the worker's current verification status
- Enter `n` to exit

---

## Sandbox Test Codes

### PASS12345
- **Expected Result:** `approved`
- **Status:** ✅ PASS
- **Use Case:** Testing successful verification flow

### FAIL12345  
- **Expected Result:** `rejected`
- **Status:** ❌ FAIL
- **Use Case:** Testing rejected verification (e.g., expired visa)

### ERROR1234
- **Expected Result:** `failed`
- **Status:** ⚠️  ERROR
- **Use Case:** Testing service error handling

---

## Testing Without Interactive Script

You can also test using curl:

```bash
# 1. Register a worker
curl -X POST http://localhost:3000/api/auth/register/worker \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "first_name": "Test",
    "last_name": "Worker"
  }'

# 2. Copy the token from the response

# 3. Submit verification
curl -X POST http://localhost:3000/api/workers/right-to-work/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "verification_method": "share_code",
    "share_code": "PASS12345",
    "date_of_birth": "1990-01-01"
  }'

# 4. Check status
curl -X GET http://localhost:3000/api/workers/right-to-work/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Package Scripts

| Command | Description |
|---------|-------------|
| `npm run test:rtw` | Interactive testing | script (manual input) |
| `npm run test:sandbox` | Automated sandbox testing (all 3 codes) |
| `npm start` | Start the backend server |
| `npm run build` | Build TypeScript |
| `npm run dev` | Run in development mode |

---

## Expected Results Summary

| Share Code | Status | Result | Provider Reference |
|------------|--------|--------|--------------------|
| PASS12345 | approved | ✅ PASS | VOUCHSAFE-{timestamp} |
| FAIL12345 | rejected | ❌ FAIL | null |
| ERROR1234 | failed | ⚠️  ERROR | null |

---

## Troubleshooting

**Server not running?**
```bash
npm start
```

**Port 3000 already in use?**
```bash
lsof -ti:3000 | xargs kill -9
npm start
```

**TypeScript errors?**
```bash
npm run build
```

**Need to check if server is healthy?**
```bash
curl http://localhost:3000/health
```

---

## Files

- `scripts/testRightToWork.ts` - Interactive test script
- `scripts/testSandboxQuick.sh` - Automated sandbox test
- `src/services/vouchsafeService.ts` - Vouchsafe integration
- `src/controllers/rightToWorkController.ts` - RTW API endpoints
