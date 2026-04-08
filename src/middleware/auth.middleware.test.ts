import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  authenticateToken,
  authorizeRole,
  authenticateAndAuthorize,
  AuthenticatedRequest,
} from './auth.middleware';
import { UserRole } from '@/types/auth.types';
import * as authService from '@/services/auth.service';

// Mock the auth service
vi.mock('@/services/auth.service', () => ({
  verifyJWT: vi.fn(),
}));

describe('Authentication Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should return 401 error when Authorization header is missing', () => {
      const request = new NextRequest('http://localhost:3000/api/test') as AuthenticatedRequest;
      
      const response = authenticateToken(request);
      
      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
    });

    it('should return 401 error when Authorization header format is invalid', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'InvalidFormat token123',
        },
      }) as AuthenticatedRequest;
      
      const response = authenticateToken(request);
      
      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
    });

    it('should return 401 error when Authorization header is missing Bearer prefix', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'token123',
        },
      }) as AuthenticatedRequest;
      
      const response = authenticateToken(request);
      
      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
    });

    it('should return 401 error when token has expired', () => {
      vi.mocked(authService.verifyJWT).mockImplementation(() => {
        throw new Error('Token has expired');
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer expired-token',
        },
      }) as AuthenticatedRequest;
      
      const response = authenticateToken(request);
      
      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
    });

    it('should return 401 error when token is invalid', () => {
      vi.mocked(authService.verifyJWT).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      }) as AuthenticatedRequest;
      
      const response = authenticateToken(request);
      
      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
    });

    it('should return 401 error for unexpected verification errors', () => {
      vi.mocked(authService.verifyJWT).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer some-token',
        },
      }) as AuthenticatedRequest;
      
      const response = authenticateToken(request);
      
      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
    });

    it('should successfully authenticate with valid token and attach user to request', () => {
      const mockPayload = {
        userId: 'user-123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      vi.mocked(authService.verifyJWT).mockReturnValue(mockPayload);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer valid-token',
        },
      }) as AuthenticatedRequest;
      
      const response = authenticateToken(request);
      
      expect(response).toBeNull();
      expect(request.user).toEqual(mockPayload);
      expect(authService.verifyJWT).toHaveBeenCalledWith('valid-token');
    });
  });

  describe('authorizeRole', () => {
    it('should return 401 error when user information is not present', () => {
      const request = new NextRequest('http://localhost:3000/api/test') as AuthenticatedRequest;
      
      const response = authorizeRole(request, [UserRole.ADMIN]);
      
      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
    });

    it('should return 403 error when user role is not in allowed roles', () => {
      const request = new NextRequest('http://localhost:3000/api/test') as AuthenticatedRequest;
      request.user = {
        userId: 'user-123',
        email: 'staff@example.com',
        role: UserRole.STAFF,
      };
      
      const response = authorizeRole(request, [UserRole.ADMIN]);
      
      expect(response).not.toBeNull();
      expect(response?.status).toBe(403);
    });

    it('should successfully authorize when user has ADMIN role and ADMIN is allowed', () => {
      const request = new NextRequest('http://localhost:3000/api/test') as AuthenticatedRequest;
      request.user = {
        userId: 'user-123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };
      
      const response = authorizeRole(request, [UserRole.ADMIN]);
      
      expect(response).toBeNull();
    });

    it('should successfully authorize when user has STAFF role and STAFF is allowed', () => {
      const request = new NextRequest('http://localhost:3000/api/test') as AuthenticatedRequest;
      request.user = {
        userId: 'user-123',
        email: 'staff@example.com',
        role: UserRole.STAFF,
      };
      
      const response = authorizeRole(request, [UserRole.STAFF]);
      
      expect(response).toBeNull();
    });

    it('should successfully authorize when user has ADMIN role and both ADMIN and STAFF are allowed', () => {
      const request = new NextRequest('http://localhost:3000/api/test') as AuthenticatedRequest;
      request.user = {
        userId: 'user-123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };
      
      const response = authorizeRole(request, [UserRole.ADMIN, UserRole.STAFF]);
      
      expect(response).toBeNull();
    });

    it('should successfully authorize when user has STAFF role and both ADMIN and STAFF are allowed', () => {
      const request = new NextRequest('http://localhost:3000/api/test') as AuthenticatedRequest;
      request.user = {
        userId: 'user-123',
        email: 'staff@example.com',
        role: UserRole.STAFF,
      };
      
      const response = authorizeRole(request, [UserRole.ADMIN, UserRole.STAFF]);
      
      expect(response).toBeNull();
    });
  });

  describe('authenticateAndAuthorize', () => {
    it('should return 401 error when authentication fails', () => {
      const request = new NextRequest('http://localhost:3000/api/test') as AuthenticatedRequest;
      
      const response = authenticateAndAuthorize(request, [UserRole.ADMIN]);
      
      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
    });

    it('should return 403 error when authentication succeeds but authorization fails', () => {
      const mockPayload = {
        userId: 'user-123',
        email: 'staff@example.com',
        role: UserRole.STAFF,
      };

      vi.mocked(authService.verifyJWT).mockReturnValue(mockPayload);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer valid-token',
        },
      }) as AuthenticatedRequest;
      
      const response = authenticateAndAuthorize(request, [UserRole.ADMIN]);
      
      expect(response).not.toBeNull();
      expect(response?.status).toBe(403);
    });

    it('should successfully authenticate and authorize with valid token and role', () => {
      const mockPayload = {
        userId: 'user-123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      vi.mocked(authService.verifyJWT).mockReturnValue(mockPayload);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer valid-token',
        },
      }) as AuthenticatedRequest;
      
      const response = authenticateAndAuthorize(request, [UserRole.ADMIN]);
      
      expect(response).toBeNull();
      expect(request.user).toEqual(mockPayload);
    });

    it('should handle token expiration in combined flow', () => {
      vi.mocked(authService.verifyJWT).mockImplementation(() => {
        throw new Error('Token has expired');
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer expired-token',
        },
      }) as AuthenticatedRequest;
      
      const response = authenticateAndAuthorize(request, [UserRole.ADMIN]);
      
      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
    });
  });
});
