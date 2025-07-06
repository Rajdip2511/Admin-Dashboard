import { Document, Model, Schema } from 'mongoose';

export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
}

export interface IUser {
  _id: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type IEmployee = Document & {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  user: Schema.Types.ObjectId;
};

export interface IEmployeeModel extends Model<IEmployee> {
  findActiveEmployees(): Promise<IEmployee[]>;
}

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface ITask extends Document {
  title: string;
  description: string;
  assignedTo: Schema.Types.ObjectId;
  assignedBy: Schema.Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  completedDate?: Date;
}

export interface ITaskModel extends Model<ITask> {
  findOverdueTasks(): Promise<ITask[]>;
}

export interface IAttendance extends Document {
  employee: Schema.Types.ObjectId;
  punchInTime: Date;
  punchOutTime?: Date;
  date: Date;
}

export interface IAttendanceModel extends Model<IAttendance> {
  findTodaysAttendance(): Promise<IAttendance[]>;
} 