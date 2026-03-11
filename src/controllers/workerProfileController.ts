import { Request, Response, NextFunction } from 'express';
import { WorkerProfileService } from '../services/workerProfileService';

export class WorkerProfileController {
  /**
   * Create worker profile
   */
  static async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await WorkerProfileService.createProfile(req.body);
      res.status(201).json(profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get worker profile by user ID
   */
  static async getProfileByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const profile = await WorkerProfileService.getProfileByUserId(userId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update worker profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const profile = await WorkerProfileService.updateProfile(userId, req.body);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all worker profiles
   */
  static async getAllProfiles(_req: Request, res: Response, next: NextFunction) {
    try {
      const profiles = await WorkerProfileService.getAllProfiles();
      res.json(profiles);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search workers by skills
   */
  static async searchBySkills(req: Request, res: Response, next: NextFunction) {
    try {
      const { skills } = req.query;
      const skillsArray = typeof skills === 'string' ? skills.split(',') : [];
      const profiles = await WorkerProfileService.searchBySkills(skillsArray);
      res.json(profiles);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top-rated workers
   */
  static async getTopRated(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const profiles = await WorkerProfileService.getTopRated(limit);
      res.json(profiles);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete worker profile
   */
  static async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await WorkerProfileService.deleteProfile(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
