import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors from express-validator
 * Must be called after validation chains
 */
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : undefined,
      message: error.msg,
    }));
    
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formattedErrors,
    });
    return;
  }
  
  next();
}
