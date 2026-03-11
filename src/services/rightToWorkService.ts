import { RightToWorkModel, CreateRTWVerificationInput, VerificationMethod } from '../models/rightToWorkModel';
import { VouchsafeService } from './vouchsafeService';
import { UserModel } from '../models/userModel';

export interface SubmitRTWInput {
  worker_user_id: string;
  verification_method: VerificationMethod;
  // Passport fields
  passport_number?: string;
  passport_country?: string;
  passport_expiry_date?: string;
  // Visa fields
  visa_type?: string;
  visa_expiry_date?: string;
  visa_reference?: string;
  // Share code fields
  share_code?: string;
  date_of_birth?: string;
  // Optional document upload
  document_file_url?: string;
}

export interface ReviewRTWInput {
  status: 'approved' | 'rejected';
  notes?: string;
  checked_by_user_id: string;
}

export class RightToWorkService {
  private vouchsafeService: VouchsafeService;

  constructor() {
    this.vouchsafeService = new VouchsafeService();
  }

  /**
   * Submit right-to-work verification
   */
  async submitVerification(input: SubmitRTWInput) {
    // Validate user exists and is a worker
    const user = await UserModel.findById(input.worker_user_id);
    if (!user) {
      throw new Error('Worker not found');
    }
    if (user.role !== 'worker') {
      throw new Error('Only workers can submit right-to-work verification');
    }

    // Check for existing pending verification
    const hasPending = await RightToWorkModel.hasPendingVerification(input.worker_user_id);
    if (hasPending) {
      throw new Error('You already have a pending verification. Please wait for review.');
    }

    // Validate based on verification method
    this.validateVerificationInput(input);

    // Create verification record
    const verificationInput: CreateRTWVerificationInput = {
      worker_user_id: input.worker_user_id,
      verification_method: input.verification_method,
    };

    // Add method-specific fields
    if (input.verification_method === 'passport') {
      // TODO: In production, encrypt sensitive data before storing
      verificationInput.passport_number = input.passport_number;
      verificationInput.passport_country = input.passport_country;
      verificationInput.passport_expiry_date = input.passport_expiry_date 
        ? new Date(input.passport_expiry_date) 
        : undefined;
      verificationInput.document_file_url = input.document_file_url;
    } else if (input.verification_method === 'visa') {
      verificationInput.visa_type = input.visa_type;
      verificationInput.visa_expiry_date = input.visa_expiry_date 
        ? new Date(input.visa_expiry_date) 
        : undefined;
      verificationInput.visa_reference = input.visa_reference;
      verificationInput.document_file_url = input.document_file_url;
    } else if (input.verification_method === 'share_code') {
      verificationInput.share_code = input.share_code;
    }

    const verification = await RightToWorkModel.create(verificationInput);

    // For share codes, attempt automatic verification via Vouchsafe
    if (input.verification_method === 'share_code' && input.share_code && input.date_of_birth) {
      try {
        const vouchsafeResult = await this.vouchsafeService.verifyShareCode({
          shareCode: input.share_code,
          dateOfBirth: input.date_of_birth,
        });

        // Update verification with provider response
        const status = vouchsafeResult.status;
        await RightToWorkModel.update(verification.id, {
          status,
          provider_name: 'Vouchsafe',
          provider_reference: vouchsafeResult.reference,
          raw_provider_response_json: vouchsafeResult,
          notes: vouchsafeResult.message,
        });

        // Fetch updated verification
        return await RightToWorkModel.findById(verification.id);
      } catch (error: any) {
        console.error('Vouchsafe verification error:', error.message);
        // Keep status as pending for manual review if API fails
      }
    }

    return verification;
  }

  /**
   * Validate verification input based on method
   */
  private validateVerificationInput(input: SubmitRTWInput): void {
    if (input.verification_method === 'passport') {
      if (!input.passport_number || !input.passport_country || !input.passport_expiry_date) {
        throw new Error('Passport verification requires: passport_number, passport_country, passport_expiry_date');
      }

      // Validate expiry date is in future
      const expiryDate = new Date(input.passport_expiry_date);
      if (expiryDate < new Date()) {
        throw new Error('Passport has expired');
      }
    } else if (input.verification_method === 'visa') {
      if (!input.visa_type || !input.visa_expiry_date) {
        throw new Error('Visa verification requires: visa_type, visa_expiry_date');
      }

      // Validate expiry date is in future
      const expiryDate = new Date(input.visa_expiry_date);
      if (expiryDate < new Date()) {
        throw new Error('Visa has expired');
      }
    } else if (input.verification_method === 'share_code') {
      if (!input.share_code || !input.date_of_birth) {
        throw new Error('Share code verification requires: share_code, date_of_birth');
      }
    } else {
      throw new Error('Invalid verification method');
    }
  }

  /**
   * Get verification status for a worker
   */
  async getWorkerStatus(workerId: string) {
    const verification = await RightToWorkModel.getLatestByWorkerId(workerId);
    
    if (!verification) {
      return {
        has_verification: false,
        status: null,
        verification: null,
      };
    }

    // Sanitize sensitive data in response
    const sanitized = this.sanitizeVerification(verification);

    return {
      has_verification: true,
      status: verification.status,
      verification: sanitized,
    };
  }

  /**
   * Get all pending verifications (admin only)
   */
  async getPendingVerifications() {
    const verifications = await RightToWorkModel.findPending();
    return verifications.map(v => this.sanitizeVerification(v));
  }

  /**
   * Review and approve/reject verification (admin only)
   */
  async reviewVerification(verificationId: string, review: ReviewRTWInput) {
    const verification = await RightToWorkModel.findById(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    if (verification.status !== 'pending') {
      throw new Error('Only pending verifications can be reviewed');
    }

    // Update verification
    const updated = await RightToWorkModel.update(verificationId, {
      status: review.status,
      checked_by_user_id: review.checked_by_user_id,
      notes: review.notes,
    });

    return this.sanitizeVerification(updated!);
  }

  /**
   * Sanitize sensitive data from verification object
   */
  private sanitizeVerification(verification: any) {
    const sanitized = { ...verification };
    
    // Mask passport number (show only last 4 digits)
    if (sanitized.passport_number) {
      const len = sanitized.passport_number.length;
      sanitized.passport_number = '*'.repeat(Math.max(0, len - 4)) + sanitized.passport_number.slice(-4);
    }

    // Mask share code (show only first 3 and last 2 characters)
    if (sanitized.share_code) {
      const code = sanitized.share_code;
      if (code.length > 5) {
        sanitized.share_code = code.slice(0, 3) + '*'.repeat(code.length - 5) + code.slice(-2);
      }
    }

    // Remove raw provider response from public API
    if (sanitized.raw_provider_response_json) {
      delete sanitized.raw_provider_response_json;
    }

    return sanitized;
  }
}
