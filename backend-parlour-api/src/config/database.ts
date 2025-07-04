import mongoose from 'mongoose';
import { IDBOptions } from '@/types';

class DatabaseConfig {
  private static instance: DatabaseConfig;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      const mongoURI = process.env.NODE_ENV === 'production' 
        ? process.env.MONGODB_ATLAS_URI 
        : process.env.MONGODB_URI;

      if (!mongoURI) {
        throw new Error('MongoDB URI is not defined in environment variables');
      }

      const options: IDBOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: true,
        w: 'majority'
      };

      await mongoose.connect(mongoURI, options);
      this.isConnected = true;
      
      console.log(`✅ MongoDB connected successfully to ${process.env.NODE_ENV} database`);
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        this.isConnected = true;
      });

      // Handle application termination
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ MongoDB disconnected successfully');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public isConnectionReady(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public getConnection(): mongoose.Connection {
    return mongoose.connection;
  }
}

export default DatabaseConfig.getInstance(); 