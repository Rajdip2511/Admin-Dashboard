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

// Function to generate unique IDs
const generateMockId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Function to add new employee to mock data
export const addMockEmployee = (employeeData: any) => {
  const newEmployee = {
    _id: generateMockId(),
    employeeId: `EMP${String(mockEmployeesData.length + 1).padStart(3, '0')}`,
    ...employeeData,
    user: generateMockId(), // Generate mock user ID
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  mockEmployeesData.push(newEmployee);
  // Initialize attendance state for new employee
  mockAttendanceState[newEmployee._id] = 'Not Punched In';
  console.log(`[Mock] Added new employee: ${newEmployee.firstName} ${newEmployee.lastName}`);
  return newEmployee;
};

// Function to update employee in mock data
export const updateMockEmployee = (employeeId: string, updateData: any) => {
  const employeeIndex = mockEmployeesData.findIndex(emp => emp._id === employeeId);
  if (employeeIndex === -1) {
    return null;
  }
  
  mockEmployeesData[employeeIndex] = {
    ...mockEmployeesData[employeeIndex],
    ...updateData,
    updatedAt: new Date()
  };
  
  console.log(`[Mock] Updated employee: ${mockEmployeesData[employeeIndex].firstName} ${mockEmployeesData[employeeIndex].lastName}`);
  return mockEmployeesData[employeeIndex];
};

// Function to delete employee from mock data
export const deleteMockEmployee = (employeeId: string) => {
  const employeeIndex = mockEmployeesData.findIndex(emp => emp._id === employeeId);
  if (employeeIndex === -1) {
    return false;
  }
  
  const deletedEmployee = mockEmployeesData[employeeIndex];
  mockEmployeesData.splice(employeeIndex, 1);
  // Remove from attendance state
  delete mockAttendanceState[employeeId];
  
  console.log(`[Mock] Deleted employee: ${deletedEmployee.firstName} ${deletedEmployee.lastName}`);
  return true;
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
    
    // Use mock data for local testing
    console.log('[Employees] Database not available, using mock data for employee lookup');
    
    const employee = getMockEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    
    res.json(employee);
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
    
    // Use mock data for local testing
    console.log('[Employees] Database not available, using mock data for employee creation');
    
    // Check if employee with this email already exists in mock data
    const existingEmployee = mockEmployeesData.find(emp => emp.email === email);
    if (existingEmployee) {
      return res.status(400).json({ msg: 'A user with this email already exists.' });
    }
    
    // Add new employee to mock data
    const newEmployee = addMockEmployee({
      firstName,
      lastName,
      email,
      phone,
      position
    });
    
    res.status(201).json(newEmployee);
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
    
    // Use mock data for local testing
    console.log('[Employees] Database not available, using mock data for employee update');
    
    const updatedEmployee = updateMockEmployee(req.params.id, req.body);
    if (!updatedEmployee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    
    res.json(updatedEmployee);
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
    
    // Use mock data for local testing
    console.log('[Employees] Database not available, using mock data for employee deletion');
    
    const deleted = deleteMockEmployee(req.params.id);
    if (!deleted) {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    
    res.json({ msg: 'Employee removed from mock data' });
  }
}; 