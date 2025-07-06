import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Try to connect to MongoDB Atlas or local MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parlour_dashboard';
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000,
    });
    
    console.log(`[DB] MongoDB Connected successfully!`);
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`[DB] Error: ${errorMessage}`);
    console.log('[DB] Server will continue without database connection');
    console.log('[DB] Note: Some features may not work without database');
    
    // For testing purposes, let's not crash the server
    // The application can run with limited functionality
  }
};

export default connectDB; 