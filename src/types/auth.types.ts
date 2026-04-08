/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

/**
 * JWT token payload structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * User authentication credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}
