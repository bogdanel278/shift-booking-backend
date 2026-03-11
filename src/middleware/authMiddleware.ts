import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to validate JWT token
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
}

/**
 * Middleware to require business role
 */
export function requireBusiness(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'business') {
    res.status(403).json({ error: 'Business account required' });
    return;
  }

  next();
}

/**
 * Middleware to require worker role
 */
export function requireWorker(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'worker') {
    res.status(403).json({ error: 'Worker account required' });
    return;
  }

  next();
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}
