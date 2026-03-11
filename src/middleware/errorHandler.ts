import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  success: false;
  error: string;
  stack?: string;
}

/**
 * Global error handling middleware
 * Must be defined after all routes
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Default error status
  let statusCode = 500;

  // Determine status code based on error message
  if (err.message.includes('not found')) {
    statusCode = 404;
  } else if (
    err.message.includes('required') ||
    err.message.includes('Invalid') ||
    err.message.includes('must be') ||
    err.message.includes('already exists')
  ) {
    statusCode = 400;
  } else if (err.message.includes('Not authorized')) {
    statusCode = 403;
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: err.message || 'Internal server error'
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}
