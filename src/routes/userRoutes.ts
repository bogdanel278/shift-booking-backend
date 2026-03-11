import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();

/**
 * @route   POST /api/users
 * @desc    Create a new user (worker or business)
 * @access  Public
 */
router.post('/', UserController.createUser);

/**
 * @route   GET /api/users
 * @desc    Get all users (optional: filter by role)
 * @query   role - Filter by 'worker' or 'business'
 * @access  Public
 */
router.get('/', UserController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:id', UserController.getUserById);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Public
 */
router.delete('/:id', UserController.deleteUser);

export default router;
