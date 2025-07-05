import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesWithStatus,
} from '../controllers/employeeController';

const router = Router();

router.get('/status', authenticate, getEmployeesWithStatus);

router.get('/', authenticate, getEmployees);

router.get('/:id', authenticate, getEmployee);

router.post(
  '/',
  [
    authenticate,
    authorize([UserRole.SUPER_ADMIN]),
    body('firstName', 'First name is required').notEmpty(),
    body('lastName', 'Last name is required').notEmpty(),
    body('email', 'A valid email is required').isEmail(),
    body('phone', 'Phone number is required').notEmpty(),
    body('position', 'Position is required').notEmpty(),
    body('password', 'Password of at least 6 characters is required').isLength({ min: 6 }),
    body('role', 'Role is required').isIn(Object.values(UserRole)),
  ],
  createEmployee
);

router.put(
  '/:id',
  [
    authenticate,
    authorize([UserRole.SUPER_ADMIN]),
    body('email').optional().isEmail(),
    body('salary').optional().isNumeric(),
  ],
  updateEmployee
);

router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.SUPER_ADMIN]),
  deleteEmployee
);

export default router; 