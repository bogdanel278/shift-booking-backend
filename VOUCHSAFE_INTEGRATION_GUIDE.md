# Vouchsafe API Integration Guide

## Current Status: ⚠️ 401 Authentication Error

The Vouchsafe API integration is returning **401 Unauthorized** errors. This guide will help you resolve the issue.

## Problem Summary

**Error:** `401 Unauthorized` when calling Vouchsafe API  
**Endpoint:** `POST https://app.vouchsafe.id/api/v1/verifications`  
**Auth Method:** Bearer token in Authorization header  

### What's Working ✅
- Sandbox mode (local simulation) works perfectly
- Database schema for RTW verifications is complete
- All authentication and authorization is working
- API endpoints are protected and validated

### What's Not Working ❌
- Production Vouchsafe API calls fail with 401
- May be using wrong API endpoint or authentication method
- API key may not have required permissions

## Resolution Steps

### Step 1: Verify API Credentials

1. **Login to Vouchsafe Dashboard**
   - Go to https://app.vouchsafe.id
   - Navigate to Settings → API Keys

2. **Check Your API Key**
   - Current key: `prod-bfe0cc47-0c50-4253-a384-61ddbb5ccd93`
   - Verify it's a **Production** key (not sandbox/test)
   - Check expiration date
   - Confirm it has "Verification API" permissions

3. **Check API Documentation**
   - Look for "Developer Docs" or "API Reference"
   - Find the correct endpoint for share code verification
   - Note the authentication method required

### Step 2: Update Configuration

Based on what you find in Vouchsafe documentation, update `.env`:

```bash
# Example configurations (adjust based on documentation):

# Option A: If using Bearer token authentication
VOUCHSAFE_CLIENT_SECRET=prod-bfe0cc47-0c50-4253-a384-61ddbb5ccd93
VOUCHSAFE_BASE_URL=https://app.vouchsafe.id

# Option B: If using API Key header
VOUCHSAFE_API_KEY=prod-bfe0cc47-0c50-4253-a384-61ddbb5ccd93
VOUCHSAFE_BASE_URL=https://api.vouchsafe.id

# Option C: If using different authentication
# (Update based on Vouchsafe documentation)
```

### Step 3: Update Vouchsafe Service Code

If the API format is different than expected, update `src/services/vouchsafeService.ts`:

**Current implementation:**
```typescript
const response = await axios.post(
  `${this.config.baseUrl}/api/v1/verifications`,
  {
    email: `temp-${Date.now()}@verification.local`,
    first_name: 'Worker',
    last_name: 'Verification',
    date_of_birth: request.dateOfBirth,
    workflow_id: this.config.workflowId,
    // ... other fields
  },
  {
    headers: {
      'Authorization': `Bearer ${this.config.clientSecret}`,
    }
  }
);
```

**Example alternative (if API uses different auth):**
```typescript
// If using X-API-Key header:
headers: {
  'X-API-Key': this.config.apiKey,
  'Content-Type': 'application/json',
}

// If using direct share code verification:
const response = await axios.get(
  `${this.config.baseUrl}/api/v1/verify-share-code`,
  {
    params: {
      share_code: request.shareCode,
      date_of_birth: request.dateOfBirth,
    },
    headers: { /* auth headers */ }
  }
);
```

### Step 4: Contact Vouchsafe Support

If still having issues:

**Email:** support@vouchsafe.co.uk  
**Subject:** API Integration - 401 Authentication Error

**Include in your email:**
```
Hi Vouchsafe Support,

I'm integrating with your API and receiving 401 errors. Can you confirm:

1. Correct API endpoint for share code verification
2. Authentication method (Bearer token, API Key header, etc.)
3. Required permissions for API key
4. Whether webhooks are needed for async verification results

My API Key ID: prod-bfe0cc47-0c50-4253-a384-61ddbb5ccd93

Current request:
POST https://app.vouchsafe.id/api/v1/verifications
Authorization: Bearer [API-KEY]

Response: 401 Unauthorized

Thanks,
[Your Name]
```

## Testing

### Use Sandbox Mode (Recommended for Development)

Set in `.env`:
```bash
VOUCHSAFE_ENVIRONMENT=sandbox
```

**Test codes:**
- `PASS12345` - Returns approved ✅
- `FAIL12345` - Returns rejected ❌
- `ERROR1234` - Returns error ⚠️

**Run tests:**
```bash
cd /tmp/shift-booking-backend && npm run test:rtw
```

### Switch to Production

Once API is working, set:
```bash
VOUCHSAFE_ENVIRONMENT=production
```

Then restart server:
```bash
npm run build
npm start
```

## Webhook Implementation (If Needed)

If Vouchsafe verification is **asynchronous** (they send results later via webhook):

### 1. Create Webhook Endpoint

Create `src/controllers/webhookController.ts`:
```typescript
export class WebhookController {
  static async vouchsafeWebhook(req: Request, res: Response) {
    const { verification_id, status, details } = req.body;
    
    // Update verification in database
    await RightToWorkModel.update(verification_id, {
      status: status,
      provider_reference: details.reference,
      raw_provider_response_json: details,
    });
    
    res.status(200).json({ received: true });
  }
}
```

### 2. Add Webhook Route

In `src/app.ts`:
```typescript
app.post('/api/webhooks/vouchsafe', WebhookController.vouchsafeWebhook);
```

### 3. Configure in Vouchsafe Dashboard

Add webhook URL:
```
https://your-domain.com/api/webhooks/vouchsafe
```

## Files to Check

```
/tmp/shift-booking-backend/
├── .env                              # API credentials
├── src/
│   ├── services/vouchsafeService.ts  # Main integration code
│   ├── controllers/rightToWorkController.ts
│   └── routes/rightToWorkRoutes.ts
└── scripts/
    └── testRightToWork.ts            # Test script
```

## Quick Reference

**Current Configuration:**
```
Base URL: https://app.vouchsafe.id
Endpoint: POST /api/v1/verifications
API Key: prod-bfe0cc47-0c50-4253-a384-61ddbb5ccd93
Environment: production
```

**Error Logs Location:**
```bash
tail -f /tmp/shift-booking-backend/server.log
```

**Rebuild After Changes:**
```bash
npm run build
pkill -f "node.*dist/index.js"
nohup node dist/index.js > server.log 2>&1 &
```

## Additional Resources

- **Vouchsafe Dashboard:** https://app.vouchsafe.id
- **Support Email:** support@vouchsafe.co.uk
- **Test Script:** `npm run test:rtw`
- **Server Logs:** `tail -f server.log`

---

**Last Updated:** March 11, 2026  
**Status:** Awaiting Vouchsafe API documentation clarification
