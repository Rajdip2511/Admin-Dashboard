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
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('email').isEmail(),
    body('phone').notEmpty(),
    body('position').notEmpty(),
    body('department').notEmpty(),
    body('hireDate').isISO8601(),
    body('salary').isNumeric(),
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