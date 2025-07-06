import { Router } from 'express';
import { body } from 'express-validator';
import { punchIn, punchOut } from '../controllers/attendanceController';
import { authenticate } from '../middleware/auth';

const router = Router();

// @route   POST api/attendance/punch-in
// @desc    Punch in
// @access  Public (for front-desk)
router.post(
  '/punch-in',
  [body('employeeId', 'Employee ID is required').notEmpty()],
  punchIn
);

// @route   POST api/attendance/punch-out
// @desc    Punch out
// @access  Public (for front-desk)
router.post(
  '/punch-out',
  [body('employeeId', 'Employee ID is required').notEmpty()],
  punchOut
);

export default router; 