import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { initSocket } from './services/socketService';
import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';
import taskRoutes from './routes/tasks';
import attendanceRoutes from './routes/attendance';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(helmet());

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Parlour Admin Dashboard Backend is running', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Debug endpoint for testing
app.post('/api/debug/login', (req, res) => {
  console.log('Debug login request:', req.body);
  res.json({
    success: true,
    message: 'Debug endpoint working',
    receivedData: req.body,
    headers: req.headers
  });
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

export default app; 