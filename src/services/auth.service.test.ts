import { describe, it, expect, beforeAll } from 'vitest';
import {
  hashPassword,
  comparePassword,
  generateJWT,
  verifyJWT,
} from './auth.service';
import { UserRole } from '@/types/auth.types';

describe('Authentication Service', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);
      const result = await comparePassword(password, hashed);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hashed = await hashPassword(password);
      const result = await comparePassword(wrongPassword, hashed);

      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);
      const result = await comparePassword('', hashed);

      expect(result).toBe(false);
    });
  });

  describe('generateJWT', () => {
    it('should generate a valid JWT token', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const role = UserRole.ADMIN;

      const token = generateJWT(userId, email, role);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should generate different tokens for different users', () => {
      const token1 = generateJWT('user-1', 'user1@example.com', UserRole.ADMIN);
      const token2 = generateJWT('user-2', 'user2@example.com', UserRole.STAFF);

      expect(token1).not.toBe(token2);
    });

    it('should include role in token payload', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const role = UserRole.STAFF;

      const token = generateJWT(userId, email, role);
      const decoded = verifyJWT(token);

      expect(decoded.role).toBe(role);
    });
  });

  describe('verifyJWT', () => {
    it('should verify and decode a valid token', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const role = UserRole.ADMIN;

      const token = generateJWT(userId, email, role);
      const decoded = verifyJWT(token);

      expect(decoded.userId).toBe(userId);
      expect(decoded.email).toBe(email);
      expect(decoded.role).toBe(role);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyJWT(invalidToken)).toThrow('Invalid token');
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';

      expect(() => verifyJWT(malformedToken)).toThrow();
    });

    it('should throw error for empty token', () => {
      expect(() => verifyJWT('')).toThrow();
    });
  });

  describe('Integration: hash and compare workflow', () => {
    it('should successfully hash and verify password', async () => {
      const password = 'securePassword123!';
      
      // Hash the password
      const hashed = await hashPassword(password);
      
      // Verify correct password
      const isValid = await comparePassword(password, hashed);
      expect(isValid).toBe(true);
      
      // Verify incorrect password
      const isInvalid = await comparePassword('wrongPassword', hashed);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Integration: JWT generation and verification workflow', () => {
    it('should successfully generate and verify JWT', () => {
      const userId = 'user-456';
      const email = 'staff@restaurant.com';
      const role = UserRole.STAFF;
      
      // Generate token
      const token = generateJWT(userId, email, role);
      
      // Verify token
      const decoded = verifyJWT(token);
      
      expect(decoded.userId).toBe(userId);
      expect(decoded.email).toBe(email);
      expect(decoded.role).toBe(role);
    });
  });
});
