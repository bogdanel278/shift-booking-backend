import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';

const router = Router();

// Create a review
router.post('/', ReviewController.createReview);

// Get reviews for a booking
router.get('/booking/:bookingId', ReviewController.getReviewsByBooking);

// Get reviews received by a user
router.get('/user/:userId/received', ReviewController.getReviewsReceived);

// Get reviews given by a user
router.get('/user/:userId/given', ReviewController.getReviewsGiven);

// Get rating statistics for a user
router.get('/user/:userId/stats', ReviewController.getRatingStats);

// Get review by ID
router.get('/:id', ReviewController.getReviewById);

// Update a review
router.put('/:id', ReviewController.updateReview);

// Delete a review
router.delete('/:id', ReviewController.deleteReview);

export default router;
