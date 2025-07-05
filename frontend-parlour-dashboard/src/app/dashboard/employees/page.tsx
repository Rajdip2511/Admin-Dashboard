'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Employee } from '@/types';
import { EmployeeForm } from '@/components/EmployeeForm';
import { Button } from '@/components/ui/button';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

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

  const handleSave = async (employeeData: Partial<Employee>) => {
    try {
      if (editingEmployee) {
        // Update employee
        const response = await apiService.updateEmployee(editingEmployee.id, employeeData);
        if (response.success) {
          setEmployees(employees.map(emp => emp.id === editingEmployee.id ? response.data : emp));
        } else {
          setError(response.message || 'Failed to update employee');
        }
      } else {
        // Create new employee
        const response = await apiService.createEmployee(employeeData);
        if (response.success) {
          setEmployees([...employees, response.data]);
        } else {
          setError(response.message || 'Failed to create employee');
        }
      }
      setIsFormOpen(false);
      setEditingEmployee(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleDelete = async (employeeId: string) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const response = await apiService.deleteEmployee(employeeId);
      if (response.success) {
        setEmployees(employees.filter((emp) => emp.id !== employeeId));
      } else {
        setError(response.message || 'Failed to delete employee');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  if (isLoading) return <div>Loading employees...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Employees</h1>
      {user?.role === 'Super Admin' && (
        <Button className="mb-4" onClick={() => { setEditingEmployee(null); setIsFormOpen(true); }}>
          Add Employee
        </Button>
      )}
      
      {isFormOpen && (
        <EmployeeForm 
          employee={editingEmployee}
          onSave={handleSave}
          onCancel={() => { setIsFormOpen(false); setEditingEmployee(null); }}
        />
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
                      <Button variant="outline" size="sm" onClick={() => { setEditingEmployee(employee); setIsFormOpen(true); }}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(employee.id)}>Delete</Button>
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