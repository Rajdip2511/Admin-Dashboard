'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { Employee } from '@/types';

interface EmployeeWithStatus extends Employee {
  status: string;
}

export default function AttendanceDashboardPage() {
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

    const handleAttendanceUpdate = (data: { employeeId: string; status: string }) => {
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === data.employeeId ? { ...emp, status: data.status } : emp
        )
      );
    };

    if (socketService.socket) {
      socketService.socket.on('attendanceUpdate', handleAttendanceUpdate);
    }

    return () => {
      if (socketService.socket) {
        socketService.socket.off('attendanceUpdate', handleAttendanceUpdate);
      }
    };
  }, [socketService.socket]);

  if (isLoading) return <div>Loading attendance data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Live Attendance</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee) => (
          <div key={employee.id} className={`p-4 rounded-lg shadow-md ${
            employee.status === 'Punched In' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
          }`}>
            <h2 className="font-bold">{employee.firstName} {employee.lastName}</h2>
            <p>Status: {employee.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 