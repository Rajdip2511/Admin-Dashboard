'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Employee } from '@/types';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await apiService.getEmployees();
        if (response.success) {
          setEmployees(response.data);
        } else {
          setError(response.message || 'Failed to fetch employees');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (isLoading) return <div>Loading employees...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Employees</h1>
      {user?.role === 'Super Admin' && (
        <button className="mb-4 p-2 bg-blue-500 text-white rounded">
          Add Employee
        </button>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Position</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="py-2 px-4 border-b">{employee.firstName} {employee.lastName}</td>
                <td className="py-2 px-4 border-b">{employee.email}</td>
                <td className="py-2 px-4 border-b">{employee.position}</td>
                <td className="py-2 px-4 border-b">
                  {user?.role === 'Super Admin' && (
                    <div className="flex space-x-2">
                      <button className="p-1 bg-yellow-500 text-white rounded text-sm">Edit</button>
                      <button className="p-1 bg-red-500 text-white rounded text-sm">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 