import { Request, Response, NextFunction } from 'express';
import { WorkerProfileService } from '../services/workerProfileService';

export class WorkerProfileController {
  /**
   * Get my profile (authenticated worker)
   * GET /api/worker-profiles/me
   */
  static async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const profile = await WorkerProfileService.getProfileByUserId(req.user.userId);
      
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update my profile (authenticated worker)
   * PUT /api/worker-profiles/me
   */
  static async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const profile = await WorkerProfileService.updateProfile(req.user.userId, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: profile
      });
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
}
