import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { UserRole } from '@/types/auth.types';

// Helper to create a mock JWT token
function createMockToken(payload: any): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
}

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with no user when no token is stored', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('should load user from localStorage on mount if token is valid', async () => {
    const mockUser = {
      userId: '1',
      email: 'admin@restaurant.com',
      role: UserRole.ADMIN,
      exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
    };
    const mockToken = createMockToken(mockUser);

    localStorage.setItem('auth_token', mockToken);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toMatchObject({
      userId: '1',
      email: 'admin@restaurant.com',
      role: UserRole.ADMIN,
    });
    expect(result.current.token).toBe(mockToken);
  });

  it('should clear expired token from localStorage on mount', async () => {
    const mockUser = {
      userId: '1',
      email: 'admin@restaurant.com',
      role: UserRole.ADMIN,
      exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    };
    const mockToken = createMockToken(mockUser);
    localStorage.setItem('auth_token', mockToken);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('should clear invalid token from localStorage on mount', async () => {
    const mockToken = 'invalid-token';
    localStorage.setItem('auth_token', mockToken);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('should login with valid token', async () => {
    const mockUser = {
      userId: '2',
      email: 'staff@restaurant.com',
      role: UserRole.STAFF,
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const mockToken = createMockToken(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.login(mockToken);
    });

    expect(result.current.user).toMatchObject({
      userId: '2',
      email: 'staff@restaurant.com',
      role: UserRole.STAFF,
    });
    expect(result.current.token).toBe(mockToken);
    expect(localStorage.getItem('auth_token')).toBe(mockToken);
  });

  it('should throw error when login with invalid token', async () => {
    const mockToken = 'invalid-token';

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(() => {
      act(() => {
        result.current.login(mockToken);
      });
    }).toThrow('Invalid token');

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('should logout and clear token', async () => {
    const mockUser = {
      userId: '1',
      email: 'admin@restaurant.com',
      role: UserRole.ADMIN,
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const mockToken = createMockToken(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Login first
    act(() => {
      result.current.login(mockToken);
    });

    expect(result.current.user).toMatchObject({
      userId: '1',
      email: 'admin@restaurant.com',
      role: UserRole.ADMIN,
    });
    expect(localStorage.getItem('auth_token')).toBe(mockToken);

    // Then logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('should return true from checkAuth when token is valid', async () => {
    const mockUser = {
      userId: '1',
      email: 'admin@restaurant.com',
      role: UserRole.ADMIN,
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const mockToken = createMockToken(mockUser);

    localStorage.setItem('auth_token', mockToken);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let isAuthenticated: boolean = false;
    act(() => {
      isAuthenticated = result.current.checkAuth();
    });

    expect(isAuthenticated).toBe(true);
    expect(result.current.user).toMatchObject({
      userId: '1',
      email: 'admin@restaurant.com',
      role: UserRole.ADMIN,
    });
  });

  it('should return false from checkAuth when no token exists', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let isAuthenticated: boolean = true;
    act(() => {
      isAuthenticated = result.current.checkAuth();
    });

    expect(isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should return false from checkAuth when token is invalid', async () => {
    const mockToken = 'invalid-token';
    localStorage.setItem('auth_token', mockToken);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let isAuthenticated: boolean = true;
    act(() => {
      isAuthenticated = result.current.checkAuth();
    });

    expect(isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
