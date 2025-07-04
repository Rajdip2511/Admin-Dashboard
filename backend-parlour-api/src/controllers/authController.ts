import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { IAPIResponse, UserRole } from '@/types';
import User from '@/models/User';
import { AppError, asyncHandler } from '@/middleware/errorHandler';

// Register a new user (Super Admin only)
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const { email, password, firstName, lastName, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 409));
  }

  // Create new user
  const user = new User({
    email: email.toLowerCase(),
    password,
    firstName,
    lastName,
    role: role || UserRole.ADMIN
  });

  await user.save();

  // Generate JWT token
  const token = user.generateAuthToken();

  const response: IAPIResponse = {
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      token
    }
  };

  res.status(201).json(response);
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Account is deactivated', 401));
  }

  // Compare password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = user.generateAuthToken();

  const response: IAPIResponse = {
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      },
      token
    }
  };

  res.status(200).json(response);
});

// Get current user profile
export const getProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const response: IAPIResponse = {
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    }
  };

  res.status(200).json(response);
});

// Update user profile
export const updateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const user = req.user;
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const { firstName, lastName } = req.body;

  // Update user
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;

  await user.save();

  const response: IAPIResponse = {
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        updatedAt: user.updatedAt
      }
    }
  };

  res.status(200).json(response);
});

// Change password
export const changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const user = req.user;
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const userWithPassword = await User.findById(user._id).select('+password');
  if (!userWithPassword) {
    return next(new AppError('User not found', 404));
  }

  // Verify current password
  const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Update password
  userWithPassword.password = newPassword;
  await userWithPassword.save();

  const response: IAPIResponse = {
    success: true,
    message: 'Password changed successfully'
  };

  res.status(200).json(response);
});

// Refresh token
export const refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Generate new token
  const token = user.generateAuthToken();

  const response: IAPIResponse = {
    success: true,
    message: 'Token refreshed successfully',
    data: {
      token
    }
  };

  res.status(200).json(response);
});

// Logout (client-side token removal)
export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const response: IAPIResponse = {
    success: true,
    message: 'Logged out successfully'
  };

  res.status(200).json(response);
});

// Validation rules for registration
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid user role')
];

// Validation rules for login
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for profile update
export const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
];

// Validation rules for change password
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

export default {
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
}; 