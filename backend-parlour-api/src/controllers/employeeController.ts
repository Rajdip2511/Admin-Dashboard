import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Employee from '../models/Employee';
import Attendance from '../models/Attendance';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../types';

// Dynamic mock data store for local testing
const mockEmployeesData = [
  {
    _id: '507f1f77bcf86cd799439021',
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@parlour.com',
    phone: '123-456-7890',
    position: 'Senior Stylist',
    user: '507f1f77bcf86cd799439011',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '507f1f77bcf86cd799439022',
    employeeId: 'EMP002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@parlour.com',
    phone: '098-765-4321',
    position: 'Hair Colorist',
    user: '507f1f77bcf86cd799439012',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '507f1f77bcf86cd799439023',
    employeeId: 'EMP003',
    firstName: 'Mike',
    lastName: 'Wilson',
    email: 'mike.wilson@parlour.com',
    phone: '555-123-4567',
    position: 'Nail Technician',
    user: '507f1f77bcf86cd799439013',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Dynamic attendance state for mock data
const mockAttendanceState: { [key: string]: string } = {
  '507f1f77bcf86cd799439021': 'Punched In',
  '507f1f77bcf86cd799439022': 'Punched Out',
  '507f1f77bcf86cd799439023': 'Not Punched In'
};

// Function to update mock attendance state
export const updateMockAttendanceState = (employeeId: string, status: string) => {
  mockAttendanceState[employeeId] = status;
  console.log(`[Mock] Updated ${employeeId} status to: ${status}`);
};

// Function to get mock employee by ID
export const getMockEmployeeById = (employeeId: string) => {
  return mockEmployeesData.find(emp => emp._id === employeeId);
};

export const getEmployeesWithStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employees = await Employee.find();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employeesWithStatus = await Promise.all(
      employees.map(async (employee) => {
        const attendance = await Attendance.findOne({
          employee: employee._id,
          date: { $gte: today },
        });
        
        const status = attendance
          ? attendance.punchOutTime
            ? 'Punched Out'
            : 'Punched In'
          : 'Not Punched In';

        return {
          ...employee.toObject(),
          status,
        };
      })
    );

    res.json(employeesWithStatus);
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    
    // Use dynamic mock data for local testing
    console.log('[Employees] Database not available, using dynamic mock employees with status');
    const mockEmployeesWithStatus = mockEmployeesData.map(employee => ({
      ...employee,
      status: mockAttendanceState[employee._id] || 'Not Punched In'
    }));
    res.json(mockEmployeesWithStatus);
  }
};

export const getEmployees = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    
    // Use dynamic mock data for local testing
    console.log('[Employees] Database not available, using dynamic mock data');
    res.json(mockEmployeesData);
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
    password,
    role,
  } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'A user with this email already exists.' });
    }
    
    user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || UserRole.ADMIN,
    });
    await user.save();

    const newEmployee = new Employee({
      employeeId: `EMP-${Date.now()}`,
      firstName,
      lastName,
      email,
      phone,
      position,
      user: user._id,
    });

    await newEmployee.save();
    res.status(201).json(newEmployee);
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
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    await User.findByIdAndDelete(employee.user);
    await Employee.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Employee and associated user removed' });
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    res.status(500).send('Server Error');
  }
}; 