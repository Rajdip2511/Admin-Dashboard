import { io, Socket } from 'socket.io-client'
import { 
  SocketAttendanceUpdate, 
  SocketTaskUpdate, 
  SocketStatsUpdate, 
  User 
} from '@/types'

// Socket.IO Configuration
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'

class SocketService {
  private socket: Socket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  // Initialize socket connection
  connect(user?: User): void {
    if (this.socket?.connected) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('No auth token found, cannot connect to socket')
      return
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    })

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('Connected to socket server')
      this.isConnected = true
      this.reconnectAttempts = 0

      // Join user-specific room based on role
      if (user) {
        this.joinRoom(user.role)
      }
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from socket server:', reason)
      this.isConnected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.isConnected = false
      this.reconnectAttempts++

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        this.disconnect()
      }
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected to socket server (attempt ${attemptNumber})`)
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error)
    })

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed')
      this.disconnect()
    })

    // Authentication errors
    this.socket.on('auth_error', (error) => {
      console.error('Socket authentication error:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    })
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Join specific room based on user role
  joinRoom(role: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_room', role)
    }
  }

  // Leave specific room
  leaveRoom(role: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_room', role)
    }
  }

  // Attendance event handlers
  onAttendanceUpdate(callback: (data: SocketAttendanceUpdate) => void): void {
    if (this.socket) {
      this.socket.on('attendance_update', callback)
    }
  }

  offAttendanceUpdate(callback?: (data: SocketAttendanceUpdate) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off('attendance_update', callback)
      } else {
        this.socket.off('attendance_update')
      }
    }
  }

  // Task event handlers
  onTaskUpdate(callback: (data: SocketTaskUpdate) => void): void {
    if (this.socket) {
      this.socket.on('task_update', callback)
    }
  }

  offTaskUpdate(callback?: (data: SocketTaskUpdate) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off('task_update', callback)
      } else {
        this.socket.off('task_update')
      }
    }
  }

  // Dashboard stats event handlers
  onStatsUpdate(callback: (data: SocketStatsUpdate) => void): void {
    if (this.socket) {
      this.socket.on('stats_update', callback)
    }
  }

  offStatsUpdate(callback?: (data: SocketStatsUpdate) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off('stats_update', callback)
      } else {
        this.socket.off('stats_update')
      }
    }
  }

  // General event handlers
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback)
      } else {
        this.socket.off(event)
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    if (this.socket?.connected) {
      this.socket.emit(event, ...args)
    }
  }

  // Utility methods
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true
  }

  getSocketId(): string | undefined {
    return this.socket?.id
  }

  // Ping server
  ping(): void {
    if (this.socket?.connected) {
      this.socket.emit('ping', Date.now())
    }
  }

  // Handle ping response
  onPong(callback: (latency: number) => void): void {
    if (this.socket) {
      this.socket.on('pong', (timestamp: number) => {
        const latency = Date.now() - timestamp
        callback(latency)
      })
    }
  }

  // Request real-time updates
  requestRealTimeUpdates(): void {
    if (this.socket?.connected) {
      this.socket.emit('request_realtime_updates')
    }
  }

  // Stop real-time updates
  stopRealTimeUpdates(): void {
    if (this.socket?.connected) {
      this.socket.emit('stop_realtime_updates')
    }
  }
}

// Create and export singleton instance
export const socketService = new SocketService()
export default socketService

// Socket event types for TypeScript
export interface SocketEvents {
  connect: () => void
  disconnect: (reason: string) => void
  connect_error: (error: Error) => void
  reconnect: (attemptNumber: number) => void
  reconnect_error: (error: Error) => void
  reconnect_failed: () => void
  auth_error: (error: string) => void
  attendance_update: (data: SocketAttendanceUpdate) => void
  task_update: (data: SocketTaskUpdate) => void
  stats_update: (data: SocketStatsUpdate) => void
  pong: (timestamp: number) => void
}

// Custom hooks for React components
export const useSocket = () => {
  return {
    connect: (user?: User) => socketService.connect(user),
    disconnect: () => socketService.disconnect(),
    isConnected: () => socketService.isSocketConnected(),
    emit: (event: string, ...args: any[]) => socketService.emit(event, ...args),
    on: (event: string, callback: (...args: any[]) => void) => socketService.on(event, callback),
    off: (event: string, callback?: (...args: any[]) => void) => socketService.off(event, callback),
  }
} 