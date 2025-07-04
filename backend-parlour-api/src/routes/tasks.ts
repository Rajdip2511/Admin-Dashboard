import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController';

const router = Router();

router.get('/', authenticate, getTasks);

router.get('/:id', authenticate, getTask);

router.post(
  '/',
  [
    authenticate,
    authorize(UserRole.SUPER_ADMIN),
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('assignedTo').notEmpty(),
    body('dueDate').isISO8601(),
  ],
  createTask
);

router.put(
  '/:id',
  [
    authenticate,
    authorize(UserRole.SUPER_ADMIN),
    body('status').optional(),
    body('priority').optional(),
  ],
  updateTask
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  deleteTask
);

export default router; 