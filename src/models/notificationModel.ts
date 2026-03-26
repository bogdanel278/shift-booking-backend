import { pool } from '../config/database';

export type NotificationType = 
  | 'booking_created' 
  | 'booking_confirmed' 
  | 'booking_cancelled' 
  | 'shift_reminder' 
  | 'review_received' 
  | 'payment_processed'
  | 'message_received'
  | 'system_announcement';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: any | null; // JSONB field for additional data
  is_read: boolean;
  read_at: Date | null;
  created_at: Date;
  deleted_at: Date | null;
}

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

export class NotificationModel {
  /**
   * Create a new notification
   */
  static async create(input: CreateNotificationInput): Promise<Notification> {
    const { user_id, type, title, message, data } = input;
    
    const query = `
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      user_id,
      type,
      title,
      message,
      data || null
    ]);
    
    return result.rows[0];
  }

  /**
   * Create bulk notifications
   */
  static async createBulk(notifications: CreateNotificationInput[]): Promise<Notification[]> {
    if (notifications.length === 0) return [];

    const values: any[] = [];
    const placeholders: string[] = [];
    
    notifications.forEach((notif, index) => {
      const offset = index * 5;
      placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`);
      values.push(
        notif.user_id,
        notif.type,
        notif.title,
        notif.message,
        notif.data || null
      );
    });

    const query = `
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ${placeholders.join(', ')}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Find notification by ID (excluding soft-deleted)
   */
  static async findById(id: string): Promise<Notification | null> {
    const query = 'SELECT * FROM notifications WHERE id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all notifications for a user
   */
  static async findByUserId(userId: string, limit: number = 50): Promise<Notification[]> {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  /**
   * Get unread notifications for a user
   */
  static async findUnreadByUserId(userId: string): Promise<Notification[]> {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 AND is_read = false AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM notifications 
      WHERE user_id = $1 AND is_read = false AND deleted_at IS NULL
    `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id: string): Promise<Notification | null> {
    const query = `
      UPDATE notifications 
      SET is_read = true, read_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<number> {
    const query = `
      UPDATE notifications 
      SET is_read = true, read_at = NOW()
      WHERE user_id = $1 AND is_read = false AND deleted_at IS NULL
      RETURNING id
    `;
    const result = await pool.query(query, [userId]);
    return result.rowCount || 0;
  }

  /**
   * Get notifications by type
   */
  static async findByType(userId: string, type: NotificationType): Promise<Notification[]> {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 AND type = $2 AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId, type]);
    return result.rows;
  }

  /**
   * Delete old notifications (older than specified days)
   */
  static async deleteOldNotifications(userId: string, daysOld: number = 30): Promise<number> {
    const query = `
      UPDATE notifications 
      SET deleted_at = NOW()
      WHERE user_id = $1 
      AND created_at < NOW() - INTERVAL '${daysOld} days'
      AND deleted_at IS NULL
      RETURNING id
    `;
    const result = await pool.query(query, [userId]);
    return result.rowCount || 0;
  }

  /**
   * Soft delete notification
   */
  static async delete(id: string): Promise<boolean> {
    const query = `
      UPDATE notifications 
      SET deleted_at = NOW() 
      WHERE id = $1 AND deleted_at IS NULL 
      RETURNING id
    `;
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Soft delete all notifications for a user
   */
  static async deleteAllForUser(userId: string): Promise<number> {
    const query = `
      UPDATE notifications 
      SET deleted_at = NOW() 
      WHERE user_id = $1 AND deleted_at IS NULL 
      RETURNING id
    `;
    const result = await pool.query(query, [userId]);
    return result.rowCount || 0;
  }
}
