import axios from 'axios';
import { LoginCredentials, ApiResponse, Employee } from '@/types';
import { Task } from '@/types';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return { success: true, data: response.data, message: 'Login successful' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  // Employee CRUD
  getEmployees: async (): Promise<ApiResponse> => {
    try {
      const response = await apiClient.get('/employees');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  getEmployeesWithStatus: async (): Promise<ApiResponse> => {
    try {
      const response = await apiClient.get('/employees/status');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  createEmployee: async (employeeData: Partial<Employee>): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/employees', employeeData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  updateEmployee: async (employeeId: string, employeeData: Partial<Employee>): Promise<ApiResponse> => {
    try {
      const response = await apiClient.put(`/employees/${employeeId}`, employeeData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  deleteEmployee: async (employeeId: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete(`/employees/${employeeId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  punchInOut: async (data: { employeeId: string, action: string }): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/attendance/punch', data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  // Task CRUD
  getTasks: async (): Promise<ApiResponse> => {
    try {
      const response = await apiClient.get('/tasks');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  createTask: async (taskData: Partial<Task>): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/tasks', taskData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  updateTask: async (taskId: string, taskData: Partial<Task>): Promise<ApiResponse> => {
    try {
      const response = await apiClient.put(`/tasks/${taskId}`, taskData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },

  deleteTask: async (taskId: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete(`/tasks/${taskId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.msg || error.message };
    }
  },
}; 