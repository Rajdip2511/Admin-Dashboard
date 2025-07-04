import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/parlour_dashboard';
    await mongoose.connect(mongoURI);
    console.log('[DB] MongoDB Connected...');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`[DB] Error: ${errorMessage}`);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB; 