// User Types
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN'
}

export interface User {
  _id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: User
  token?: string
}

// Employee Types
export interface Employee {
  _id: string
  employeeId: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  hireDate: string
  salary: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeData {
  name: string
  email: string
  phone: string
  position: string
  department: string
  hireDate: string
  salary: number
}

// Task Types
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Task {
  _id: string
  title: string
  description: string
  assignedTo: string
  assignedBy: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  completedDate?: string
  createdAt: string
  updatedAt: string
  employee?: Employee
  assigner?: User
}

export interface CreateTaskData {
  title: string
  description: string
  assignedTo: string
  priority: TaskPriority
  dueDate: string
}

// Attendance Types
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY'
}

export interface Attendance {
  _id: string
  employeeId: string
  date: string
  punchIn?: string
  punchOut?: string
  hoursWorked: number
  status: AttendanceStatus
  notes?: string
  createdAt: string
  updatedAt: string
  employee?: Employee
}

export interface PunchData {
  employeeId: string
  type: 'in' | 'out'
  notes?: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T = any> {
  success: boolean
  message: string
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Dashboard Types
export interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  presentToday: number
  totalTasks: number
  pendingTasks: number
  completedTasks: number
  todayAttendance: number
  averageHoursWorked: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string[]
    borderWidth?: number
  }[]
}

// Socket.IO Types
export interface SocketAttendanceUpdate {
  employeeId: string
  employee: Employee
  type: 'punch_in' | 'punch_out'
  timestamp: string
  attendance: Attendance
}

export interface SocketTaskUpdate {
  taskId: string
  task: Task
  type: 'created' | 'updated' | 'deleted'
  timestamp: string
}

export interface SocketStatsUpdate {
  stats: DashboardStats
  timestamp: string
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: RegExp
    message?: string
  }
}

export interface FormData {
  [key: string]: string | number | boolean | Date
}

// Navigation Types
export interface NavItem {
  title: string
  href: string
  icon?: string
  disabled?: boolean
  external?: boolean
  label?: string
}

export interface SidebarNavItem extends NavItem {
  items?: SidebarNavItem[]
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system'

// Store Types
export interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  register: (data: RegisterData) => Promise<void>
  updateUser: (user: User) => void
}

export interface EmployeeStore {
  employees: Employee[]
  currentEmployee: Employee | null
  isLoading: boolean
  error: string | null
  fetchEmployees: () => Promise<void>
  createEmployee: (data: CreateEmployeeData) => Promise<void>
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>
  deleteEmployee: (id: string) => Promise<void>
  setCurrentEmployee: (employee: Employee | null) => void
}

export interface TaskStore {
  tasks: Task[]
  currentTask: Task | null
  isLoading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  createTask: (data: CreateTaskData) => Promise<void>
  updateTask: (id: string, data: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  setCurrentTask: (task: Task | null) => void
}

export interface AttendanceStore {
  attendances: Attendance[]
  currentAttendance: Attendance | null
  isLoading: boolean
  error: string | null
  fetchAttendances: () => Promise<void>
  punchIn: (data: PunchData) => Promise<void>
  punchOut: (data: PunchData) => Promise<void>
  setCurrentAttendance: (attendance: Attendance | null) => void
}

export interface DashboardStore {
  stats: DashboardStats | null
  isLoading: boolean
  error: string | null
  fetchStats: () => Promise<void>
  updateStats: (stats: DashboardStats) => void
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>> 