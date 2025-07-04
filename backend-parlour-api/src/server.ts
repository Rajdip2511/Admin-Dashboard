import express, { Application, Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import SocketService from './services/socketService';
import { Server } from 'socket.io';
import employeeRoutes from './routes/employees';
import taskRoutes from './routes/tasks';
import authRoutes from './routes/auth';
import attendanceRoutes from './routes/attendance';

// Extend the Express Request type to include the io server
export interface AppRequest extends Request {
  io?: Server;
}

const app: Application = express();
const server = http.createServer(app);

// Initialize Socket.IO
const socketService = new SocketService(server);
const io = socketService.getIO();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to our router
app.use((req: AppRequest, res: Response, next) => {
  req.io = io;
  next();
});

app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/parlour_dashboard';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[DB] MongoDB Connected...');
    server.listen(PORT, () => {
      console.log(`[Server] API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[DB] Error:', err.message);
    process.exit(1);
  });

export default app; 