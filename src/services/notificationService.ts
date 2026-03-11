import { NotificationModel, CreateNotificationInput } from '../models/notificationModel';

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(input: CreateNotificationInput) {
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }
    if (!input.message || input.message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    return await NotificationModel.create(input);
  }

  /**
   * Create multiple notifications at once
   */
  static async createBulkNotifications(notifications: CreateNotificationInput[]) {
    if (!notifications || notifications.length === 0) {
      throw new Error('Notifications array cannot be empty');
    }

    return await NotificationModel.createBulk(notifications);
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId: string, limit: number = 50) {
    if (limit < 1 || limit > 200) {
      throw new Error('Limit must be between 1 and 200');
    }
    return await NotificationModel.findByUserId(userId, limit);
  }

  /**
   * Get unread notifications
   */
  static async getUnreadNotifications(userId: string) {
    return await NotificationModel.findUnreadByUserId(userId);
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(userId: string) {
    const count = await NotificationModel.getUnreadCount(userId);
    return { count };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string) {
    const notification = await NotificationModel.markAsRead(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return notification;
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string) {
    const count = await NotificationModel.markAllAsRead(userId);
    return { message: `${count} notifications marked as read` };
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string) {
    const deleted = await NotificationModel.delete(notificationId);
    if (!deleted) {
      throw new Error('Notification not found');
    }
    return { message: 'Notification deleted successfully' };
  }

  /**
   * Delete all notifications for a user
   */
  static async deleteAllNotifications(userId: string) {
    const count = await NotificationModel.deleteAllForUser(userId);
    return { message: `${count} notifications deleted` };
  }

  /**
   * Delete old notifications
   */
  static async deleteOldNotifications(userId: string, daysOld: number = 30) {
    if (daysOld < 1) {
      throw new Error('Days old must be at least 1');
    }
    const count = await NotificationModel.deleteOldNotifications(userId, daysOld);
    return { message: `${count} old notifications deleted` };
  }

  // Helper methods for common notification scenarios

  /**
   * Send booking created notification
   */
  static async notifyBookingCreated(userId: string, shiftTitle: string, bookingId: string) {
    return await this.createNotification({
      user_id: userId,
      type: 'booking_created',
      title: 'New Booking Created',
      message: `Your booking for "${shiftTitle}" has been created.`,
      data: { booking_id: bookingId }
    });
  }

  /**
   * Send booking confirmed notification
   */
  static async notifyBookingConfirmed(userId: string, shiftTitle: string, bookingId: string) {
    return await this.createNotification({
      user_id: userId,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: `Your booking for "${shiftTitle}" has been confirmed!`,
      data: { booking_id: bookingId }
    });
  }

  /**
   * Send booking cancelled notification
   */
  static async notifyBookingCancelled(userId: string, shiftTitle: string, bookingId: string, reason?: string) {
    return await this.createNotification({
      user_id: userId,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Your booking for "${shiftTitle}" has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
      data: { booking_id: bookingId, reason }
    });
  }

  /**
   * Send shift reminder notification
   */
  static async notifyShiftReminder(userId: string, shiftTitle: string, startTime: Date) {
    return await this.createNotification({
      user_id: userId,
      type: 'shift_reminder',
      title: 'Shift Reminder',
      message: `Reminder: Your shift "${shiftTitle}" starts at ${startTime.toLocaleString()}.`,
      data: { start_time: startTime }
    });
  }

  /**
   * Send review received notification
   */
  static async notifyReviewReceived(userId: string, reviewerName: string, rating: number, reviewId: string) {
    return await this.createNotification({
      user_id: userId,
      type: 'review_received',
      title: 'New Review Received',
      message: `${reviewerName} left you a ${rating}-star review.`,
      data: { review_id: reviewId, rating }
    });
  }

  /**
   * Send payment processed notification
   */
  static async notifyPaymentProcessed(userId: string, amount: number, payoutId: string) {
    return await this.createNotification({
      user_id: userId,
      type: 'payment_processed',
      title: 'Payment Processed',
      message: `Your payment of $${amount.toFixed(2)} has been processed.`,
      data: { payout_id: payoutId, amount }
    });
  }
}
