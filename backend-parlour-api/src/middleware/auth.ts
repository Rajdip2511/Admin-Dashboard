import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IJWTPayload, UserRole } from '@/types';
import { AppError } from '@/middleware/errorHandler';
import User from '@/models/User';

// Extend Request interface to include user
import { IUser } from '@/types';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Verify JWT token
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      throw new AppError('Authentication token is required', 401);
    }

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      throw new AppError('JWT secret is not configured', 500);
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as IJWTPayload;
    
    // Find user in database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (!user.isActive) {
      throw new AppError('User account is deactivated', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid authentication token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Authentication token has expired', 401));
    } else {
      next(error);
    }
  }
};

// Extract token from request
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check for token in query parameters (for WebSocket connections)
  const tokenFromQuery = req.query['token'] as string;
  if (tokenFromQuery) {
    return tokenFromQuery;
  }
  
  return null;
};

// Role-based authorization
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    next();
  };
};

// Super admin only authorization
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  if (req.user.role !== UserRole.SUPER_ADMIN) {
    throw new AppError('Super admin access required', 403);
  }

  next();
};

// Admin or Super admin authorization
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
    throw new AppError('Admin access required', 403);
  }

  next();
};

// Optional authentication (for public routes that can benefit from user context)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return next();
    }

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as IJWTPayload;
    
    // Find user in database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Don't throw error for optional auth, just proceed without user
    next();
  }
};

// Rate limiting per user
export const userRateLimit = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    
    if (!userRequests.has(userId)) {
      userRequests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const userLimit = userRequests.get(userId)!;
    
    if (now > userLimit.resetTime) {
      userLimit.count = 1;
      userLimit.resetTime = now + windowMs;
      return next();
    }

    if (userLimit.count >= maxRequests) {
      throw new AppError('Rate limit exceeded for user', 429);
    }

    userLimit.count++;
    next();
  };
};

// Middleware to check if user owns resource
export const requireOwnership = (resourceIdParam: string = 'id', userIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.user._id.toString();
    
    // Super admin can access any resource
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    // Check if user owns the resource
    if (req.body[userIdField] !== userId && req.params['userId'] !== userId) {
      throw new AppError('Access denied: You can only access your own resources', 403);
    }

    next();
  };
};

export default authenticate; 