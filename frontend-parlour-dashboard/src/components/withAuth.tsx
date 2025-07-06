'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/types';

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles?: UserRole[]
) => {
  const AuthComponent = (props: P) => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          router.replace('/login');
        } else if (allowedRoles && !allowedRoles.includes(user.role)) {
          router.replace('/dashboard'); // Or a dedicated "unauthorized" page
        }
      }
    }, [user, isLoading, router, allowedRoles]);

    if (isLoading || !user) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <div className="flex justify-center items-center h-screen">Unauthorized</div>;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth; 