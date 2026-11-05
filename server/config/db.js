import mongoose from "mongoose";

/**
 * Industry-standard database connection with connection pooling for 100+ concurrent users,
 * retry policy, and proper Promise resolution.
 */
export const connectDB = async (retries = 5, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 100, // Handle up to 100 concurrent queries simultaneously
        minPoolSize: 10,  // Keep 10 warm connections ready for instant response
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4
      });
      console.log(`[MongoDB] Connected: ${conn.connection.host} (Pool Size: 10-100)`);
      return conn;
    } catch (error) {
      console.error(`[MongoDB] Connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`[MongoDB] Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw new Error(`MongoDB failed to connect after ${retries} attempts: ${error.message}`);
      }
    }
  }
};

/**
 * Gracefully close the MongoDB connection.
 */
export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close(false);
    console.log('[MongoDB] Connection closed cleanly.');
  }
};
