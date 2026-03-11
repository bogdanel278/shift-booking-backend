import express, { Application, Request, Response, NextFunction } from 'express';
import userRoutes from './routes/userRoutes';
import shiftRoutes from './routes/shiftRoutes';
import bookingRoutes from './routes/bookingRoutes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (if needed)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
