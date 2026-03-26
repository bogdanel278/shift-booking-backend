import dotenv from 'dotenv';
import app from './app';
import { pool } from './config/database';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Test database connection
async function startServer() {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✓ Database connected successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await pool.end();
  process.exit(0);
});
