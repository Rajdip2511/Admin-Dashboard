'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Task } from '@/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Tasks</h1>
      {user?.role === 'Super Admin' && (
        <button className="mb-4 p-2 bg-blue-500 text-white rounded">
          Add Task
        </button>
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