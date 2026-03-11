import { BusinessProfileModel, CreateBusinessProfileInput, UpdateBusinessProfileInput } from '../models/businessProfileModel';
import { UserModel } from '../models/userModel';

export class BusinessProfileService {
  /**
   * Create a new business profile
   */
  static async createProfile(input: CreateBusinessProfileInput) {
    // Verify user exists and is a business
    const user = await UserModel.findById(input.user_id);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.role !== 'business') {
      throw new Error('User must have business role');
    }

    // Check if profile already exists
    const existingProfile = await BusinessProfileModel.findByUserId(input.user_id);
    if (existingProfile) {
      throw new Error('Business profile already exists for this user');
    }

    // Validate company name
    if (!input.company_name || input.company_name.trim().length < 2) {
      throw new Error('Company name must be at least 2 characters');
    }

    return await BusinessProfileModel.create(input);
  }

  /**
   * Get business profile by user ID
   */
  static async getProfileByUserId(userId: string) {
    const profile = await BusinessProfileModel.findByUserId(userId);
    if (!profile) {
      throw new Error('Business profile not found');
    }
    return profile;
  }

  /**
   * Update business profile
   */
  static async updateProfile(userId: string, input: UpdateBusinessProfileInput) {
    // Validate company name if provided
    if (input.company_name && input.company_name.trim().length < 2) {
      throw new Error('Company name must be at least 2 characters');
    }

    const profile = await BusinessProfileModel.update(userId, input);
    if (!profile) {
      throw new Error('Business profile not found');
    }

    return profile;
  }

  /**
   * Get verified businesses
   */
  static async getVerifiedBusinesses() {
    return await BusinessProfileModel.findVerified();
  }

  /**
   * Get businesses by industry
   */
  static async getByIndustry(industry: string) {
    if (!industry || industry.trim().length === 0) {
      throw new Error('Industry cannot be empty');
    }
    return await BusinessProfileModel.findByIndustry(industry);
  }

  /**
   * Get top-rated businesses
   */
  static async getTopRated(limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    return await BusinessProfileModel.findTopRated(limit);
  }

  /**
   * Get all business profiles
   */
  static async getAllProfiles() {
    return await BusinessProfileModel.findAll();
  }

  /**
   * Delete business profile
   */
  static async deleteProfile(userId: string) {
    const deleted = await BusinessProfileModel.delete(userId);
    if (!deleted) {
      throw new Error('Business profile not found');
    }
    return { message: 'Business profile deleted successfully' };
  }
}
