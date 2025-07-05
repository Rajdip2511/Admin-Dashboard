'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { Employee } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Loader2 } from 'lucide-react';
import { formatTime } from '@/lib/utils';


interface EmployeeWithStatus extends Employee {
  status: string;
}

export default function AttendancePage() {
  const [employees, setEmployees] = useState<EmployeeWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await apiService.getEmployeesWithStatus();
        if (response.success) {
          setEmployees(response.data);
        } else {
          setError(response.message || 'Failed to fetch data');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    const handleAttendanceUpdate = (data: { employeeId: string; status: string }) => {
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === data.employeeId ? { ...emp, status: data.status } : emp
        )
      );
    };
    
    socketService.connect(null); // Connect without a user
    if (socketService.socket) {
      socketService.socket.on('attendanceUpdate', handleAttendanceUpdate);
    }

    return () => {
      if (socketService.socket) {
        socketService.socket.off('attendanceUpdate', handleAttendanceUpdate);
      }
      socketService.disconnect();
    };
  }, [socketService.socket]);

  const handlePunch = async (employeeId: string, currentStatus: string) => {
    const action = currentStatus === 'Punched In' ? 'punch-out' : 'punch-in';
    try {
      await apiService.punchInOut({ employeeId, action });
      // The WebSocket event will trigger the UI update
    } catch (err: any) {
      setError(err.message || `Failed to punch ${action}`);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Employee Punch Station</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2 mt-2">
          <Clock className="h-5 w-5" /> {formatTime(currentTime)} - {currentTime.toDateString()}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {employees.map((employee) => (
          <Card key={employee.id} className="text-center">
            <CardHeader>
              <CardTitle>{employee.firstName} {employee.lastName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Status: <span className={`font-semibold ${employee.status === 'Punched In' ? 'text-green-500' : 'text-red-500'}`}>{employee.status}</span></p>
              <Button
                onClick={() => handlePunch(employee.id, employee.status)}
                className={`w-full ${
                  employee.status === 'Punched In'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {employee.status === 'Punched In' ? 'Punch Out' : 'Punch In'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 