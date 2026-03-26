import { Router } from 'express';
import { BusinessProfileController } from '../controllers/businessProfileController';
import { authenticateToken, requireBusiness } from '../middleware/authMiddleware';

const router = Router();

// Get current authenticated business profile
router.get('/profile', authenticateToken, requireBusiness, BusinessProfileController.getCurrentProfile);

// Update current authenticated business profile
router.put('/profile', authenticateToken, requireBusiness, BusinessProfileController.updateCurrentProfile);

// Get shifts created by the authenticated business
router.get('/shifts', authenticateToken, requireBusiness, BusinessProfileController.getMyShifts);

// Create business profile
router.post('/', BusinessProfileController.createProfile);

// Get all business profiles
router.get('/', BusinessProfileController.getAllProfiles);

// Get verified businesses
router.get('/verified', BusinessProfileController.getVerified);

// Get top-rated businesses
router.get('/top-rated', BusinessProfileController.getTopRated);

// Get businesses by business type
router.get('/business-type', BusinessProfileController.getByBusinessType);

// Get business profile by user ID
router.get('/:userId', BusinessProfileController.getProfileByUserId);

// Update business profile
router.put('/:userId', BusinessProfileController.updateProfile);

// Delete business profile
router.delete('/:userId', BusinessProfileController.deleteProfile);

export default router;
