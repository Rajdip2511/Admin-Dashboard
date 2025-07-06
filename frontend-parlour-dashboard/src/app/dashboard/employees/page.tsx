'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Employee, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { EmployeeForm } from '@/components/EmployeeForm';

export default function EmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

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

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedEmployee(null);
    fetchEmployees();
  };

  const handleDelete = async (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await apiService.deleteEmployee(employeeId);
        fetchEmployees();
      } catch (err: any) {
        setError(err.message || 'Failed to delete employee');
      }
    }
  };

  if (isLoading) return <div className="text-center p-8">Loading employees...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employee Management</h1>
        {user?.role === UserRole.SUPER_ADMIN && (
          <Button onClick={() => { setSelectedEmployee(null); setIsFormOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        )}
      </div>

      {isFormOpen && (
        <EmployeeForm
          employee={selectedEmployee}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <Card key={employee._id}>
            <CardHeader>
              <CardTitle>{employee.firstName} {employee.lastName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{employee.position}</p>
              <p className="text-sm text-gray-500">{employee.email}</p>
              <p className="text-sm text-gray-500">{employee.phone}</p>
              {user?.role === UserRole.SUPER_ADMIN && (
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="icon" onClick={() => { setSelectedEmployee(employee); setIsFormOpen(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(employee._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 