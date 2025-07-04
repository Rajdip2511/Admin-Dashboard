import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';
import { UserDocument } from '../models/User';

interface JwtPayload {
  user: {
    id: string;
    role: UserRole;
  };
}

export interface AuthRequest extends Request {
  user?: UserDocument;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-parlour-dashboard-2024'
    ) as JwtPayload;

    req.user = decoded.user as UserDocument; // Attach decoded user payload
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

export const authorize = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied. You do not have the required role.' });
    }
    next();
  };
}; 