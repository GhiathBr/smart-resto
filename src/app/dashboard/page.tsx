'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserRole } from '@/types/auth.types';

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Restaurant Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.email} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to the Dashboard
            </h2>
            <p className="text-gray-600 mb-4">
              You are logged in as: <span className="font-semibold">{user?.email}</span>
            </p>
            <p className="text-gray-600 mb-4">
              Your role: <span className="font-semibold">{user?.role}</span>
            </p>
            
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Available Features:
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                {user?.role === UserRole.ADMIN && (
                  <>
                    <li>Menu Management (Create, Update, Delete menu items)</li>
                    <li>Category Management</li>
                    <li>Analytics Dashboard</li>
                    <li>Order Management</li>
                  </>
                )}
                {(user?.role === UserRole.STAFF || user?.role === UserRole.ADMIN) && (
                  <>
                    <li>View Orders</li>
                    <li>Update Order Status</li>
                    <li>Real-time Order Notifications</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
