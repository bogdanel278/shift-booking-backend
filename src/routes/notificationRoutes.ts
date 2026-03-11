import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';

const router = Router();

// Create a notification
router.post('/', NotificationController.createNotification);

// Get user notifications
router.get('/user/:userId', NotificationController.getUserNotifications);

// Get unread notifications
router.get('/user/:userId/unread', NotificationController.getUnreadNotifications);

// Get unread count
router.get('/user/:userId/unread-count', NotificationController.getUnreadCount);

// Mark all notifications as read
router.post('/user/:userId/mark-all-read', NotificationController.markAllAsRead);

// Delete all notifications for a user
router.delete('/user/:userId/all', NotificationController.deleteAllNotifications);

// Mark notification as read
router.post('/:id/read', NotificationController.markAsRead);

// Delete a notification
router.delete('/:id', NotificationController.deleteNotification);

export default router;
