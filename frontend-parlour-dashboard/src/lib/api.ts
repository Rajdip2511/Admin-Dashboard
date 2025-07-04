import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { 
  User, 
  Employee, 
  Task, 
  Attendance, 
  LoginCredentials, 
  RegisterData, 
  CreateEmployeeData, 
  CreateTaskData, 
  PunchData, 
  ApiResponse, 
  PaginatedResponse, 
  DashboardStats 
} from '@/types'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Generic API methods
class ApiService {
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await api(config)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error(error.message || 'An error occurred')
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request({
      method: 'POST',
      url: '/auth/login',
      data: credentials,
    })
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request({
      method: 'POST',
      url: '/auth/register',
      data,
    })
  }

  async logout(): Promise<ApiResponse> {
    return this.request({
      method: 'POST',
      url: '/auth/logout',
    })
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request({
      method: 'GET',
      url: '/auth/profile',
    })
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request({
      method: 'PUT',
      url: '/auth/profile',
      data,
    })
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    return this.request({
      method: 'PUT',
      url: '/auth/change-password',
      data,
    })
  }

  // Employee endpoints
  async getEmployees(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Employee>> {
    return this.request({
      method: 'GET',
      url: '/employees',
      params,
    })
  }

  async getEmployee(id: string): Promise<ApiResponse<Employee>> {
    return this.request({
      method: 'GET',
      url: `/employees/${id}`,
    })
  }

  async createEmployee(data: CreateEmployeeData): Promise<ApiResponse<Employee>> {
    return this.request({
      method: 'POST',
      url: '/employees',
      data,
    })
  }

  async updateEmployee(id: string, data: Partial<Employee>): Promise<ApiResponse<Employee>> {
    return this.request({
      method: 'PUT',
      url: `/employees/${id}`,
      data,
    })
  }

  async deleteEmployee(id: string): Promise<ApiResponse> {
    return this.request({
      method: 'DELETE',
      url: `/employees/${id}`,
    })
  }

  // Task endpoints
  async getTasks(params?: { page?: number; limit?: number; status?: string; priority?: string }): Promise<PaginatedResponse<Task>> {
    return this.request({
      method: 'GET',
      url: '/tasks',
      params,
    })
  }

  async getTask(id: string): Promise<ApiResponse<Task>> {
    return this.request({
      method: 'GET',
      url: `/tasks/${id}`,
    })
  }

  async createTask(data: CreateTaskData): Promise<ApiResponse<Task>> {
    return this.request({
      method: 'POST',
      url: '/tasks',
      data,
    })
  }

  async updateTask(id: string, data: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request({
      method: 'PUT',
      url: `/tasks/${id}`,
      data,
    })
  }

  async deleteTask(id: string): Promise<ApiResponse> {
    return this.request({
      method: 'DELETE',
      url: `/tasks/${id}`,
    })
  }

  // Attendance endpoints
  async getAttendances(params?: { page?: number; limit?: number; employeeId?: string; date?: string }): Promise<PaginatedResponse<Attendance>> {
    return this.request({
      method: 'GET',
      url: '/attendance',
      params,
    })
  }

  async getAttendance(id: string): Promise<ApiResponse<Attendance>> {
    return this.request({
      method: 'GET',
      url: `/attendance/${id}`,
    })
  }

  async punchIn(data: PunchData): Promise<ApiResponse<Attendance>> {
    return this.request({
      method: 'POST',
      url: '/attendance/punch-in',
      data,
    })
  }

  async punchOut(data: PunchData): Promise<ApiResponse<Attendance>> {
    return this.request({
      method: 'POST',
      url: '/attendance/punch-out',
      data,
    })
  }

  async getTodayAttendance(): Promise<ApiResponse<Attendance[]>> {
    return this.request({
      method: 'GET',
      url: '/attendance/today',
    })
  }

  async getEmployeeAttendance(employeeId: string, params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<Attendance[]>> {
    return this.request({
      method: 'GET',
      url: `/attendance/employee/${employeeId}`,
      params,
    })
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request({
      method: 'GET',
      url: '/dashboard/stats',
    })
  }

  async getAttendanceReport(params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<any[]>> {
    return this.request({
      method: 'GET',
      url: '/dashboard/attendance-report',
      params,
    })
  }

  async getTaskReport(params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<any[]>> {
    return this.request({
      method: 'GET',
      url: '/dashboard/task-report',
      params,
    })
  }

  // User management endpoints (Super Admin only)
  async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<User>> {
    return this.request({
      method: 'GET',
      url: '/users',
      params,
    })
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.request({
      method: 'GET',
      url: `/users/${id}`,
    })
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request({
      method: 'PUT',
      url: `/users/${id}`,
      data,
    })
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.request({
      method: 'DELETE',
      url: `/users/${id}`,
    })
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request({
      method: 'GET',
      url: '/health',
    })
  }
}

// Create and export a singleton instance
export const apiService = new ApiService()
export default apiService

// Export axios instance for custom requests
export { api } 