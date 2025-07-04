import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import Employee from '../models/Employee'
import { AppError } from '../middleware/errorHandler'
import { AuthRequest } from '../types'

// Get all employees with pagination and search
export const getEmployees = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const search = req.query.search as string
    const skip = (page - 1) * limit

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { employeeId: { $regex: search, $options: 'i' } },
            { position: { $regex: search, $options: 'i' } },
            { department: { $regex: search, $options: 'i' } }
          ]
        }
      : {}

    // Get employees with pagination
    const employees = await Employee.find(searchQuery)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const total = await Employee.countDocuments(searchQuery)
    const totalPages = Math.ceil(total / limit)

    res.status(200).json({
      success: true,
      message: 'Employees retrieved successfully',
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    next(error)
  }
}

// Get employee by ID
export const getEmployeeById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const employee = await Employee.findById(id).select('-__v')

    if (!employee) {
      return next(new AppError('Employee not found', 404))
    }

    res.status(200).json({
      success: true,
      message: 'Employee retrieved successfully',
      data: employee
    })
  } catch (error) {
    next(error)
  }
}

// Create new employee
export const createEmployee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()))
    }

    // Check if user has permission (Super Admin only)
    if (req.user?.role !== 'SUPER_ADMIN') {
      return next(new AppError('Permission denied. Only Super Admin can create employees', 403))
    }

    const { name, email, phone, position, department, hireDate, salary } = req.body

    // Check if employee with same email already exists
    const existingEmployee = await Employee.findOne({ email })
    if (existingEmployee) {
      return next(new AppError('Employee with this email already exists', 400))
    }

    // Create new employee
    const employee = new Employee({
      name,
      email,
      phone,
      position,
      department,
      hireDate,
      salary
    })

    await employee.save()

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    })
  } catch (error) {
    next(error)
  }
}

// Update employee
export const updateEmployee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()))
    }

    // Check if user has permission (Super Admin only)
    if (req.user?.role !== 'SUPER_ADMIN') {
      return next(new AppError('Permission denied. Only Super Admin can update employees', 403))
    }

    const { id } = req.params
    const updates = req.body

    // Remove fields that shouldn't be updated
    delete updates.employeeId
    delete updates.createdAt
    delete updates.updatedAt
    delete updates.__v

    // Check if employee exists
    const employee = await Employee.findById(id)
    if (!employee) {
      return next(new AppError('Employee not found', 404))
    }

    // If email is being updated, check if it's already taken
    if (updates.email && updates.email !== employee.email) {
      const existingEmployee = await Employee.findOne({ email: updates.email })
      if (existingEmployee) {
        return next(new AppError('Employee with this email already exists', 400))
      }
    }

    // Update employee
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-__v')

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    })
  } catch (error) {
    next(error)
  }
}

// Delete employee
export const deleteEmployee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user has permission (Super Admin only)
    if (req.user?.role !== 'SUPER_ADMIN') {
      return next(new AppError('Permission denied. Only Super Admin can delete employees', 403))
    }

    const { id } = req.params

    // Check if employee exists
    const employee = await Employee.findById(id)
    if (!employee) {
      return next(new AppError('Employee not found', 404))
    }

    // Soft delete - mark as inactive instead of actual deletion
    await Employee.findByIdAndUpdate(id, { isActive: false })

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

// Get employee statistics
export const getEmployeeStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const totalEmployees = await Employee.countDocuments()
    const activeEmployees = await Employee.countDocuments({ isActive: true })
    const inactiveEmployees = await Employee.countDocuments({ isActive: false })

    // Get employees by department
    const departmentStats = await Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    // Get employees by position
    const positionStats = await Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$position', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    // Get recent hires (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentHires = await Employee.countDocuments({
      hireDate: { $gte: thirtyDaysAgo },
      isActive: true
    })

    res.status(200).json({
      success: true,
      message: 'Employee statistics retrieved successfully',
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        recentHires,
        departmentStats,
        positionStats
      }
    })
  } catch (error) {
    next(error)
  }
}

// Toggle employee status
export const toggleEmployeeStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user has permission (Super Admin only)
    if (req.user?.role !== 'SUPER_ADMIN') {
      return next(new AppError('Permission denied. Only Super Admin can toggle employee status', 403))
    }

    const { id } = req.params

    // Check if employee exists
    const employee = await Employee.findById(id)
    if (!employee) {
      return next(new AppError('Employee not found', 404))
    }

    // Toggle status
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { isActive: !employee.isActive },
      { new: true, runValidators: true }
    ).select('-__v')

    res.status(200).json({
      success: true,
      message: `Employee ${updatedEmployee!.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedEmployee
    })
  } catch (error) {
    next(error)
  }
}

// Search employees
export const searchEmployees = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query
    if (!q) {
      return next(new AppError('Search query is required', 400))
    }

    const searchQuery = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { employeeId: { $regex: q, $options: 'i' } },
        { position: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    }

    const employees = await Employee.find(searchQuery)
      .select('_id name email employeeId position department')
      .limit(10)

    res.status(200).json({
      success: true,
      message: 'Search results retrieved successfully',
      data: employees
    })
  } catch (error) {
    next(error)
  }
} 