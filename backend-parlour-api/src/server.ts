import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

// Import configurations and database
import DatabaseConfig from '@/config/database';
import SeedService from '@/services/seedService';

// Import routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import employeeRoutes from '@/routes/employees';
import taskRoutes from '@/routes/tasks';
import attendanceRoutes from '@/routes/attendance';
import dashboardRoutes from '@/routes/dashboard';

// Import middleware
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';

// Import Socket.IO handlers
import { initializeSocket } from '@/services/socketService';

// Load environment variables
dotenv.config();

class Server {
  private app: Application;
  private server: any;
  private io: SocketIOServer;
  private PORT: number;

  constructor() {
    this.app = express();
    this.PORT = parseInt(process.env['PORT'] || '5000');
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
      }
    });

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSocket();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: {
        error: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    if (process.env.NODE_ENV !== 'production') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        database: DatabaseConfig.isConnectionReady() ? 'Connected' : 'Disconnected'
      });
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/employees', employeeRoutes);
    this.app.use('/api/tasks', taskRoutes);
    this.app.use('/api/attendance', attendanceRoutes);
    this.app.use('/api/dashboard', dashboardRoutes);

    // API documentation route
    this.app.get('/api/docs', (req, res) => {
      res.json({
        message: 'Parlour Admin Dashboard API',
        version: '1.0.0',
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          employees: '/api/employees',
          tasks: '/api/tasks',
          attendance: '/api/attendance',
          dashboard: '/api/dashboard'
        },
        documentation: 'https://github.com/Rajdip2511/Admin-Dashboard'
      });
    });

    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Parlour Admin Dashboard API',
        version: '1.0.0',
        status: 'Running',
        timestamp: new Date().toISOString()
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  private initializeSocket(): void {
    initializeSocket(this.io);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await DatabaseConfig.connect();

      // Seed default data
      await SeedService.seedAll();

      // Start server
      this.server.listen(this.PORT, () => {
        console.log(`🚀 Server running on port ${this.PORT}`);
        console.log(`📱 Environment: ${process.env.NODE_ENV}`);
        console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN}`);
        console.log(`📊 Health Check: http://localhost:${this.PORT}/health`);
        console.log(`📚 API Docs: http://localhost:${this.PORT}/api/docs`);
      });

      // Handle graceful shutdown
      process.on('SIGTERM', () => this.gracefulShutdown());
      process.on('SIGINT', () => this.gracefulShutdown());

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  private async gracefulShutdown(): Promise<void> {
    console.log('⏳ Shutting down server gracefully...');
    
    this.server.close(() => {
      console.log('✅ HTTP server closed.');
      
      DatabaseConfig.disconnect()
        .then(() => {
          console.log('✅ Database connection closed.');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Error closing database connection:', error);
          process.exit(1);
        });
    });
  }

  public getApp(): Application {
    return this.app;
  }

  public getServer(): any {
    return this.server;
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Create and start server
const server = new Server();
server.start();

export default server; 