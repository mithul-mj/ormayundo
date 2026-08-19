import mongoose from "mongoose";

export const connectDB = async () => {
    const connectWithRetry = async () => {
        try {
            const conn = await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 15000, // Longer timeout for initial handshake
                socketTimeoutMS: 45000,
                family: 4 // Force IPv4
            });
            console.log(`MongoDB connected: ${conn.connection.host}`);
        } catch (error) {
            console.error(`MongoDB Connection Error: ${error.message}`);
            console.log("Retrying MongoDB connection in 5 seconds...");
            setTimeout(connectWithRetry, 5000);
        }
    };
    
    connectWithRetry();
};