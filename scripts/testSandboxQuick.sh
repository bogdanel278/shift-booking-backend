#!/bin/bash

# Quick Sandbox Test Script for Vouchsafe Share Codes
# Tests all three sandbox codes: PASS12345, FAIL12345, ERROR1234

echo "╔════════════════════════════════════════════╗"
echo "║    Vouchsafe Sandbox Quick Test Suite     ║"
echo "╚════════════════════════════════════════════╝"
echo ""

API_BASE_URL="http://localhost:3000"

# Test 1: PASS12345 (Should be approved)
echo "▶ Test 1: Testing PASS12345 (Expected: APPROVED)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Register test user
TIMESTAMP=$(date +%s)
EMAIL="pass.test.${TIMESTAMP}@test.com"
PASSWORD="TestPass123!"

echo "🔄 Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/auth/register/worker" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"first_name\":\"Pass\",\"last_name\":\"Test\"}")

TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['data']['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to register user"
  exit 1
fi

echo "✅ User registered: $EMAIL"

# Submit PASS12345
echo ""
echo "📤 Submitting share code: PASS12345"
RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/workers/right-to-work/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"verification_method":"share_code","share_code":"PASS12345","date_of_birth":"1990-01-01"}')

STATUS=$(echo "$RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['data']['status'])" 2>/dev/null)

echo ""
if [ "$STATUS" = "approved" ]; then
  echo "╔════════════════════════════════════════════╗"
  echo "║           ✅ RESULT: PASS                   ║"
  echo "╚════════════════════════════════════════════╝"
else
  echo "╔════════════════════════════════════════════╗"
  echo "║           ❌ UNEXPECTED RESULT              ║"
  echo "╚════════════════════════════════════════════╝"
  echo "Expected: approved, Got: $STATUS"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 2: FAIL12345 (Should be rejected)
echo "▶ Test 2: Testing FAIL12345 (Expected: REJECTED)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Register another test user
TIMESTAMP=$(date +%s)
EMAIL="fail.test.${TIMESTAMP}@test.com"

echo "🔄 Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/auth/register/worker" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"first_name\":\"Fail\",\"last_name\":\"Test\"}")

TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['data']['token'])" 2>/dev/null)

echo "✅ User registered: $EMAIL"

# Submit FAIL12345
echo ""
echo "📤 Submitting share code: FAIL12345"
RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/workers/right-to-work/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"verification_method":"share_code","share_code":"FAIL12345","date_of_birth":"1990-01-01"}')

STATUS=$(echo "$RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['data']['status'])" 2>/dev/null)

echo ""
if [ "$STATUS" = "rejected" ]; then
  echo "╔════════════════════════════════════════════╗"
  echo "║           ❌ RESULT: FAIL                   ║"
  echo "╚════════════════════════════════════════════╝"
else
  echo "╔════════════════════════════════════════════╗"
  echo "║           ❌ UNEXPECTED RESULT              ║"
  echo "╚════════════════════════════════════════════╝"
  echo "Expected: rejected, Got: $STATUS"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 3: ERROR1234 (Should fail)
echo "▶ Test 3: Testing ERROR1234 (Expected: FAILED)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Register another test user
TIMESTAMP=$(date +%s)
EMAIL="error.test.${TIMESTAMP}@test.com"

echo "🔄 Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/auth/register/worker" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"first_name\":\"Error\",\"last_name\":\"Test\"}")

TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['data']['token'])" 2>/dev/null)

echo "✅ User registered: $EMAIL"

# Submit ERROR1234
echo ""
echo "📤 Submitting share code: ERROR1234"
RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/workers/right-to-work/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"verification_method":"share_code","share_code":"ERROR1234","date_of_birth":"1990-01-01"}')

STATUS=$(echo "$RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['data']['status'])" 2>/dev/null)

echo ""
if [ "$STATUS" = "failed" ]; then
  echo "╔════════════════════════════════════════════╗"
  echo "║           ⚠️  RESULT: ERROR                 ║"
  echo "╚════════════════════════════════════════════╝"
else
  echo "╔════════════════════════════════════════════╗"
  echo "║           ❌ UNEXPECTED RESULT              ║"
  echo "╚════════════════════════════════════════════╝"
  echo "Expected: failed, Got: $STATUS"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ All sandbox tests completed!"
echo ""
