'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, JWTPayload } from '@/types/auth.types';

interface AuthContextType {
  user: JWTPayload | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Client-side JWT decode (without verification - verification happens on server)
function decodeJWT(token: string): JWTPayload {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = (): boolean => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return false;
    }

    try {
      const storedToken = localStorage.getItem('auth_token');
      
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return false;
      }

      // Decode the token (client-side, no verification)
      const decoded = decodeJWT(storedToken);
      
      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('auth_token');
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return false;
      }
      
      setUser(decoded);
      setToken(storedToken);
      setIsLoading(false);
      return true;
    } catch (error) {
      // Token is invalid
      console.error('Token validation failed:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return false;
    }
  };

  const login = (newToken: string) => {
    try {
      // Decode the token before storing
      const decoded = decodeJWT(newToken);
      
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      setUser(decoded);
    } catch (error) {
      console.error('Failed to login with provided token:', error);
      throw new Error('Invalid token');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        checkAuth,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
