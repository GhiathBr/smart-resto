import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { login } from './auth.controller';
import { prisma } from '@/tests/setup';
import { hashPassword } from '@/services/auth.service';
import { UserRole } from '@/types/auth.types';

describe('Authentication Controller', () => {
  const testUser = {
    email: 'test@restaurant.com',
    password: 'testPassword123',
    role: 'STAFF' as const,
  };

  let userId: string;

  beforeAll(async () => {
    // Create a test user
    const hashedPassword = await hashPassword(testUser.password);
    const user = await prisma.user.create({
      data: {
        email: testUser.email,
        passwordHash: hashedPassword,
        role: testUser.role,
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return JWT token for valid credentials', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      const response = await login(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.token).toBeDefined();
      expect(typeof data.token).toBe('string');
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(userId);
      expect(data.user.email).toBe(testUser.email);
      expect(data.user.role).toBe(testUser.role);
    });

    it('should return 401 for invalid email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@restaurant.com',
          password: testUser.password,
        }),
      });

      const response = await login(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid credentials');
      expect(data.token).toBeUndefined();
    });

    it('should return 401 for invalid password', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testUser.email,
          password: 'wrongPassword',
        }),
      });

      const response = await login(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid credentials');
      expect(data.token).toBeUndefined();
    });

    it('should return 400 for missing email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          password: testUser.password,
        }),
      });

      const response = await login(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });

    it('should return 400 for missing password', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testUser.email,
        }),
      });

      const response = await login(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });

    it('should return 400 for empty email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: '',
          password: testUser.password,
        }),
      });

      const response = await login(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });

    it('should return 400 for empty password', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testUser.email,
          password: '',
        }),
      });

      const response = await login(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });
  });

  describe('Integration: Login with different user roles', () => {
    const adminUser = {
      email: 'admin@restaurant.com',
      password: 'adminPassword123',
      role: 'ADMIN' as const,
    };

    let adminUserId: string;

    beforeAll(async () => {
      // Create an admin user
      const hashedPassword = await hashPassword(adminUser.password);
      const user = await prisma.user.create({
        data: {
          email: adminUser.email,
          passwordHash: hashedPassword,
          role: adminUser.role,
        },
      });
      adminUserId = user.id;
    });

    afterAll(async () => {
      // Clean up admin user
      await prisma.user.deleteMany({
        where: { email: adminUser.email },
      });
    });

    it('should return JWT token with ADMIN role for admin user', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: adminUser.email,
          password: adminUser.password,
        }),
      });

      const response = await login(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.token).toBeDefined();
      expect(data.user.role).toBe('ADMIN');
    });

    it('should return JWT token with STAFF role for staff user', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      const response = await login(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.token).toBeDefined();
      expect(data.user.role).toBe('STAFF');
    });
  });
});
