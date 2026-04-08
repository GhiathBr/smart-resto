import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/services/auth.service';
import { UserRole, JWTPayload } from '@/types/auth.types';

/**
 * Extended NextRequest with authenticated user information
 */
export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Authentication middleware to verify JWT tokens
 * Extracts token from Authorization header and verifies it
 * Attaches decoded user information to the request object
 * 
 * @param request - Next.js request object
 * @returns NextResponse with error or null if authentication succeeds
 */
export function authenticateToken(
  request: AuthenticatedRequest
): NextResponse | null {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Check if header follows "Bearer <token>" format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return NextResponse.json(
        { error: 'Authorization header must be in format: Bearer <token>' },
        { status: 401 }
      );
    }

    const token = parts[1];

    // Verify and decode the token
    const decoded = verifyJWT(token);
    
    // Attach user information to request
    request.user = decoded;

    // Authentication successful
    return null;
  } catch (error) {
    // Handle token verification errors
    if (error instanceof Error) {
      if (error.message === 'Token has expired') {
        return NextResponse.json(
          { error: 'Token has expired. Please log in again.' },
          { status: 401 }
        );
      }
      if (error.message === 'Invalid token') {
        return NextResponse.json(
          { error: 'Invalid token. Please log in again.' },
          { status: 401 }
        );
      }
    }

    // Generic error for unexpected issues
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

/**
 * Authorization middleware to check if user has required role
 * Must be called after authenticateToken middleware
 * 
 * @param request - Authenticated Next.js request object with user information
 * @param allowedRoles - Array of roles that are allowed to access the resource
 * @returns NextResponse with error or null if authorization succeeds
 */
export function authorizeRole(
  request: AuthenticatedRequest,
  allowedRoles: UserRole[]
): NextResponse | null {
  // Check if user information exists (should be set by authenticateToken)
  if (!request.user) {
    return NextResponse.json(
      { error: 'User information not found. Authentication required.' },
      { status: 401 }
    );
  }

  // Check if user's role is in the allowed roles list
  if (!allowedRoles.includes(request.user.role)) {
    return NextResponse.json(
      { 
        error: 'Access denied. Insufficient permissions.',
        requiredRoles: allowedRoles,
        userRole: request.user.role
      },
      { status: 403 }
    );
  }

  // Authorization successful
  return null;
}

/**
 * Helper function to combine authentication and authorization
 * Useful for protecting API routes with role-based access control
 * 
 * @param request - Next.js request object
 * @param allowedRoles - Array of roles that are allowed to access the resource
 * @returns NextResponse with error or null if both authentication and authorization succeed
 */
export function authenticateAndAuthorize(
  request: AuthenticatedRequest,
  allowedRoles: UserRole[]
): NextResponse | null {
  // First authenticate the token
  const authError = authenticateToken(request);
  if (authError) {
    return authError;
  }

  // Then authorize the role
  const authzError = authorizeRole(request, allowedRoles);
  if (authzError) {
    return authzError;
  }

  // Both authentication and authorization successful
  return null;
}
