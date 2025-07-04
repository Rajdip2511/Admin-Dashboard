import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { punchInOut, getAttendance, getEmployeeStatus } from '../controllers/attendanceController';
import { UserRole } from '../types';

const router = Router();

// @route   POST api/attendance/punch
// @desc    Punch in or out
// @access  Public (or could be restricted to employees/front-desk)
router.post(
  '/punch',
  [
    body('employeeId', 'Employee ID is required').not().isEmpty(),
    body('action', 'Action must be "punch-in" or "punch-out"').isIn(['punch-in', 'punch-out']),
  ],
  punchInOut
);

// @route   GET api/attendance
// @desc    Get all attendance records
// @access  Private (Admin and Super Admin)
router.get('/', authenticate, authorize([UserRole.ADMIN, UserRole.SUPER_ADMIN]), getAttendance);

// @route   GET api/attendance/:employeeId
// @desc    Get current status for a single employee
// @access  Public
router.get('/:employeeId', getEmployeeStatus);


export default router; 