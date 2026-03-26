import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { apiLimiter } from './middleware/rateLimitMiddleware';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import shiftRoutes from './routes/shiftRoutes';
import bookingRoutes from './routes/bookingRoutes';
import workerProfileRoutes from './routes/workerProfileRoutes';
import businessProfileRoutes from './routes/businessProfileRoutes';
import timesheetRoutes from './routes/timesheetRoutes';
import reviewRoutes from './routes/reviewRoutes';
import notificationRoutes from './routes/notificationRoutes';
import rightToWorkRoutes from './routes/rightToWorkRoutes';
import livenessRoutes from './routes/livenessRoutes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false,
}));

// Middleware
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_REQUEST_SIZE || '10mb' }));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use((_req: Request, res: Response, next: NextFunction) => {
  const origin = _req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (_req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/worker-profiles', workerProfileRoutes);
app.use('/api/business-profiles', businessProfileRoutes);
app.use('/api/business', businessProfileRoutes); // Alias for authenticated business endpoints
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/right-to-work', rightToWorkRoutes);
app.use('/api/liveness', livenessRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
