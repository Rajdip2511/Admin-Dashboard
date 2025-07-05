'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Task } from '@/types';
import { TaskForm } from '@/components/TaskForm';
import { Button } from '@/components/ui/button';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
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

    fetchTasks();
  }, []);

  const handleSave = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        // Update task
        const response = await apiService.updateTask(editingTask.id, taskData);
        if (response.success) {
          setTasks(tasks.map(t => t.id === editingTask.id ? response.data : t));
        } else {
          setError(response.message || 'Failed to update task');
        }
      } else {
        // Create new task
        const response = await apiService.createTask(taskData);
        if (response.success) {
          setTasks([...tasks, response.data]);
        } else {
          setError(response.message || 'Failed to create task');
        }
      }
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await apiService.deleteTask(taskId);
      if (response.success) {
        setTasks(tasks.filter((t) => t.id !== taskId));
      } else {
        setError(response.message || 'Failed to delete task');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Tasks</h1>
      {user?.role === 'Super Admin' && (
        <Button className="mb-4" onClick={() => { setEditingTask(null); setIsFormOpen(true); }}>
          Add Task
        </Button>
      )}

      {isFormOpen && (
        <TaskForm 
          task={editingTask}
          onSave={handleSave}
          onCancel={() => { setIsFormOpen(false); setEditingTask(null); }}
        />
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Title</th>
              <th className="py-2 px-4 border-b">Assigned To</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Due Date</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="py-2 px-4 border-b">{task.title}</td>
                <td className="py-2 px-4 border-b">{task.assignedTo?.firstName} {task.assignedTo?.lastName}</td>
                <td className="py-2 px-4 border-b">{task.status}</td>
                <td className="py-2 px-4 border-b">{new Date(task.dueDate).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">
                  {user?.role === 'Super Admin' && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => { setEditingTask(task); setIsFormOpen(true); }}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(task.id)}>Delete</Button>
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