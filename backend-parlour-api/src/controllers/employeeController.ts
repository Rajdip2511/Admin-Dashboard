import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Employee from '../models/Employee';
import Attendance from '../models/Attendance';
import { AuthRequest } from '../middleware/auth';

export const getEmployeesWithStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employees = await Employee.find();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employeesWithStatus = await Promise.all(
      employees.map(async (employee) => {
        const attendance = await Attendance.findOne({
          employee: employee._id,
          date: today,
        });
        const status = attendance ? (attendance.punchOut ? 'Punched Out' : 'Punched In') : 'Punched Out';
        return {
          ...employee.toObject(),
          status,
        };
      })
    );

    res.json(employeesWithStatus);
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const getEmployees = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const getEmployee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    res.json(employee);
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const createEmployee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    position,
    department,
    hireDate,
    salary,
  } = req.body;

  try {
    const newEmployee = new Employee({
      employeeId: `EMP-${Date.now()}`,
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      hireDate,
      salary,
    });

    const employee = await newEmployee.save();
    res.json(employee);
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    res.json(employee);
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const deleteEmployee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employee = await Employee.findByIdAndRemove(req.params.id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    res.json({ msg: 'Employee removed' });
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    res.status(500).send('Server Error');
  }
}; 