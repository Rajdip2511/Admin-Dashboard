'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-6">
          <h1 className="text-xl font-bold">Parlour Dash</h1>
        </div>
        <nav className="mt-6">
          <Link href="/dashboard/employees" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-200 dark:hover:bg-gray-700">
            Employees
          </Link>
          <Link href="/dashboard/tasks" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-200 dark:hover:bg-gray-700">
            Tasks
          </Link>
          <Link href="/dashboard/attendance" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-200 dark:hover:bg-gray-700">
            Attendance
          </Link>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
          <div>
            {/* Header content can go here */}
          </div>
          <div>
            <span className="mr-4">Welcome, {user?.firstName || user?.email}</span>
            <button onClick={logout} className="p-2 bg-red-500 text-white rounded">Logout</button>
          </div>
        </header>
        <div className="p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout; 