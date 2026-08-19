import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import recallRoutes from './src/routes/recallRoutes.js';
import { startCronJobs } from './src/services/pushService.js';
import './src/workers/aiWorker.js'; // Start the BullMQ AI Worker
import { errorHandler } from './src/middleware/errorMiddleware.js';

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({
  origin: true, // This perfectly reflects the origin (whether it's localhost or chrome-extension://)
  credentials: true // Crucial for HTTP-only JWT cookies to work!
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Ormayundo API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/recall', recallRoutes);

// Global Error Handler MUST be the last middleware
app.use(errorHandler);

try {
  await connectDB();

  // Start the background worker for push notifications
  startCronJobs();

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
} catch (error) {
  console.error(`Database connection failed: ${error.message}`);
  process.exit(1);
}
