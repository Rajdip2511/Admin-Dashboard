'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { Employee } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EmployeeWithStatus extends Employee {
  status: string;
}

export default function AttendancePage() {
  const [employees, setEmployees] = useState<EmployeeWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    socketService.connect({});

    const handleAttendanceUpdate = (data: { employeeId: string; status: string; employeeName?: string; timestamp?: string }) => {
      console.log(`[WebSocket] Attendance update received:`, data);
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp._id === data.employeeId ? { ...emp, status: data.status } : emp
        )
      );
      
      // Show a notification about the update
      if (data.employeeName) {
        console.log(`[Real-time] ${data.employeeName} status changed to: ${data.status}`);
      }
    };

    socketService.socket.on('attendanceUpdate', handleAttendanceUpdate);

    return () => {
      socketService.socket.off('attendanceUpdate', handleAttendanceUpdate);
      socketService.disconnect();
    };
  }, []);

  const handlePunch = async (employeeId: string, status: string) => {
    const action = status === 'Punched In' ? 'punch-out' : 'punch-in';
    const employee = employees.find(emp => emp._id === employeeId);
    console.log(`[Punch] ${employee?.firstName} ${employee?.lastName} attempting to ${action}`);
    
    try {
        if(action === 'punch-in') {
            await apiService.punchIn(employeeId);
            console.log(`[Punch] ${employee?.firstName} ${employee?.lastName} successfully punched in`);
        } else {
            await apiService.punchOut(employeeId);
            console.log(`[Punch] ${employee?.firstName} ${employee?.lastName} successfully punched out`);
        }
    } catch (error) {
        console.error('Failed to punch in/out', error);
        setError('Failed to update attendance');
    }
  };

  if (isLoading) return <div className="text-center p-8">Loading employees...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Parlour Front-Desk Attendance</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees.map((employee) => (
          <Card key={employee._id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{employee.firstName} {employee.lastName}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <div>
                <Badge 
                  className={
                    employee.status === 'Punched In' 
                    ? 'bg-green-500' 
                    : employee.status === 'Punched Out'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                  }
                >
                  {employee.status}
                </Badge>
                <p className="text-sm text-gray-500 mt-2">{employee.position}</p>
              </div>
              <Button
                onClick={() => handlePunch(employee._id, employee.status)}
                className={`mt-4 w-full ${
                  employee.status === 'Punched In' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
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