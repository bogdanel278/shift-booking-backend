import axios from 'axios';

interface VouchsafeConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
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
 * NOTE: This is a scaffold implementation. Actual Vouchsafe API endpoints
 * and authentication flow need to be configured based on their documentation.
 * 
 * TODO: Update with actual Vouchsafe API specification
 */
export class VouchsafeService {
  private config: VouchsafeConfig;

  constructor() {
    this.config = {
      clientId: process.env.VOUCHSAFE_CLIENT_ID || 'cmmm59d400001viihnspty8e5',
      clientSecret: process.env.VOUCHSAFE_CLIENT_SECRET || '',
      baseUrl: process.env.VOUCHSAFE_BASE_URL || 'https://api.vouchsafe.co.uk',
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

      // TODO: Replace with actual Vouchsafe API endpoint when available
      const response = await axios.post(`${this.config.baseUrl}/v1/verify/share-code`, {
        share_code: request.shareCode,
        date_of_birth: request.dateOfBirth,
        client_id: this.config.clientId,
      }, {
        headers: {
          'Authorization': `Bearer ${this.config.clientSecret}`,
        }
      });

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
      
      return {
        success: false,
        status: 'failed',
        message: error.response?.data?.message || error.message || 'Verification failed',
        details: error.response?.data,
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
