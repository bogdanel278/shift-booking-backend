#!/bin/bash

# Liveness Flow Test Script
# Test the /api/liveness/session and /api/liveness/callback endpoints

# Configuration
BASE_URL="http://localhost:3000"
JWT_TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with actual JWT token

echo "========================================="
echo "Liveness Flow End-to-End Test"
echo "========================================="
echo ""

# Test 1: Create Liveness Session
echo "Test 1: POST /api/liveness/session"
echo "-----------------------------------"
curl -X POST "${BASE_URL}/api/liveness/session" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_nr": "01",
    "name": "John Worker"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
echo ""

# Note: Replace WORKER_ID with actual worker ID from session response
WORKER_ID="YOUR_WORKER_ID_HERE"

# Test 2: Liveness Callback - Success
echo "Test 2: POST /api/liveness/callback (success)"
echo "----------------------------------------------"
curl -X POST "${BASE_URL}/api/liveness/callback" \
  -H "Content-Type: application/json" \
  -d "{
    \"worker_id\": \"${WORKER_ID}\",
    \"status\": \"success\"
  }" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
echo ""

# Test 3: Get Liveness Status
echo "Test 3: GET /api/liveness/status"
echo "---------------------------------"
curl -X GET "${BASE_URL}/api/liveness/status" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
echo ""

# Test 4: Liveness Callback - Failure
echo "Test 4: POST /api/liveness/callback (failure)"
echo "----------------------------------------------"
curl -X POST "${BASE_URL}/api/liveness/callback" \
  -H "Content-Type: application/json" \
  -d "{
    \"worker_id\": \"${WORKER_ID}\",
    \"status\": \"failure\"
  }" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
echo ""

echo "========================================="
echo "Tests complete!"
echo "========================================="
