# API Examples

This file contains example API calls for testing the shift booking backend.

## Base URL
```
http://localhost:3000/api
```

## Health Check

```bash
curl http://localhost:3000/health
```

---

## Users API

### 1. Create a Worker
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.worker@example.com",
    "role": "worker"
  }'
```

### 2. Create a Business
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coffee Shop Inc",
    "email": "contact@coffeeshop.com",
    "role": "business"
  }'
```

### 3. Get All Users
```bash
curl http://localhost:3000/api/users
```

### 4. Get Workers Only
```bash
curl http://localhost:3000/api/users?role=worker
```

### 5. Get User by ID
```bash
curl http://localhost:3000/api/users/{USER_ID}
```

---

## Shifts API

### 1. Create a Shift
```bash
curl -X POST http://localhost:3000/api/shifts \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "{BUSINESS_USER_ID}",
    "title": "Barista Shift",
    "location": "123 Main St, Downtown",
    "start_time": "2026-03-15T09:00:00Z",
    "end_time": "2026-03-15T17:00:00Z",
    "pay_rate": 25.50
  }'
```

### 2. Get All Shifts
```bash
curl http://localhost:3000/api/shifts
```

### 3. Get Available Shifts (Future Only)
```bash
curl http://localhost:3000/api/shifts?available=true
```

### 4. Get Shifts by Business ID
```bash
curl http://localhost:3000/api/shifts?business_id={BUSINESS_USER_ID}
```

### 5. Get Shift by ID
```bash
curl http://localhost:3000/api/shifts/{SHIFT_ID}
```

### 6. Update a Shift
```bash
curl -X PUT http://localhost:3000/api/shifts/{SHIFT_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "{BUSINESS_USER_ID}",
    "title": "Senior Barista Shift",
    "pay_rate": 30.00
  }'
```

### 7. Delete a Shift
```bash
curl -X DELETE http://localhost:3000/api/shifts/{SHIFT_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "{BUSINESS_USER_ID}"
  }'
```

---

## Bookings API

### 1. Create a Booking (Worker books a shift)
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "shift_id": "{SHIFT_ID}",
    "worker_id": "{WORKER_USER_ID}"
  }'
```

### 2. Get Bookings for a Worker
```bash
curl http://localhost:3000/api/bookings/worker/{WORKER_USER_ID}
```

### 3. Get Bookings for a Shift
```bash
curl http://localhost:3000/api/bookings/shift/{SHIFT_ID}
```

### 4. Get Booking by ID
```bash
curl http://localhost:3000/api/bookings/{BOOKING_ID}
```

### 5. Update Booking Status
```bash
curl -X PUT http://localhost:3000/api/bookings/{BOOKING_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed",
    "user_id": "{BUSINESS_USER_ID}"
  }'
```

Status options: `pending`, `confirmed`, `cancelled`

### 6. Cancel a Booking
```bash
curl -X DELETE http://localhost:3000/api/bookings/{BOOKING_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "{WORKER_USER_ID}"
  }'
```

---

## Complete Example Workflow

```bash
# 1. Create a business
BUSINESS_RESPONSE=$(curl -s -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Coffee",
    "email": "coffee@downtown.com",
    "role": "business"
  }')

BUSINESS_ID=$(echo $BUSINESS_RESPONSE | jq -r '.data.id')
echo "Business ID: $BUSINESS_ID"

# 2. Create a worker
WORKER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "worker"
  }')

WORKER_ID=$(echo $WORKER_RESPONSE | jq -r '.data.id')
echo "Worker ID: $WORKER_ID"

# 3. Business creates a shift
SHIFT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/shifts \
  -H "Content-Type: application/json" \
  -d "{
    \"business_id\": \"$BUSINESS_ID\",
    \"title\": \"Morning Shift\",
    \"location\": \"123 Coffee Lane\",
    \"start_time\": \"2026-03-20T08:00:00Z\",
    \"end_time\": \"2026-03-20T16:00:00Z\",
    \"pay_rate\": 28.00
  }")

SHIFT_ID=$(echo $SHIFT_RESPONSE | jq -r '.data.id')
echo "Shift ID: $SHIFT_ID"

# 4. Worker books the shift
BOOKING_RESPONSE=$(curl -s -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d "{
    \"shift_id\": \"$SHIFT_ID\",
    \"worker_id\": \"$WORKER_ID\"
  }")

BOOKING_ID=$(echo $BOOKING_RESPONSE | jq -r '.data.id')
echo "Booking ID: $BOOKING_ID"

# 5. View worker's bookings
curl http://localhost:3000/api/bookings/worker/$WORKER_ID

# 6. Business confirms the booking
curl -X PUT http://localhost:3000/api/bookings/$BOOKING_ID \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"confirmed\",
    \"user_id\": \"$BUSINESS_ID\"
  }"
```

---

## Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Notes

- Replace `{USER_ID}`, `{SHIFT_ID}`, `{BOOKING_ID}` etc. with actual IDs
- Dates should be in ISO 8601 format
- In production, add authentication and authorization middleware
- The complete workflow example requires `jq` for JSON parsing
