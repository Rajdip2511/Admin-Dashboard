'use client';

import { ReactNode } from 'react';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Users, Briefcase, Calendar, LogOut } from 'lucide-react';

function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  const navLinks = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/employees', label: 'Employees', icon: Users },
    { href: '/dashboard/tasks', label: 'Tasks', icon: Briefcase },
    { href: '/dashboard/attendance', label: 'Attendance', icon: Calendar },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">Parlour</h1>
        <nav className="flex-grow">
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>
                  <a className="flex items-center p-2 rounded-md hover:bg-gray-700">
                    <link.icon className="mr-3 h-5 w-5" />
                    {link.label}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p>{user?.email}</p>
          <Button onClick={logout} variant="ghost" className="w-full justify-start">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-grow p-8 bg-gray-100 dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
}

export default withAuth(DashboardLayout); 