import { pool } from '../config/database';

export type ReviewType = 'worker_to_business' | 'business_to_worker';

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  type: ReviewType;
  rating: number; // 1-5
  comment: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CreateReviewInput {
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  type: ReviewType;
  rating: number;
  comment?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

export class ReviewModel {
  /**
   * Create a new review
   */
  static async create(input: CreateReviewInput): Promise<Review> {
    const { booking_id, reviewer_id, reviewee_id, type, rating, comment } = input;
    
    const query = `
      INSERT INTO reviews (
        booking_id, reviewer_id, reviewee_id, type, rating, comment
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      booking_id,
      reviewer_id,
      reviewee_id,
      type,
      rating,
      comment || null
    ]);
    
    return result.rows[0];
  }

  /**
   * Find review by ID (excluding soft-deleted)
   */
  static async findById(id: string): Promise<Review | null> {
    const query = 'SELECT * FROM reviews WHERE id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find review by booking ID
   */
  static async findByBookingId(bookingId: string): Promise<Review[]> {
    const query = `
      SELECT * FROM reviews 
      WHERE booking_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [bookingId]);
    return result.rows;
  }

  /**
   * Check if review exists for booking and reviewer
   */
  static async existsByBookingAndReviewer(bookingId: string, reviewerId: string): Promise<boolean> {
    const query = `
      SELECT id FROM reviews 
      WHERE booking_id = $1 AND reviewer_id = $2 AND deleted_at IS NULL
    `;
    const result = await pool.query(query, [bookingId, reviewerId]);
    return result.rows.length > 0;
  }

  /**
   * Get all reviews for a user (as reviewee)
   */
  static async findByRevieweeId(revieweeId: string): Promise<Review[]> {
    const query = `
      SELECT * FROM reviews 
      WHERE reviewee_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [revieweeId]);
    return result.rows;
  }

  /**
   * Get all reviews by a user (as reviewer)
   */
  static async findByReviewerId(reviewerId: string): Promise<Review[]> {
    const query = `
      SELECT * FROM reviews 
      WHERE reviewer_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [reviewerId]);
    return result.rows;
  }

  /**
   * Get reviews received by type
   */
  static async findByRevieweeAndType(revieweeId: string, type: ReviewType): Promise<Review[]> {
    const query = `
      SELECT * FROM reviews 
      WHERE reviewee_id = $1 AND type = $2 AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [revieweeId, type]);
    return result.rows;
  }

  /**
   * Calculate average rating for a user
   */
  static async getAverageRating(revieweeId: string): Promise<number | null> {
    const query = `
      SELECT AVG(rating) as avg_rating
      FROM reviews 
      WHERE reviewee_id = $1 AND deleted_at IS NULL
    `;
    const result = await pool.query(query, [revieweeId]);
    const avgRating = result.rows[0].avg_rating;
    return avgRating ? parseFloat(avgRating) : null;
  }

  /**
   * Get rating statistics for a user
   */
  static async getRatingStats(revieweeId: string): Promise<{ average: number; total: number; distribution: any }> {
    const query = `
      SELECT 
        AVG(rating) as average,
        COUNT(*) as total,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews 
      WHERE reviewee_id = $1 AND deleted_at IS NULL
    `;
    const result = await pool.query(query, [revieweeId]);
    const row = result.rows[0];
    
    return {
      average: row.average ? parseFloat(row.average) : 0,
      total: parseInt(row.total),
      distribution: {
        5: parseInt(row.five_star),
        4: parseInt(row.four_star),
        3: parseInt(row.three_star),
        2: parseInt(row.two_star),
        1: parseInt(row.one_star)
      }
    };
  }

  /**
   * Update review
   */
  static async update(id: string, input: UpdateReviewInput): Promise<Review | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE reviews 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Soft delete review
   */
  static async delete(id: string): Promise<boolean> {
    const query = `
      UPDATE reviews 
      SET deleted_at = NOW() 
      WHERE id = $1 AND deleted_at IS NULL 
      RETURNING id
    `;
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
