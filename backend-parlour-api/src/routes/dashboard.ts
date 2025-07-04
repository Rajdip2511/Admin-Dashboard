import { Router } from 'express';
import { authenticate, requireAdmin } from '@/middleware/auth';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// Placeholder routes - to be implemented
router.get('/', requireAdmin, (req, res) => {
  res.json({ message: 'Dashboard route - to be implemented' });
});

export default router; 