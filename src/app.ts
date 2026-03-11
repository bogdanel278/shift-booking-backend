import express, { Application, Request, Response, NextFunction } from 'express';
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
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (if needed)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/worker-profiles', workerProfileRoutes);
app.use('/api/business-profiles', businessProfileRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/workers/right-to-work', rightToWorkRoutes);
app.use('/api/admin/right-to-work', rightToWorkRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
