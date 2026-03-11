#!/bin/bash

# Demo of interactive RTW testing
# This shows how npm run test:rtw works

echo "═══════════════════════════════════════════════════"
echo "  DEMO: Interactive Right-to-Work Testing"
echo "═══════════════════════════════════════════════════"
echo ""
echo "This demonstrates using: npm run test:rtw"
echo ""
echo "The script will:"
echo "  1. Auto-register a test user (or let you login)"
echo "  2. Prompt for share code"
echo "  3. Prompt for date of birth"
echo "  4. Submit to Vouchsafe sandbox"
echo "  5. Display result: PASS, FAIL, or ERROR"
echo ""
echo "═══════════════════════════════════════════════════"
echo ""

# Simulate the interactive flow with echo commands
echo "Running: npm run test:rtw"
echo ""
echo "--- Simulated Input ---"
echo ""

# Create input file
cat > /tmp/rtw_test_input.txt << 'EOF'
1
3
PASS12345
1990-01-01
y
EOF

echo "Input sequence:"
echo "  1. Select '1' (Auto-register test user)"
echo "  2. Select '3' (Share Code verification)"
echo "  3. Enter share code: PASS12345"
echo "  4. Enter date of birth: 1990-01-01"
echo "  5. Check status: y"
echo ""
echo "--- Running Test ---"
echo ""

# Run the actual test with piped input
cd /tmp/shift-booking-backend
ts-node scripts/testRightToWork.ts < /tmp/rtw_test_input.txt

echo ""
echo "═══════════════════════════════════════════════════"
echo "  Demo Complete!"
echo "═══════════════════════════════════════════════════"
