import { Request, Response, NextFunction } from 'express';
import { BusinessProfileService } from '../services/businessProfileService';

export class BusinessProfileController {
  /**
   * Create business profile
   */
  static async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await BusinessProfileService.createProfile(req.body);
      res.status(201).json(profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get business profile by user ID
   */
  static async getProfileByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const profile = await BusinessProfileService.getProfileByUserId(userId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update business profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const profile = await BusinessProfileService.updateProfile(userId, req.body);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all business profiles
   */
  static async getAllProfiles(_req: Request, res: Response, next: NextFunction) {
    try {
      const profiles = await BusinessProfileService.getAllProfiles();
      res.json(profiles);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get verified businesses
   */
  static async getVerified(_req: Request, res: Response, next: NextFunction) {
    try {
      const profiles = await BusinessProfileService.getVerifiedBusinesses();
      res.json(profiles);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get businesses by business type
   */
  static async getByBusinessType(req: Request, res: Response, next: NextFunction) {
    try {
      const { business_type } = req.query;
      const profiles = await BusinessProfileService.getByBusinessType(business_type as string);
      res.json(profiles);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top-rated businesses
   */
  static async getTopRated(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const profiles = await BusinessProfileService.getTopRated(limit);
      res.json(profiles);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete business profile
   */
  static async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await BusinessProfileService.deleteProfile(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated business profile
   */
  static async getCurrentProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const profile = await BusinessProfileService.getProfileByUserId(req.user.userId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update current authenticated business profile
   */
  static async updateCurrentProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const profile = await BusinessProfileService.updateProfile(req.user.userId, req.body);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get shifts created by authenticated business
   */
  static async getMyShifts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const { ShiftService } = await import('../services/shiftService');
      const shifts = await ShiftService.getShiftsByBusinessId(req.user.userId);
      res.json({
        success: true,
        data: shifts,
        count: shifts.length
      });
    } catch (error) {
      next(error);
    }
  }
}
