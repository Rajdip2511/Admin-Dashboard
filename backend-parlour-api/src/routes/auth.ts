import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
} from '@/controllers/authController';
import { authenticate, requireSuperAdmin } from '@/middleware/auth';

const router = Router();

// Public routes
router.post('/login', validateLogin, login);
router.post('/logout', logout);

// Protected routes
router.use(authenticate); // All routes below require authentication

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', validateUpdateProfile, updateProfile);
router.post('/change-password', validateChangePassword, changePassword);
router.post('/refresh-token', refreshToken);

// Super Admin only routes
router.post('/register', requireSuperAdmin, validateRegister, register);

export default router; 