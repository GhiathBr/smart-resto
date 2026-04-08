'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const isAuthenticated = checkAuth();

    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }

      // If allowedRoles is specified, check if user has the required role
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          // User doesn't have the required role, redirect to login or show error
          router.push('/login');
          return;
        }
      }
    }
  }, [user, isLoading, allowedRoles, router, checkAuth]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or doesn't have required role, don't render children
  if (!user) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  // User is authenticated and has required role
  return <>{children}</>;
}
