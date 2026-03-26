import { WorkerProfileModel, CreateWorkerProfileInput, UpdateWorkerProfileInput } from '../models/workerProfileModel';
import { UserModel } from '../models/userModel';

export class WorkerProfileService {
  /**
   * Create a new worker profile
   */
  static async createProfile(input: CreateWorkerProfileInput) {
    // Verify user exists and is a worker
    const user = await UserModel.findById(input.user_id);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.role !== 'worker') {
      throw new Error('User must have worker role');
    }

    // Check if profile already exists
    const existingProfile = await WorkerProfileModel.findByUserId(input.user_id);
    if (existingProfile) {
      throw new Error('Worker profile already exists for this user');
    }

    // Validate hourly rate if provided
    if (input.hourly_rate !== undefined && input.hourly_rate < 0) {
      throw new Error('Hourly rate must be positive');
    }

    return await WorkerProfileModel.create(input);
  }

  /**
   * Get worker profile by user ID
   */
  static async getProfileByUserId(userId: string) {
    const profile = await WorkerProfileModel.findByUserId(userId);
    if (!profile) {
      throw new Error('Worker profile not found');
    }
    return profile;
  }

  /**
   * Update worker profile
   */
  static async updateProfile(userId: string, input: UpdateWorkerProfileInput) {
    // Validate hourly rate if provided
    if (input.hourly_rate !== undefined && input.hourly_rate < 0) {
      throw new Error('Hourly rate must be positive');
    }

    const profile = await WorkerProfileModel.update(userId, input);
    if (!profile) {
      throw new Error('Worker profile not found');
    }

    return profile;
  }

  /**
   * Search workers by skills
   */
  static async searchBySkills(skills: string[]) {
    if (!skills || skills.length === 0) {
      throw new Error('Skills array cannot be empty');
    }
    return await WorkerProfileModel.searchBySkills(skills);
  }

  /**
   * Get top-rated workers
   */
  static async getTopRated(limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    return await WorkerProfileModel.findTopRated(limit);
  }

  /**
   * Get all worker profiles
   */
  static async getAllProfiles() {
    return await WorkerProfileModel.findAll();
  }

  /**
   * Delete worker profile
   */
  static async deleteProfile(userId: string) {
    const deleted = await WorkerProfileModel.delete(userId);
    if (!deleted) {
      throw new Error('Worker profile not found');
    }
    return { message: 'Worker profile deleted successfully' };
  }
}
