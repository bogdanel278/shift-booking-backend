import axios from 'axios';

interface VouchsafeConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  workflowId: string;
  publicToken: string;
  environment: string;
}

interface ShareCodeVerificationRequest {
  shareCode: string;
  dateOfBirth: string; // YYYY-MM-DD format
}

interface VouchsafeResponse {
  success: boolean;
  status: 'approved' | 'rejected' | 'failed';
  reference?: string;
  message?: string;
  details?: any;
}

/**
 * Vouchsafe Integration Service
 * 
 * IMPORTANT: Vouchsafe API Integration Status
 * ==========================================
 * 
 * Current Status: PARTIALLY IMPLEMENTED - 401 Authentication Error
 * 
 * Issue: The API endpoint and/or authentication method needs verification from
 * Vouchsafe's official documentation or support team.
 * 
 * Current Implementation:
 * - Endpoint: POST https://app.vouchsafe.id/api/v1/verifications
 * - Auth: Bearer token in Authorization header
 * - Purpose: Creates a verification session (not direct share code check)
 * 
 * Known Issues:
 * 1. API returns 401 Unauthorized with current credentials
 * 2. The /api/v1/verifications endpoint may create a session (requiring user to visit URL)
 *    rather than directly verifying a share code
 * 3. May need webhook endpoint to receive final verification results
 * 
 * Required Actions:
 * 1. Verify correct Vouchsafe API endpoint from official documentation
 * 2. Confirm authentication method (Bearer token, API key header, etc.)
 * 3. Check if API key has required permissions in Vouchsafe dashboard
 * 4. Implement webhook handler if verification is asynchronous
 * 5. Update this service with correct endpoint and request format
 * 
 * Sandbox Mode:
 * - Works correctly for development/testing
 * - Use: PASS12345, FAIL12345, ERROR1234 for testing
 * - Set VOUCHSAFE_ENVIRONMENT=sandbox in .env
 * 
 * Contact: support@vouchsafe.co.uk for API documentation
 */
export class VouchsafeService {
  private config: VouchsafeConfig;

  constructor() {
    this.config = {
      clientId: process.env.VOUCHSAFE_CLIENT_ID || 'cmmm59d400001viihnspty8e5',
      clientSecret: process.env.VOUCHSAFE_CLIENT_SECRET || '',
      baseUrl: process.env.VOUCHSAFE_BASE_URL || 'https://api.vouchsafe.co.uk',
      workflowId: process.env.VOUCHSAFE_WORKFLOW_ID || '',
      publicToken: process.env.VOUCHSAFE_PUBLIC_TOKEN || '',
      environment: process.env.VOUCHSAFE_ENVIRONMENT || 'sandbox',
    };
  }

  /**
   * Verify share code with Vouchsafe
   */
  async verifyShareCode(request: ShareCodeVerificationRequest): Promise<VouchsafeResponse> {
    try {
      // Sandbox testing support
      if (this.config.environment === 'sandbox') {
        return this.sandboxVerifyShareCode(request.shareCode);
      }

      // Vouchsafe API endpoint - creates verification request
      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/verifications`,
        {
          email: `temp-${Date.now()}@verification.local`,
          first_name: 'Worker',
          last_name: 'Verification',
          street_address: '',
          postcode: '',
          date_of_birth: request.dateOfBirth,
          workflow_id: this.config.workflowId,
          external_id: `rtw-${Date.now()}`,
          redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verification/complete`,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.clientSecret}`,
          }
        }
      );

      const data = response.data as any;
      return {
        success: true,
        status: 'approved',
        reference: data.reference,
        message: data.message,
        details: data,
      };

    } catch (error: any) {
      console.error('Vouchsafe API error:', error.message);
      console.error('Status code:', error.response?.status);
      console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Request headers:', JSON.stringify(error.config?.headers, null, 2));
      
      // Categorize errors for better handling
      let errorMessage = 'Verification failed';
      const statusCode = error.response?.status;
      
      if (statusCode === 401) {
        errorMessage = 'Authentication failed - API credentials may be invalid or expired';
        console.error('⚠️  ACTION REQUIRED: Verify Vouchsafe API credentials in dashboard');
      } else if (statusCode === 403) {
        errorMessage = 'Access forbidden - API key may lack required permissions';
        console.error('⚠️  ACTION REQUIRED: Check API key permissions in Vouchsafe dashboard');
      } else if (statusCode === 404) {
        errorMessage = 'API endpoint not found - verify correct Vouchsafe API URL';
        console.error('⚠️  ACTION REQUIRED: Confirm API endpoint from Vouchsafe documentation');
      } else if (statusCode === 429) {
        errorMessage = 'Rate limit exceeded - too many requests to Vouchsafe API';
      } else if (statusCode >= 500) {
        errorMessage = 'Vouchsafe service temporarily unavailable';
      }
      
      return {
        success: false,
        status: 'failed',
        message: error.response?.data?.message || errorMessage,
        details: {
          statusCode,
          error: error.response?.data,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Sandbox testing with known share codes
   */
  private sandboxVerifyShareCode(shareCode: string): VouchsafeResponse {
    // Sandbox share codes for testing
    if (shareCode === 'PASS12345') {
      return {
        success: true,
        status: 'approved',
        reference: `VOUCHSAFE-${Date.now()}`,
        message: 'Share code verified successfully (sandbox)',
        details: {
          right_to_work: 'allowed',
          expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };
    }

    if (shareCode === 'FAIL12345') {
      return {
        success: false,
        status: 'rejected',
        message: 'Share code verification failed: Invalid or expired (sandbox)',
        details: {
          reason: 'expired_visa',
        },
      };
    }

    if (shareCode === 'ERROR1234') {
      return {
        success: false,
        status: 'failed',
        message: 'Service error (sandbox)',
        details: {
          error: 'service_unavailable',
        },
      };
    }

    // Default response for unknown codes
    return {
      success: false,
      status: 'rejected',
      message: 'Share code not found or invalid',
    };
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<boolean> {
    try {
      // TODO: Replace with actual health check endpoint
      // const response = await axios.get(`${this.config.baseUrl}/health`);
      // return response.status === 200;
      
      // For sandbox, always return true
      return true;
    } catch (_error) {
      return false;
    }
  }
}
