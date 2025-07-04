import { Document, Types } from 'mongoose';

// User Role Enum
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin'
}

// Attendance Status Enum
export enum AttendanceStatus {
  PUNCH_IN = 'punch_in',
  PUNCH_OUT = 'punch_out'
}

// Task Status Enum
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Task Priority Enum
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// User Interface
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  toJSON(): Partial<IUser>;
}

// Employee Interface
export interface IEmployee extends Document {
  _id: Types.ObjectId;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: Date;
  salary: number;
  isActive: boolean;
  profileImage?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}

// Task Interface
export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  assignedTo: Types.ObjectId;
  assignedBy: Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  startDate: Date;
  completedDate?: Date;
  estimatedHours: number;
  actualHours?: number;
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Attendance Interface
export interface IAttendance extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  date: Date;
  punchIn?: Date;
  punchOut?: Date;
  status: AttendanceStatus;
  totalHours?: number;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// JWT Payload Interface
export interface IJWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// API Response Interface
export interface IAPIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Pagination Interface
export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

// Socket Event Types
export interface ISocketEvents {
  // Attendance Events
  'attendance:punch-in': (data: { employeeId: string; timestamp: Date }) => void;
  'attendance:punch-out': (data: { employeeId: string; timestamp: Date }) => void;
  'attendance:update': (data: IAttendance) => void;
  
  // Task Events
  'task:created': (data: ITask) => void;
  'task:updated': (data: ITask) => void;
  'task:deleted': (data: { taskId: string }) => void;
  
  // Employee Events
  'employee:created': (data: IEmployee) => void;
  'employee:updated': (data: IEmployee) => void;
  'employee:deleted': (data: { employeeId: string }) => void;
  
  // Dashboard Events
  'dashboard:stats-update': (data: any) => void;
  
  // Connection Events
  'connection': () => void;
  'disconnect': () => void;
  'error': (error: Error) => void;
}

// Request Extensions
export interface IAuthRequest extends Request {
  user?: IUser;
}

// Express Request with User
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Database Connection Options
export interface IDBOptions {
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
  retryWrites: boolean;
  w: string;
}

// Environment Variables
export interface IEnvConfig {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  MONGODB_URI_TEST: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_MAX_REQUESTS: number;
  RATE_LIMIT_WINDOW_MS: number;
  SOCKET_IO_CORS_ORIGIN: string;
  DEFAULT_SUPER_ADMIN_EMAIL: string;
  DEFAULT_SUPER_ADMIN_PASSWORD: string;
  DEFAULT_ADMIN_EMAIL: string;
  DEFAULT_ADMIN_PASSWORD: string;
  MONGODB_ATLAS_URI: string;
  BCRYPT_SALT_ROUNDS: number;
  SESSION_SECRET: string;
}

// Dashboard Stats Interface
export interface IDashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  todayAttendance: number;
  recentAttendance: IAttendance[];
  recentTasks: ITask[];
  employeeStats: {
    byDepartment: Array<{ department: string; count: number }>;
    byPosition: Array<{ position: string; count: number }>;
  };
  taskStats: {
    byStatus: Array<{ status: TaskStatus; count: number }>;
    byPriority: Array<{ priority: TaskPriority; count: number }>;
  };
}

// Export all types
export * from './index'; 