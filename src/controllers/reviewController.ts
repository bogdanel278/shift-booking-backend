import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/reviewService';

export class ReviewController {
  /**
   * Create a review
   */
  static async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await ReviewService.createReview(req.body);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get review by ID
   */
  static async getReviewById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const review = await ReviewService.getReviewById(id);
      res.json(review);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get reviews for a booking
   */
  static async getReviewsByBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const reviews = await ReviewService.getReviewsByBooking(bookingId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get reviews received by a user
   */
  static async getReviewsReceived(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const reviews = await ReviewService.getReviewsReceived(userId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get reviews given by a user
   */
  static async getReviewsGiven(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const reviews = await ReviewService.getReviewsGiven(userId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get rating statistics for a user
   */
  static async getRatingStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const stats = await ReviewService.getRatingStats(userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a review
   */
  static async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reviewer_id } = req.body;
      const review = await ReviewService.updateReview(id, reviewer_id, req.body);
      res.json(review);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a review
   */
  static async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reviewer_id } = req.body;
      const result = await ReviewService.deleteReview(id, reviewer_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
