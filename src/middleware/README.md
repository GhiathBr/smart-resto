# Authentication Middleware

This directory contains authentication and authorization middleware for protecting API routes.

## Usage

### Basic Authentication

To protect an API route with authentication only:

```typescript
import { NextRequest } from 'next/server';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth.middleware';

export async function GET(request: NextRequest) {
  const authRequest = request as AuthenticatedRequest;
  
  // Authenticate the request
  const authError = authenticateToken(authRequest);
  if (authError) {
    return authError;
  }

  // Access authenticated user information
  const user = authRequest.user;
  
  return Response.json({ 
    message: 'Protected data',
    user: user 
  });
}
```

### Role-Based Authorization

To protect an API route with role-based access control:

```typescript
import { NextRequest } from 'next/server';
import { authenticateAndAuthorize, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { UserRole } from '@/types/auth.types';

export async function POST(request: NextRequest) {
  const authRequest = request as AuthenticatedRequest;
  
  // Authenticate and authorize (ADMIN only)
  const authError = authenticateAndAuthorize(authRequest, [UserRole.ADMIN]);
  if (authError) {
    return authError;
  }

  // Only ADMIN users reach this point
  const user = authRequest.user;
  
  return Response.json({ 
    message: 'Admin-only action completed',
    user: user 
  });
}
```

### Multiple Roles

To allow multiple roles to access an endpoint:

```typescript
import { NextRequest } from 'next/server';
import { authenticateAndAuthorize, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { UserRole } from '@/types/auth.types';

export async function PATCH(request: NextRequest) {
  const authRequest = request as AuthenticatedRequest;
  
  // Allow both ADMIN and STAFF roles
  const authError = authenticateAndAuthorize(authRequest, [UserRole.ADMIN, UserRole.STAFF]);
  if (authError) {
    return authError;
  }

  // Both ADMIN and STAFF users can access this
  const user = authRequest.user;
  
  return Response.json({ 
    message: 'Staff action completed',
    user: user 
  });
}
```

## Middleware Functions

### `authenticateToken(request: AuthenticatedRequest)`

Verifies the JWT token from the Authorization header and attaches user information to the request.

**Returns:**
- `null` if authentication succeeds
- `NextResponse` with 401 error if authentication fails

**Error Cases:**
- Missing Authorization header
- Invalid header format (must be "Bearer <token>")
- Expired token
- Invalid token

### `authorizeRole(request: AuthenticatedRequest, allowedRoles: UserRole[])`

Checks if the authenticated user has one of the allowed roles.

**Parameters:**
- `request`: The authenticated request (must have `user` property set)
- `allowedRoles`: Array of roles that are allowed to access the resource

**Returns:**
- `null` if authorization succeeds
- `NextResponse` with 401 error if user information is missing
- `NextResponse` with 403 error if user doesn't have required role

### `authenticateAndAuthorize(request: AuthenticatedRequest, allowedRoles: UserRole[])`

Combines authentication and authorization in a single function call.

**Parameters:**
- `request`: The Next.js request object
- `allowedRoles`: Array of roles that are allowed to access the resource

**Returns:**
- `null` if both authentication and authorization succeed
- `NextResponse` with appropriate error if either fails

## Token Format

The middleware expects tokens in the Authorization header with the following format:

```
Authorization: Bearer <jwt-token>
```

## User Information

After successful authentication, the user information is available in `request.user`:

```typescript
{
  userId: string;
  email: string;
  role: UserRole; // ADMIN or STAFF
}
```

## Error Responses

### 401 Unauthorized

Returned when:
- Authorization header is missing
- Token format is invalid
- Token has expired
- Token is invalid

### 403 Forbidden

Returned when:
- User is authenticated but doesn't have the required role
