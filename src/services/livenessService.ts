import { RightToWorkModel, CreateRTWVerificationInput } from '../models/rightToWorkModel';
import { UserModel } from '../models/userModel';
import { VeriffService } from './veriffService';

/**
 * Liveness Verification Service
 * Handles liveness check session creation and callback processing
 */
export class LivenessService {
  private static veriffService = new VeriffService();
  /**
   * Create or retrieve liveness session for worker
   * Creates a right_to_work_verifications record if it doesn't exist
   */
  static async createSession(
    workerId: string,
    employeeNr?: string,
    name?: string,
    vendorData?: string,
    callbackUrl?: string
  ) {
    // Get user's name if not provided
    let workerName = name;
    if (!workerName) {
      const user = await UserModel.findById(workerId);
      if (!user) {
        throw new Error('Worker not found');
      }
      workerName = user.name;
    }

    // Auto-generate employee number if not provided
    let normalizedEmployeeNr: string;
    if (employeeNr) {
      normalizedEmployeeNr = String(employeeNr).padStart(2, '0');
    } else {
      normalizedEmployeeNr = await RightToWorkModel.getNextEmployeeNr(workerId);
    }

    // Check if record already exists
    let record = await RightToWorkModel.findByWorkerAndEmployeeNr(
      workerId,
      normalizedEmployeeNr
    );

    // Create new record if it doesn't exist
    if (!record) {
      const input: CreateRTWVerificationInput = {
        worker_id: workerId,
        employee_nr: normalizedEmployeeNr,
        name: workerName,
        share_status: 'not_verified',
        documents_provided_at: undefined,
      };
      record = await RightToWorkModel.create(input);
    } else {
      // If record exists but was previously verified, reset to not_verified for new session
      if (record.share_status === 'verified') {
        record = await RightToWorkModel.update(record.id, {
          share_status: 'not_verified',
          documents_provided_at: undefined,
        }) || record;
      }
    }

    // Create actual Veriff session with real URL
    const veriffSession = await this.veriffService.createLivenessSession({
      workerUserId: workerId,
      callbackUrl: callbackUrl || process.env.VERIFF_CALLBACK_URL,
      vendorData: vendorData || `rtw:${record.id}`,
    });

    // Return response compatible with mobile app expectations
    return {
      verificationId: record.id,
      sessionId: veriffSession.sessionId,
      sessionUrl: veriffSession.sessionUrl,
      status: veriffSession.status,
      session_id: record.id,
      worker_id: workerId,
      employee_nr: normalizedEmployeeNr,
      name: workerName,
      share_status: record.share_status,
      created_at: record.created_at,
      vendorData,
      callbackUrl,
    };
  }

  /**
   * Process liveness callback
   * Updates verification status based on success/failure
   */
  static async processCallback(
    workerId: string,
    status: 'success' | 'failure',
    sessionId?: string
  ) {
    let record;

    // Find record by session ID if provided, otherwise get most recent
    if (sessionId) {
      record = await RightToWorkModel.findById(sessionId);
      if (!record || record.worker_id !== workerId) {
        throw new Error('Session not found or does not belong to worker');
      }
    } else {
      // Get most recent record for this worker
      const records = await RightToWorkModel.findByWorkerId(workerId);
      if (records.length === 0) {
        throw new Error('No verification record found for worker');
      }
      record = records[0]; // Most recent
    }

    // Update based on status
    if (status === 'success') {
      record = await RightToWorkModel.update(record.id, {
        share_status: 'verified',
        documents_provided_at: new Date(),
      }) || record;
    } else {
      // On failure, ensure status remains not_verified
      if (record.share_status !== 'not_verified') {
        record = await RightToWorkModel.update(record.id, {
          share_status: 'not_verified',
          documents_provided_at: undefined,
        }) || record;
      }
    }

    return {
      verification_id: record.id,
      worker_id: record.worker_id,
      share_status: record.share_status,
      documents_provided_at: record.documents_provided_at,
      verified: record.share_status === 'verified',
      updated_at: record.updated_at,
    };
  }

  /**
   * Get liveness status for worker
   */
  static async getStatus(workerId: string) {
    const records = await RightToWorkModel.findByWorkerId(workerId);
    const verifiedRecords = records.filter(r => r.share_status === 'verified');

    return {
      worker_id: workerId,
      has_verified_liveness: verifiedRecords.length > 0,
      total_verifications: records.length,
      verified_count: verifiedRecords.length,
      records: records.map(r => ({
        id: r.id,
        employee_nr: r.employee_nr,
        name: r.name,
        share_status: r.share_status,
        documents_provided_at: r.documents_provided_at,
        created_at: r.created_at,
      })),
    };
  }
}
