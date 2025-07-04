import { Request, Response, NextFunction } from 'express';
import { IAPIResponse } from '@/types';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const response: IAPIResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'Not Found'
  };

  // Log the 404 error for debugging
  console.warn(`⚠️  404 - Route not found: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  res.status(404).json(response);
};

export default notFoundHandler; 