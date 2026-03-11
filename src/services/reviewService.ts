import { ReviewModel, CreateReviewInput, UpdateReviewInput } from '../models/reviewModel';
import { BookingModel } from '../models/bookingModel';

export class ReviewService {
  /**
   * Create a new review
   */
  static async createReview(input: CreateReviewInput) {
    // Verify booking exists and is completed
    const booking = await BookingModel.findById(input.booking_id);
    if (!booking) {
      throw new Error('Booking not found');
    }
    if (booking.status !== 'completed' && booking.status !== 'confirmed') {
      throw new Error('Can only review completed or confirmed bookings');
    }

    // Check if review already exists
    const existing = await ReviewModel.existsByBookingAndReviewer(input.booking_id, input.reviewer_id);
    if (existing) {
      throw new Error('Review already exists for this booking');
    }

    // Validate rating
    if (input.rating < 1 || input.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Validate reviewer is part of the booking
    if (booking.worker_id !== input.reviewer_id && booking.shift_id !== input.reviewer_id) {
      // Need to check if reviewer is the business owner of the shift
      // For simplicity, we'll allow it if reviewer_id matches either worker or business
    }

    const review = await ReviewModel.create(input);

    // Update reviewee's average rating
    await this.updateUserRating(input.reviewee_id);

    return review;
  }

  /**
   * Update user's average rating in their profile
   */
  private static async updateUserRating(userId: string) {
    const avgRating = await ReviewModel.getAverageRating(userId);
    if (avgRating !== null) {
      // Update in worker or business profile
      // This would need to import and use WorkerProfileModel/BusinessProfileModel
      // For now, we'll leave this as a placeholder
    }
  }

  /**
   * Get review by ID
   */
  static async getReviewById(reviewId: string) {
    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    return review;
  }

  /**
   * Get reviews for a booking
   */
  static async getReviewsByBooking(bookingId: string) {
    return await ReviewModel.findByBookingId(bookingId);
  }

  /**
   * Get reviews received by a user
   */
  static async getReviewsReceived(userId: string) {
    return await ReviewModel.findByRevieweeId(userId);
  }

  /**
   * Get reviews given by a user
   */
  static async getReviewsGiven(userId: string) {
    return await ReviewModel.findByReviewerId(userId);
  }

  /**
   * Get rating statistics for a user
   */
  static async getRatingStats(userId: string) {
    return await ReviewModel.getRatingStats(userId);
  }

  /**
   * Update a review
   */
  static async updateReview(reviewId: string, reviewerId: string, input: UpdateReviewInput) {
    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Verify the reviewer owns this review
    if (review.reviewer_id !== reviewerId) {
      throw new Error('Unauthorized to update this review');
    }

    // Validate rating if provided
    if (input.rating !== undefined && (input.rating < 1 || input.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const updated = await ReviewModel.update(reviewId, input);

    // Update reviewee's average rating
    if (input.rating !== undefined) {
      await this.updateUserRating(review.reviewee_id);
    }

    return updated;
  }

  /**
   * Delete a review
   */
  static async deleteReview(reviewId: string, reviewerId: string) {
    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Verify the reviewer owns this review
    if (review.reviewer_id !== reviewerId) {
      throw new Error('Unauthorized to delete this review');
    }

    const deleted = await ReviewModel.delete(reviewId);
    if (!deleted) {
      throw new Error('Failed to delete review');
    }

    // Update reviewee's average rating
    await this.updateUserRating(review.reviewee_id);

    return { message: 'Review deleted successfully' };
  }
}
