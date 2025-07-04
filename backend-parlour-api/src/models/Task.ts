import mongoose, { Schema, Model } from 'mongoose';
import { ITask, TaskStatus, TaskPriority } from '@/types';

const taskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [1000, 'Task description cannot exceed 1000 characters']
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Task must be assigned to an employee']
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must have an assigner']
  },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.PENDING,
    required: true
  },
  priority: {
    type: String,
    enum: Object.values(TaskPriority),
    default: TaskPriority.MEDIUM,
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(value: Date) {
        return value >= new Date();
      },
      message: 'Due date cannot be in the past'
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  completedDate: {
    type: Date,
    default: null
  },
  estimatedHours: {
    type: Number,
    required: [true, 'Estimated hours is required'],
    min: [0.5, 'Estimated hours must be at least 0.5'],
    max: [500, 'Estimated hours cannot exceed 500']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    max: [1000, 'Actual hours cannot exceed 1000']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  attachments: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ startDate: 1 });
taskSchema.index({ createdAt: -1 });

// Compound indexes
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ status: 1, priority: 1 });
taskSchema.index({ dueDate: 1, status: 1 });

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== TaskStatus.COMPLETED;
});

// Virtual for days remaining
taskSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const diffTime = this.dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Static method to find tasks by employee
taskSchema.statics.findByEmployee = function(employeeId: string) {
  return this.find({ assignedTo: employeeId }).populate('assignedTo assignedBy');
};

// Static method to find tasks by status
taskSchema.statics.findByStatus = function(status: TaskStatus) {
  return this.find({ status }).populate('assignedTo assignedBy');
};

// Static method to find overdue tasks
taskSchema.statics.findOverdueTasks = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $ne: TaskStatus.COMPLETED }
  }).populate('assignedTo assignedBy');
};

// Static method to find tasks by priority
taskSchema.statics.findByPriority = function(priority: TaskPriority) {
  return this.find({ priority }).populate('assignedTo assignedBy');
};

// Static method to find tasks due today
taskSchema.statics.findTasksDueToday = function() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  return this.find({
    dueDate: { $gte: startOfDay, $lt: endOfDay },
    status: { $ne: TaskStatus.COMPLETED }
  }).populate('assignedTo assignedBy');
};

// Pre-save middleware to set completion date
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === TaskStatus.COMPLETED && !this.completedDate) {
    this.completedDate = new Date();
  }
  
  if (this.isModified('status') && this.status !== TaskStatus.COMPLETED && this.completedDate) {
    this.completedDate = undefined;
  }
  
  next();
});

// Ensure virtual fields are serialized
taskSchema.set('toJSON', { virtuals: true });

// Create and export the model
const Task: Model<ITask> = mongoose.model<ITask>('Task', taskSchema);

export default Task; 