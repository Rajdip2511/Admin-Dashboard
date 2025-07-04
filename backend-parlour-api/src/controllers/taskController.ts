import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/auth';

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'firstName lastName');
    res.json(tasks);
  } catch (err) {
    if (err instanceof Error) console.error(err.message);
    res.status(500).send('Server Error');
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
    res.status(500).send('Server Error');
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
    res.status(500).send('Server Error');
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
    res.status(500).send('Server Error');
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
    res.status(500).send('Server Error');
  }
}; 