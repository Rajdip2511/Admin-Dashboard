'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { apiService } from '@/lib/api';
import { Task, Employee, TaskStatus, TaskPriority } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskFormProps {
  task?: Task | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const { register, handleSubmit, reset, setValue, control } = useForm<Partial<Task>>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await apiService.getEmployees();
        if (response.success) {
          setEmployees(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch employees', err);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (task) {
      setValue('title', task.title);
      setValue('description', task.description);
      setValue('assignedTo', task.assignedTo);
      setValue('status', task.status);
      setValue('priority', task.priority);
      setValue('dueDate', new Date(task.dueDate).toISOString().split('T')[0]);
    } else {
      reset();
    }
  }, [task, setValue, reset]);

  const onSubmit = async (data: Partial<Task>) => {
    try {
      setError(null);
      console.log('Submitting task data:', data);
      
      let response;
      if (task) {
        response = await apiService.updateTask(task._id, data);
      } else {
        response = await apiService.createTask(data);
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
          <CardTitle>{task ? 'Edit Task' : 'Assign Task'}</CardTitle>
          <CardDescription>
            {task ? 'Update the details of the task.' : 'Enter the details for the new task.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title', { required: true })} />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assign To</Label>
            <Controller
              name="assignedTo"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={typeof field.value === 'string' ? field.value : (field.value as Employee)?._id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="date" {...register('dueDate', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                            <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                            <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
                name="status"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                            <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                            <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                            <SelectItem value={TaskStatus.CANCELLED}>Cancelled</SelectItem>
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
          <Button type="submit">{task ? 'Update' : 'Create'}</Button>
        </CardFooter>
      </form>
      {error && <p className="text-red-500 text-center p-4">{error}</p>}
    </Card>
  );
} 