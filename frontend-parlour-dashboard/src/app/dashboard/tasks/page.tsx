'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Task, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { TaskForm } from '@/components/TaskForm';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await apiService.getTasks();
      if (response.success) {
        setTasks(response.data);
      } else {
        setError(response.message || 'Failed to fetch tasks');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedTask(null);
    fetchTasks();
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await apiService.deleteTask(taskId);
        fetchTasks();
      } catch (err: any) {
        setError(err.message || 'Failed to delete task');
      }
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) return <div className="text-center p-8">Loading tasks...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Management</h1>
        {user?.role === UserRole.SUPER_ADMIN && (
          <Button onClick={() => { setSelectedTask(null); setIsFormOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Assign Task
          </Button>
        )}
      </div>

      {isFormOpen && (
        <TaskForm
          task={selectedTask}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <Card key={task._id}>
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
              <CardDescription>Due by {new Date(task.dueDate).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{task.description}</p>
              <div className="flex justify-between items-center">
                <div>
                  <Badge className={getPriorityBadge(task.priority)}>{task.priority}</Badge>
                  <Badge className="ml-2">{task.status}</Badge>
                </div>
                {user?.role === UserRole.SUPER_ADMIN && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => { setSelectedTask(task); setIsFormOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(task._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 