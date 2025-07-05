'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <div>
      <h1>Welcome to the Dashboard, {user?.firstName || user?.email}!</h1>
      <p>Your role is: {user?.role}</p>
      {/* We will build out the rest of the dashboard here */}
    </div>
  );
} 