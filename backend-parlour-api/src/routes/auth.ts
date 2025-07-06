import { Router } from 'express';
import { body } from 'express-validator';
import { login } from '../controllers/authController';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import seedDatabase from '../services/seedService';
import { UserRole } from '../types';

const router = Router();

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
], login);


// @route   GET api/auth/me
// @desc    Get user data
// @access  Private
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json(req.user);
});

// @route   GET api/auth/seed
// @desc    Seed the database
// @access  Private (Super Admin only)
router.get('/seed', authenticate, authorize([UserRole.SUPER_ADMIN]), async (req, res) => {
  const result = await seedDatabase();
  if (result.success) {
    res.status(200).json({ message: result.message });
  } else {
    res.status(500).json({ message: result.message });
  }
});


export default router; 