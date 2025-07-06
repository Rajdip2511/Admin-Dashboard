import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/auth';

// Dynamic mock data for tasks
let mockTasks = [
  {
    _id: '507f1f77bcf86cd799439031',
    title: 'Clean and organize workstation',
    description: 'Clean all styling tools and organize the workstation for the next client',
    assignedTo: {
      _id: '507f1f77bcf86cd799439021',
      firstName: 'John',
      lastName: 'Doe'
    },
    assignedBy: '507f1f77bcf86cd799439011',
    status: 'Pending',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '507f1f77bcf86cd799439032',
    title: 'Restock hair products',
    description: 'Check inventory and restock all hair care products in the salon',
    assignedTo: {
      _id: '507f1f77bcf86cd799439022',
      firstName: 'Jane',
      lastName: 'Smith'
    },
    assignedBy: '507f1f77bcf86cd799439011',
    status: 'In Progress',
    priority: 'High',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '507f1f77bcf86cd799439033',
    title: 'Update client appointment system',
    description: 'Review and update the client appointment booking system',
    assignedTo: {
      _id: '507f1f77bcf86cd799439023',
      firstName: 'Mike',
      lastName: 'Wilson'
    },
    assignedBy: '507f1f77bcf86cd799439011',
    status: 'Completed',
    priority: 'Low',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
    completedDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock employees data for task assignments
const mockEmployees = [
  { _id: '507f1f77bcf86cd799439021', firstName: 'John', lastName: 'Doe' },
  { _id: '507f1f77bcf86cd799439022', firstName: 'Jane', lastName: 'Smith' },
  { _id: '507f1f77bcf86cd799439023', firstName: 'Mike', lastName: 'Wilson' }
];

// Helper functions for mock data
function generateMockId() {
  return Math.random().toString(36).substring(2, 15);
}

function findMockEmployeeById(id: string) {
  return mockEmployees.find(emp => emp._id === id) || mockEmployees[0];
}

function addMockTask(taskData: any) {
  const newTask = {
    _id: generateMockId(),
    ...taskData,
    assignedTo: findMockEmployeeById(taskData.assignedTo),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockTasks.push(newTask);
  console.log(`[Mock] Added new task: ${newTask.title}`);
  return newTask;
}

function updateMockTask(id: string, updateData: any) {
  const taskIndex = mockTasks.findIndex(task => task._id === id);
  if (taskIndex !== -1) {
    mockTasks[taskIndex] = { 
      ...mockTasks[taskIndex], 
      ...updateData,
      assignedTo: updateData.assignedTo ? findMockEmployeeById(updateData.assignedTo) : mockTasks[taskIndex].assignedTo,
      updatedAt: new Date()
    };
    console.log(`[Mock] Updated task: ${mockTasks[taskIndex].title}`);
    return mockTasks[taskIndex];
  }
  return null;
}

function deleteMockTask(id: string) {
  const taskIndex = mockTasks.findIndex(task => task._id === id);
  if (taskIndex !== -1) {
    const deletedTask = mockTasks.splice(taskIndex, 1)[0];
    console.log(`[Mock] Deleted task: ${deletedTask.title}`);
    return deletedTask;
  }
  return null;
}

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'firstName lastName');
    res.json(tasks);
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    
    // Fallback mock data for local testing
    console.log('[Tasks] Database not available, using dynamic mock tasks');
    res.json(mockTasks);
  }
};

export const getTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'firstName lastName');
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    
    // Fallback mock data for local testing
    console.log('[Tasks] Database not available, using mock data for single task');
    const task = mockTasks.find(t => t._id === req.params.id);
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.json(task);
  }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, assignedTo, dueDate, priority } = req.body;

  try {
    const newTask = new Task({
      title,
      description,
      assignedTo,
      dueDate,
      priority,
      assignedBy: req.user?.id,
    });

    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    
    // Fallback mock data for local testing
    console.log('[Tasks] Database not available, using mock data for task creation');
    const newTask = addMockTask({
      title,
      description,
      assignedTo,
      dueDate: new Date(dueDate),
      priority,
      status: 'Pending',
      assignedBy: req.user?.id || '507f1f77bcf86cd799439011',
    });
    res.json(newTask);
  }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    
    // Fallback mock data for local testing
    console.log('[Tasks] Database not available, using mock data for task update');
    const updatedTask = updateMockTask(req.params.id, req.body);
    if (!updatedTask) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.json(updatedTask);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findByIdAndRemove(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.json({ msg: 'Task removed' });
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    
    // Fallback mock data for local testing
    console.log('[Tasks] Database not available, using mock data for task deletion');
    const deletedTask = deleteMockTask(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.json({ msg: 'Task removed' });
  }
}; 