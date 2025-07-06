import { Schema, model } from 'mongoose';
import { ITask, ITaskModel, TaskStatus, TaskPriority } from '../types';

const taskSchema = new Schema<ITask>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.PENDING,
  },
  priority: {
    type: String,
    enum: Object.values(TaskPriority),
    default: TaskPriority.MEDIUM,
  },
  dueDate: { type: Date, required: true },
  completedDate: { type: Date },
}, { timestamps: true });

taskSchema.statics.findOverdueTasks = function () {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $ne: TaskStatus.COMPLETED },
  });
};

const Task = model<ITask, ITaskModel>('Task', taskSchema);

export default Task;
