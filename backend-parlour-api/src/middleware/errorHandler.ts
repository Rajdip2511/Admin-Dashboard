import { Request, Response, NextFunction } from 'express';
import { IAPIResponse } from '@/types';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // Handle custom AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values((error as any).errors).map((err: any) => err.message).join(', ');
    isOperational = true;
  }

  // Handle Mongoose duplicate key errors
  if ((error as any).code === 11000) {
    statusCode = 409;
    const field = Object.keys((error as any).keyValue)[0];
    message = `${field} already exists`;
    isOperational = true;
  }

  // Handle Mongoose cast errors
  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${(error as any).path}: ${(error as any).value}`;
    isOperational = true;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  }

  // Handle rate limit errors
  if (error.message.includes('Too many requests')) {
    statusCode = 429;
    message = 'Too many requests, please try again later';
    isOperational = true;
  }

  // Log error for debugging
  if (process.env['NODE_ENV'] !== 'production') {
    console.error(`❌ Error: ${message}`, {
      statusCode,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  } else {
    // In production, log only operational errors
    if (isOperational) {
      console.error(`❌ Operational Error: ${message}`, {
        statusCode,
        url: req.url,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error(`❌ System Error: ${error.message}`, {
        statusCode,
        url: req.url,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Send error response
  const response: IAPIResponse = {
    success: false,
    message: message,
    error: process.env['NODE_ENV'] === 'production' && !isOperational 
      ? 'Internal Server Error' 
      : message
  };

  // Add stack trace in development
  if (process.env['NODE_ENV'] !== 'production') {
    (response as any).stack = error.stack;
  }

  res.status(statusCode).json(response);
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Common error responses
export const ErrorResponses = {
  UNAUTHORIZED: new AppError('Unauthorized access', 401),
  FORBIDDEN: new AppError('Forbidden access', 403),
  NOT_FOUND: new AppError('Resource not found', 404),
  VALIDATION_ERROR: new AppError('Validation failed', 400),
  INTERNAL_SERVER_ERROR: new AppError('Internal server error', 500),
  TOO_MANY_REQUESTS: new AppError('Too many requests', 429),
  CONFLICT: new AppError('Resource already exists', 409),
  BAD_REQUEST: new AppError('Bad request', 400),
  UNPROCESSABLE_ENTITY: new AppError('Unprocessable entity', 422)
};

export default errorHandler; 