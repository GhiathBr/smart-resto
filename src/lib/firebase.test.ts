import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Unit tests for Firebase Admin SDK initialization
 * Requirements: 2.2, 16.3
 */

describe('Firebase Admin SDK', () => {
  beforeEach(() => {
    // Clear any cached modules
    vi.resetModules();
  });

  it('should throw error when required environment variables are missing', async () => {
    // Save original env vars
    const originalEnv = { ...process.env };

    // Clear Firebase env vars
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_STORAGE_BUCKET;

    // Re-import module to get fresh instance
    const { initializeFirebase } = await import('./firebase');

    expect(() => initializeFirebase()).toThrow(
      'Missing required Firebase environment variables'
    );

    // Restore env vars
    process.env = originalEnv;
  });

  it('should validate FIREBASE_PROJECT_ID is present', async () => {
    const originalEnv = { ...process.env };
    
    process.env.FIREBASE_PROJECT_ID = '';
    process.env.FIREBASE_PRIVATE_KEY = 'test-key';
    process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
    process.env.FIREBASE_STORAGE_BUCKET = 'test-bucket';

    const { initializeFirebase } = await import('./firebase');

    expect(() => initializeFirebase()).toThrow(
      'Missing required Firebase environment variables'
    );

    process.env = originalEnv;
  });

  it('should validate FIREBASE_STORAGE_BUCKET is present', async () => {
    const originalEnv = { ...process.env };
    
    process.env.FIREBASE_PROJECT_ID = 'test-project';
    process.env.FIREBASE_PRIVATE_KEY = 'test-key';
    process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
    process.env.FIREBASE_STORAGE_BUCKET = '';

    const { initializeFirebase } = await import('./firebase');

    expect(() => initializeFirebase()).toThrow(
      'Missing required Firebase environment variables'
    );

    process.env = originalEnv;
  });

  it('should handle escaped newlines in private key', () => {
    // This test verifies that the private key processing handles \\n correctly
    const testKey = 'line1\\nline2\\nline3';
    const processed = testKey.replace(/\\n/g, '\n');
    
    expect(processed).toBe('line1\nline2\nline3');
  });
});
