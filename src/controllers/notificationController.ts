import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService';

export class NotificationController {
  /**
   * Create a notification
   */
  static async createNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await NotificationService.createNotification(req.body);
      res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const notifications = await NotificationService.getUserNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread notifications
   */
  static async getUnreadNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const notifications = await NotificationService.getUnreadNotifications(userId);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await NotificationService.getUnreadCount(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notification = await NotificationService.markAsRead(id);
      res.json(notification);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await NotificationService.markAllAsRead(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await NotificationService.deleteNotification(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete all notifications for a user
   */
  static async deleteAllNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await NotificationService.deleteAllNotifications(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
