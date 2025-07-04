import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { IJWTPayload, ISocketEvents, UserRole } from '@/types';
import User from '@/models/User';
import Employee from '@/models/Employee';
import Attendance from '@/models/Attendance';

// Track connected users
const connectedUsers = new Map<string, Socket>();
const userRoles = new Map<string, UserRole>();

// Initialize Socket.IO server
export const initializeSocket = (io: SocketIOServer): void => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const jwtSecret = process.env['JWT_SECRET'];
      if (!jwtSecret) {
        return next(new Error('JWT secret not configured'));
      }

      // Verify token
      const decoded = jwt.verify(token, jwtSecret) as IJWTPayload;
      
      // Find user in database
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      if (!user.isActive) {
        return next(new Error('User account is deactivated'));
      }

      // Attach user to socket
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  // Handle connection
  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    
    if (!user) {
      socket.disconnect();
      return;
    }

    console.log(`✅ User connected: ${user.email} (${user.role})`);
    
    // Store connected user
    connectedUsers.set(user._id.toString(), socket);
    userRoles.set(user._id.toString(), user.role);

    // Join room based on user role
    if (user.role === UserRole.SUPER_ADMIN) {
      socket.join('super-admins');
      socket.join('admins');
    } else if (user.role === UserRole.ADMIN) {
      socket.join('admins');
    }

    // Handle attendance punch in
    socket.on('attendance:punch-in', async (data: { employeeId: string; location?: any }) => {
      try {
        console.log(`📊 Punch in request: ${data.employeeId}`);
        
        // Verify employee exists
        const employee = await Employee.findById(data.employeeId);
        if (!employee) {
          socket.emit('error', { message: 'Employee not found' });
          return;
        }

        // Create attendance record
        const attendance = await Attendance.punchIn(data.employeeId, data.location);
        
        // Populate employee data
        await attendance.populate('employeeId');
        
        // Emit to all admin users
        io.to('admins').emit('attendance:update', {
          type: 'punch-in',
          attendance: attendance,
          employee: employee,
          timestamp: new Date()
        });

        // Confirm to sender
        socket.emit('attendance:punch-in-success', {
          message: 'Punched in successfully',
          attendance: attendance
        });

        console.log(`✅ Employee ${employee.fullName} punched in`);
      } catch (error: any) {
        console.error('❌ Punch in error:', error.message);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle attendance punch out
    socket.on('attendance:punch-out', async (data: { employeeId: string; location?: any }) => {
      try {
        console.log(`📊 Punch out request: ${data.employeeId}`);
        
        // Verify employee exists
        const employee = await Employee.findById(data.employeeId);
        if (!employee) {
          socket.emit('error', { message: 'Employee not found' });
          return;
        }

        // Update attendance record
        const attendance = await Attendance.punchOut(data.employeeId, data.location);
        
        // Populate employee data
        await attendance.populate('employeeId');
        
        // Emit to all admin users
        io.to('admins').emit('attendance:update', {
          type: 'punch-out',
          attendance: attendance,
          employee: employee,
          timestamp: new Date()
        });

        // Confirm to sender
        socket.emit('attendance:punch-out-success', {
          message: 'Punched out successfully',
          attendance: attendance
        });

        console.log(`✅ Employee ${employee.fullName} punched out`);
      } catch (error: any) {
        console.error('❌ Punch out error:', error.message);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle get today's attendance
    socket.on('attendance:get-today', async () => {
      try {
        const todayAttendance = await Attendance.findTodayAttendance();
        socket.emit('attendance:today-data', todayAttendance);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle get active employees
    socket.on('attendance:get-active', async () => {
      try {
        const activeEmployees = await Attendance.findActiveEmployees();
        socket.emit('attendance:active-data', activeEmployees);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle dashboard stats request
    socket.on('dashboard:get-stats', async () => {
      try {
        // Only admins can access dashboard stats
        if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        const stats = await getDashboardStats();
        socket.emit('dashboard:stats', stats);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle join specific room
    socket.on('join-room', (roomName: string) => {
      // Validate room access based on user role
      if (roomName === 'super-admins' && user.role !== UserRole.SUPER_ADMIN) {
        socket.emit('error', { message: 'Access denied to super admin room' });
        return;
      }
      
      if (roomName === 'admins' && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        socket.emit('error', { message: 'Access denied to admin room' });
        return;
      }

      socket.join(roomName);
      socket.emit('room-joined', { room: roomName });
    });

    // Handle leave room
    socket.on('leave-room', (roomName: string) => {
      socket.leave(roomName);
      socket.emit('room-left', { room: roomName });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`👋 User disconnected: ${user.email}`);
      connectedUsers.delete(user._id.toString());
      userRoles.delete(user._id.toString());
    });
  });

  console.log('🔌 Socket.IO server initialized');
};

// Helper function to get dashboard stats
const getDashboardStats = async () => {
  const [
    totalEmployees,
    activeEmployees,
    todayAttendance,
    recentAttendance
  ] = await Promise.all([
    Employee.countDocuments(),
    Employee.countDocuments({ isActive: true }),
    Attendance.findTodayAttendance(),
    Attendance.find().sort({ createdAt: -1 }).limit(10).populate('employeeId')
  ]);

  return {
    totalEmployees,
    activeEmployees,
    todayAttendance: todayAttendance.length,
    recentAttendance,
    timestamp: new Date()
  };
};

// Utility functions for external use
export const emitToAdmins = (event: string, data: any): void => {
  connectedUsers.forEach((socket, userId) => {
    const userRole = userRoles.get(userId);
    if (userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN) {
      socket.emit(event, data);
    }
  });
};

export const emitToSuperAdmins = (event: string, data: any): void => {
  connectedUsers.forEach((socket, userId) => {
    const userRole = userRoles.get(userId);
    if (userRole === UserRole.SUPER_ADMIN) {
      socket.emit(event, data);
    }
  });
};

export const emitToUser = (userId: string, event: string, data: any): void => {
  const socket = connectedUsers.get(userId);
  if (socket) {
    socket.emit(event, data);
  }
};

export const getConnectedUsers = (): Map<string, Socket> => {
  return connectedUsers;
};

export const getUserRole = (userId: string): UserRole | undefined => {
  return userRoles.get(userId);
};

export const isUserConnected = (userId: string): boolean => {
  return connectedUsers.has(userId);
};

export default initializeSocket; 