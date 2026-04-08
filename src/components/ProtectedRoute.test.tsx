import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/auth.types';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Helper to create a mock JWT token
function createMockToken(payload: any): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
}

describe('ProtectedRoute', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as any);
  });

  it('should show loading state initially', () => {
    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', async () => {
    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when authenticated', async () => {
    const mockUser = {
      userId: '1',
      email: 'admin@restaurant.com',
      role: UserRole.ADMIN,
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const mockToken = createMockToken(mockUser);

    localStorage.setItem('auth_token', mockToken);

    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should render children when user has allowed role', async () => {
    const mockUser = {
      userId: '1',
      email: 'admin@restaurant.com',
      role: UserRole.ADMIN,
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const mockToken = createMockToken(mockUser);

    localStorage.setItem('auth_token', mockToken);

    render(
      <AuthProvider>
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should redirect when user does not have allowed role', async () => {
    const mockUser = {
      userId: '2',
      email: 'staff@restaurant.com',
      role: UserRole.STAFF,
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const mockToken = createMockToken(mockUser);

    localStorage.setItem('auth_token', mockToken);

    render(
      <AuthProvider>
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <div>Admin Only Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
  });

  it('should allow multiple roles', async () => {
    const mockUser = {
      userId: '2',
      email: 'staff@restaurant.com',
      role: UserRole.STAFF,
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const mockToken = createMockToken(mockUser);

    localStorage.setItem('auth_token', mockToken);

    render(
      <AuthProvider>
        <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
          <div>Staff and Admin Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Staff and Admin Content')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should redirect when token is expired', async () => {
    const mockUser = {
      userId: '1',
      email: 'admin@restaurant.com',
      role: UserRole.ADMIN,
      exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    };
    const mockToken = createMockToken(mockUser);
    localStorage.setItem('auth_token', mockToken);

    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
