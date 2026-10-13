import 'dotenv/config';
import app from './app.js';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { assertProductionEnvironment } from './config/environment.js';

const PORT = Number(process.env.PORT || 5000);

try {
  assertProductionEnvironment();
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET is not configured. Authentication requests will fail until it is added to .env.');
  }

  const connected = await connectDB();
  if (process.env.NODE_ENV === 'production' && !connected) {
    throw new Error('MONGODB_URI is required in production.');
  }

  const server = app.listen(PORT, () => {
    console.log(`Shahnawaz Enterprises API running on port ${PORT} (phase 19)`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received; closing server gracefully.`);
    server.close(async () => {
      try {
        await mongoose.disconnect();
      } finally {
        process.exit(0);
      }
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
} catch (error) {
  console.error(`Server startup failed: ${error.message}`);
  process.exit(1);
}
