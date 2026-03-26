import { RightToWorkModel } from '../models/rightToWorkModel';

/**
 * Simplified Right-to-Work Service
 */
export class RightToWorkService {
  static async getWorkerStatus(workerId: string) {
    const records = await RightToWorkModel.findByWorkerId(workerId);
    const verifiedRecords = records.filter(r => r.share_status === 'verified');
    return {
      is_verified: verifiedRecords.length > 0,
      total_records: records.length,
      verified_count: verifiedRecords.length,
      records,
    };
  }

  static async createRecord(
    workerId: string,
    employeeNr: string,
    name: string,
    shareStatus?: 'verified' | 'not_verified'
  ) {
    return RightToWorkModel.create({
      worker_id: workerId,
      employee_nr: String(employeeNr).padStart(2, '0'),
      name,
      share_status: shareStatus || 'not_verified',
    });
  }

  static async markDocumentsProvided(recordId: string) {
    return RightToWorkModel.update(recordId, { documents_provided_at: new Date() });
  }

  static async updateVerificationStatus(recordId: string, shareStatus: 'verified' | 'not_verified') {
    return RightToWorkModel.update(recordId, { share_status: shareStatus });
  }

  static async hasVerifiedRecords(workerId: string): Promise<boolean> {
    return RightToWorkModel.hasVerifiedRecords(workerId);
  }
}
