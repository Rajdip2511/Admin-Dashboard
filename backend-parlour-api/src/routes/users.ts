import { Router } from 'express';
import { authenticate, requireSuperAdmin } from '@/middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Placeholder routes - to be implemented
router.get('/', requireSuperAdmin, (req, res) => {
  res.json({ message: 'Users route - to be implemented' });
});

export default router; 