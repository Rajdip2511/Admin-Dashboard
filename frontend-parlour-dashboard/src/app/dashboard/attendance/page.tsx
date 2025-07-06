'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { Employee } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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
    socketService.connect({});

    const handleAttendanceUpdate = (data: { employeeId: string; status: string }) => {
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp._id === data.employeeId ? { ...emp, status: data.status } : emp
        )
      );
    };

    socketService.socket.on('attendanceUpdate', handleAttendanceUpdate);

    return () => {
      socketService.socket.off('attendanceUpdate', handleAttendanceUpdate);
      socketService.disconnect();
    };
  }, []);

  if (isLoading) return <div className="text-center p-8">Loading attendance data...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Live Attendance</h1>
        <Link href="/attendance" className="text-blue-500 hover:underline">
          Go to Public Attendance Page
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee) => (
          <Card key={employee._id} className={
            employee.status === 'Punched In' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
          }>
            <CardHeader>
                <CardTitle>{employee.firstName} {employee.lastName}</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Status: <Badge className={
                    employee.status === 'Punched In' ? 'bg-green-500' : 'bg-red-500'
                }>{employee.status}</Badge></p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 