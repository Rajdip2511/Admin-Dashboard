import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Attendance from '../models/Attendance';
import Employee from '../models/Employee';
import { AppRequest } from '../server';

export const punchInOut = async (req: AppRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { employeeId, action } = req.body; // action: 'punch-in' or 'punch-out'

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (action === 'punch-in') {
      if (attendance) {
        // Already punched in today
        return res.status(400).json({ msg: 'Already punched in for the day' });
      }
      attendance = new Attendance({
        employee: employeeId,
        date: today,
        punchIn: new Date(),
      });
    } else if (action === 'punch-out') {
      if (!attendance || attendance.punchOut) {
        return res.status(400).json({ msg: 'Not punched in or already punched out' });
      }
      attendance.punchOut = new Date();
    } else {
      return res.status(400).json({ msg: 'Invalid action' });
    }

    await attendance.save();

    // Emit a WebSocket event to notify all clients
    if (req.io) {
      req.io.emit('attendanceUpdate', {
        employeeId: employee._id,
        status: action === 'punch-in' ? 'Punched In' : 'Punched Out',
        timestamp: new Date(),
      });
    }

    res.json(attendance);
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const getAttendance = async (req: AppRequest, res: Response, next: NextFunction) => {
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

export const getEmployeeStatus = async (req: AppRequest, res: Response, next: NextFunction) => {
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

    const status = attendance.punchOut ? 'Punched Out' : 'Punched In';
    res.json({ status, punchInTime: attendance.punchIn, punchOutTime: attendance.punchOut });
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    res.status(500).send('Server Error');
  }
}; 