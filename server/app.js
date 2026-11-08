import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB, closeDB } from './config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import recallRoutes from './src/routes/recallRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import deckRoutes from './src/routes/deckRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import SystemConfig from './src/models/systemConfig.js';
import {
  generalRateLimiter,
  authRateLimiter,
  recallCreationRateLimiter
} from './src/middleware/rateLimitMiddleware.js';
import { startCronJobs } from './src/services/pushService.js';
import { closeAiWorker } from './src/workers/aiWorker.js';
import { closeRedis } from './src/config/redis.js';
import { errorHandler } from './src/middleware/errorMiddleware.js';

const PORT = process.env.PORT || 5000;
const app = express();

const allowedOrigins = [
  'https://ormayundo-app.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.startsWith('chrome-extension://')) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Not allowed by Access-Control-Allow-Origin'), false);
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Ormayundo API is running...');
});

// Endpoint for cron-job.org / UptimeRobot to keep Render backend alive
app.get('/api/ping', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Guardrail: General rate limiter across all /api routes
app.use('/api', generalRateLimiter);

// Public announcement & guardrails status endpoint for clients
app.get('/api/announcement', async (req, res) => {
  try {
    const config = await SystemConfig.getSettings();
    res.status(200).json({
      maintenanceMode: config.maintenanceMode,
      maintenanceMessage: config.maintenanceMessage,
      announcementActive: config.announcementActive,
      announcementBanner: config.announcementBanner,
      aiEnabled: config.aiEnabled
    });
  } catch (err) {
    res.status(200).json({ announcementActive: false, maintenanceMode: false });
  }
});

// Route specific rate limiters
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/recall', recallCreationRateLimiter, recallRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler MUST be the last middleware
app.use(errorHandler);

let server;

try {
  await connectDB();

  // Start the background worker for push notifications
  startCronJobs();

  server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
} catch (error) {
  console.error(`Database connection failed: ${error.message}`);
  process.exit(1);
}

// --- INDUSTRY-STANDARD GRACEFUL SHUTDOWN ---
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[Process] Received ${signal}. Initiating graceful shutdown...`);

  // Force exit after 10s if any hanging promise refuses to resolve
  const forceExitTimer = setTimeout(() => {
    console.error('[Process] Shutdown timed out (10s). Forcing termination.');
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  try {
    // 1. Stop receiving new HTTP requests
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log('[HTTP] Server stopped accepting incoming requests.');
    }

    // 2. Gracefully close BullMQ Worker (waits for active job to finish) & Queue
    await closeAiWorker();

    // 3. Gracefully close standalone Redis connection
    await closeRedis();

    // 4. Close MongoDB connection
    await closeDB();

    console.log('[Process] Graceful shutdown completed cleanly.');

    if (signal === 'SIGUSR2') {
      // Forward nodemon restart signal
      process.kill(process.pid, 'SIGUSR2');
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('[Process] Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.once('SIGUSR2', () => gracefulShutdown('SIGUSR2'));
