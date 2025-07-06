import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Attendance from '../models/Attendance';
import Employee from '../models/Employee';
import { AuthRequest } from '../middleware/auth';
import { getIO } from '../services/socketService';
import { updateMockAttendanceState, getMockEmployeeById } from './employeeController';

export const punchIn = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { employeeId } = req.body;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: today },
      punchOutTime: { $exists: false },
    });

    if (existingAttendance) {
      return res.status(400).json({ msg: 'Already punched in' });
    }

    const attendance = new Attendance({
      employee: employeeId,
      punchInTime: new Date(),
      date: new Date(),
    });

    await attendance.save();

    getIO().emit('attendanceUpdate', {
      employeeId: employee._id,
      status: 'Punched In',
      employeeName: `${employee.firstName} ${employee.lastName}`,
      timestamp: new Date().toISOString()
    });

    res.status(201).json(attendance);
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    
    // Use dynamic mock data for local testing
    console.log('[Attendance] Database not available, using dynamic mock punch in');
    
    // Get mock employee data
    const mockEmployee = getMockEmployeeById(employeeId);
    if (!mockEmployee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    // Update the mock attendance state
    updateMockAttendanceState(employeeId, 'Punched In');
    
    // Emit the WebSocket event for real-time updates
    getIO().emit('attendanceUpdate', {
      employeeId: employeeId,
      status: 'Punched In',
      employeeName: `${mockEmployee.firstName} ${mockEmployee.lastName}`,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      _id: `attendance_${Date.now()}`,
      employee: employeeId,
      punchInTime: new Date(),
      date: new Date(),
      message: 'Punched in successfully (test mode)'
    });
  }
};

export const punchOut = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { employeeId } = req.body;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      {
        employee: employeeId,
        date: { $gte: today },
        punchOutTime: { $exists: false },
      },
      { punchOutTime: new Date() },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ msg: 'No active punch-in found for today' });
    }

    getIO().emit('attendanceUpdate', {
      employeeId: employee._id,
      status: 'Punched Out',
      employeeName: `${employee.firstName} ${employee.lastName}`,
      timestamp: new Date().toISOString()
    });

    res.json(attendance);
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    
    // Use dynamic mock data for local testing
    console.log('[Attendance] Database not available, using dynamic mock punch out');
    
    // Get mock employee data
    const mockEmployee = getMockEmployeeById(employeeId);
    if (!mockEmployee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    // Update the mock attendance state
    updateMockAttendanceState(employeeId, 'Punched Out');
    
    // Emit the WebSocket event for real-time updates
    getIO().emit('attendanceUpdate', {
      employeeId: employeeId,
      status: 'Punched Out',
      employeeName: `${mockEmployee.firstName} ${mockEmployee.lastName}`,
      timestamp: new Date().toISOString()
    });

    res.json({
      _id: `attendance_${Date.now()}`,
      employee: employeeId,
      punchInTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      punchOutTime: new Date(),
      date: new Date(),
      message: 'Punched out successfully (test mode)'
    });
  }
};

export const getAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const attendance = await Attendance.find()
      .populate('employee', 'firstName lastName')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const getEmployeeStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.params.employeeId,
      date: today,
    });

    if (!attendance) {
      return res.json({ status: 'Punched Out' });
    }

    const status = attendance.punchOutTime ? 'Punched Out' : 'Punched In';
    res.json({ status, punchInTime: attendance.punchInTime, punchOutTime: attendance.punchOutTime });
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    res.status(500).send('Server Error');
  }
}; 