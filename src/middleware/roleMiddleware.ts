import { Request, Response, NextFunction } from 'express';

type UserRole = 'worker' | 'business' | 'admin';

/**
 * Middleware to check if user has required role
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Forbidden',
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user is a worker
 */
export function requireWorker(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  return requireRole('worker')(req, res, next);
}

/**
 * Middleware to check if user is a business
 */
export function requireBusiness(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  return requireRole('business')(req, res, next);
}

/**
 * Middleware to check if user is an admin
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  return requireRole('admin')(req, res, next);
}

/**
 * Middleware to check if user is admin or business
 */
export function requireAdminOrBusiness(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  return requireRole('admin', 'business')(req, res, next);
}
