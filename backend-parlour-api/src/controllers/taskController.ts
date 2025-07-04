import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import Task from '../models/Task'
import Employee from '../models/Employee'
import { AppError } from '../middleware/errorHandler'
import { IAuthRequest, TaskStatus } from '../types'
import socketService from '../services/socketService'

// Get all tasks with pagination and filters
export const getTasks = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const status = req.query.status as string
    const priority = req.query.priority as string
    const assignedTo = req.query.assignedTo as string
    const skip = (page - 1) * limit

    // Build filter query
    const filterQuery: any = {}
    if (status) filterQuery.status = status
    if (priority) filterQuery.priority = priority
    if (assignedTo) filterQuery.assignedTo = assignedTo

    // Get tasks with pagination and populate references
    const tasks = await Task.find(filterQuery)
      .populate('assignedTo', 'name email employeeId position department')
      .populate('assignedBy', 'name email role')
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const total = await Task.countDocuments(filterQuery)
    const totalPages = Math.ceil(total / limit)

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: tasks,
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

// Get task by ID
export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const task = await Task.findById(id)
      .populate('assignedTo', 'name email employeeId position department')
      .populate('assignedBy', 'name email role')
      .select('-__v')

    if (!task) {
      return next(new AppError('Task not found', 404))
    }

    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully',
      data: task
    })
  } catch (error) {
    next(error)
  }
}

// Create new task
export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()))
    }

    // Check if user has permission (Super Admin only)
    if (req.user?.role !== 'SUPER_ADMIN') {
      return next(new AppError('Permission denied. Only Super Admin can create tasks', 403))
    }

    const { title, description, assignedTo, priority, dueDate } = req.body

    // Check if assigned employee exists
    const employee = await Employee.findById(assignedTo)
    if (!employee) {
      return next(new AppError('Assigned employee not found', 404))
    }

    // Create new task
    const task = new Task({
      title,
      description,
      assignedTo,
      assignedBy: req.user!._id,
      priority,
      dueDate
    })

    await task.save()

    // Populate the task for response
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email employeeId position department')
      .populate('assignedBy', 'name email role')
      .select('-__v')

    // Emit socket event for real-time update
    socketService.emitTaskUpdate({
      taskId: task._id.toString(),
      task: populatedTask!,
      type: 'created',
      timestamp: new Date().toISOString()
    })

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask
    })
  } catch (error) {
    next(error)
  }
}

// Update task
export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()))
    }

    // Check if user has permission (Super Admin only)
    if (req.user?.role !== 'SUPER_ADMIN') {
      return next(new AppError('Permission denied. Only Super Admin can update tasks', 403))
    }

    const { id } = req.params
    const updates = req.body

    // Remove fields that shouldn't be updated
    delete updates.assignedBy
    delete updates.createdAt
    delete updates.updatedAt
    delete updates.__v

    // Check if task exists
    const task = await Task.findById(id)
    if (!task) {
      return next(new AppError('Task not found', 404))
    }

    // If assignedTo is being updated, check if employee exists
    if (updates.assignedTo && updates.assignedTo !== task.assignedTo.toString()) {
      const employee = await Employee.findById(updates.assignedTo)
      if (!employee) {
        return next(new AppError('Assigned employee not found', 404))
      }
    }

    // If status is being changed to COMPLETED, set completion date
    if (updates.status === 'COMPLETED' && task.status !== 'COMPLETED') {
      updates.completedDate = new Date()
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email employeeId position department')
      .populate('assignedBy', 'name email role')
      .select('-__v')

    // Emit socket event for real-time update
    socketService.emitTaskUpdate({
      taskId: id,
      task: updatedTask!,
      type: 'updated',
      timestamp: new Date().toISOString()
    })

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    })
  } catch (error) {
    next(error)
  }
}

// Delete task
export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user has permission (Super Admin only)
    if (req.user?.role !== 'SUPER_ADMIN') {
      return next(new AppError('Permission denied. Only Super Admin can delete tasks', 403))
    }

    const { id } = req.params

    // Check if task exists
    const task = await Task.findById(id)
    if (!task) {
      return next(new AppError('Task not found', 404))
    }

    // Delete task
    await Task.findByIdAndDelete(id)

    // Emit socket event for real-time update
    socketService.emitTaskUpdate({
      taskId: id,
      task: task as any,
      type: 'deleted',
      timestamp: new Date().toISOString()
    })

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

// Get task statistics
export const getTaskStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const totalTasks = await Task.countDocuments()
    const pendingTasks = await Task.countDocuments({ status: { $in: ['TODO', 'IN_PROGRESS'] } })
    const completedTasks = await Task.countDocuments({ status: 'COMPLETED' })
    const cancelledTasks = await Task.countDocuments({ status: 'CANCELLED' })

    // Get tasks by priority
    const priorityStats = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])

    // Get tasks by status
    const statusStats = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])

    // Get overdue tasks
    const now = new Date()
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: now },
      status: { $in: ['TODO', 'IN_PROGRESS'] }
    })

    // Get tasks due this week
    const weekFromNow = new Date()
    weekFromNow.setDate(weekFromNow.getDate() + 7)
    const tasksDueThisWeek = await Task.countDocuments({
      dueDate: { $gte: now, $lte: weekFromNow },
      status: { $in: ['TODO', 'IN_PROGRESS'] }
    })

    res.status(200).json({
      success: true,
      message: 'Task statistics retrieved successfully',
      data: {
        totalTasks,
        pendingTasks,
        completedTasks,
        cancelledTasks,
        overdueTasks,
        tasksDueThisWeek,
        priorityStats,
        statusStats
      }
    })
  } catch (error) {
    next(error)
  }
}

// Get tasks assigned to a specific employee
export const getEmployeeTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const status = req.query.status as string
    const skip = (page - 1) * limit

    // Build filter query
    const filterQuery: any = { assignedTo: employeeId }
    if (status) filterQuery.status = status

    // Check if employee exists
    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return next(new AppError('Employee not found', 404))
    }

    // Get tasks with pagination
    const tasks = await Task.find(filterQuery)
      .populate('assignedBy', 'name email role')
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const total = await Task.countDocuments(filterQuery)
    const totalPages = Math.ceil(total / limit)

    res.status(200).json({
      success: true,
      message: 'Employee tasks retrieved successfully',
      data: tasks,
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

// Update task status
export const updateTaskStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()))
    }

    // Check if user has permission (Super Admin only)
    if (req.user?.role !== 'SUPER_ADMIN') {
      return next(new AppError('Permission denied. Only Super Admin can update task status', 403))
    }

    const { id } = req.params
    const { status } = req.body

    // Check if task exists
    const task = await Task.findById(id)
    if (!task) {
      return next(new AppError('Task not found', 404))
    }

    // Prepare update object
    const updates: any = { status }
    if (status === 'COMPLETED' && task.status !== 'COMPLETED') {
      updates.completedDate = new Date()
    }

    // Update task status
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email employeeId position department')
      .populate('assignedBy', 'name email role')
      .select('-__v')

    // Emit socket event for real-time update
    socketService.emitTaskUpdate({
      taskId: id,
      task: updatedTask!,
      type: 'updated',
      timestamp: new Date().toISOString()
    })

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: updatedTask
    })
  } catch (error) {
    next(error)
  }
} 