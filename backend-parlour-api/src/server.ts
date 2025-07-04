import express, { Application, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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