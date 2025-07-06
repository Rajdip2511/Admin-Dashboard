'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { apiService } from '@/lib/api';
import { Employee, UserRole, CreateEmployeeData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmployeeFormProps {
  employee?: Employee | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const { register, handleSubmit, reset, setValue, control } = useForm<Partial<Employee & CreateEmployeeData>>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employee) {
      setValue('firstName', employee.firstName);
      setValue('lastName', employee.lastName);
      setValue('email', employee.email);
      setValue('phone', employee.phone);
      setValue('position', employee.position);
      setValue('role', employee.role);
    } else {
      reset();
    }
  }, [employee, setValue, reset]);

  const onSubmit = async (data: Partial<Employee & CreateEmployeeData>) => {
    try {
      setError(null);
      console.log('Submitting employee data:', data);
      
      let response;
      if (employee) {
        // For updates, exclude password field
        const { password, ...updateData } = data;
        response = await apiService.updateEmployee(employee._id, updateData);
      } else {
        // For creation, include all fields
        response = await apiService.createEmployee(data);
      }
      
      console.log('API response:', response);
      
      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Operation failed');
      }
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <Card className="mb-8">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>{employee ? 'Edit Employee' : 'Add Employee'}</CardTitle>
          <CardDescription>
            {employee ? 'Update the details of the employee.' : 'Enter the details for the new employee.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register('firstName', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register('lastName', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input id="position" {...register('position')} />
          </div>
          {!employee && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password', { required: !employee })} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Controller
              name="role"
              control={control}
              defaultValue={employee?.role || UserRole.ADMIN}
              render={({ field }: { field: any }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                        <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                    </SelectContent>
                </Select>
              )}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {employee ? 'Update' : 'Create'}
          </Button>
        </CardFooter>
      </form>
      {error && <p className="text-red-500 text-center p-4">{error}</p>}
    </Card>
  );
} 