import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import * as storageService from '@/services/storage.service';
import * as authMiddleware from '@/middleware/auth.middleware';
import { UserRole } from '@/types/auth.types';

/**
 * Unit tests for Image Upload API Endpoint
 * Requirements: 2.2, 16.1, 16.2, 16.5
 */

// Mock dependencies
vi.mock('@/services/storage.service');
vi.mock('@/middleware/auth.middleware');

describe('POST /api/upload/image', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication', async () => {
      // Mock authentication failure
      vi.mocked(authMiddleware.authenticateAndAuthorize).mockReturnValue(
        new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
        }) as any
      );

      const formData = new FormData();
      formData.append('image', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));

      const request = new NextRequest('http://localhost:3000/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should require ADMIN role', async () => {
      // Mock authorization failure (user is not ADMIN)
      vi.mocked(authMiddleware.authenticateAndAuthorize).mockReturnValue(
        new Response(
          JSON.stringify({
            error: 'Access denied. Insufficient permissions.',
            requiredRoles: [UserRole.ADMIN],
            userRole: UserRole.STAFF,
          }),
          { status: 403 }
        ) as any
      );

      const formData = new FormData();
      formData.append('image', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));

      const request = new NextRequest('http://localhost:3000/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Access denied');
    });

    it('should call authenticateAndAuthorize with ADMIN role', async () => {
      // Mock successful authentication
      vi.mocked(authMiddleware.authenticateAndAuthorize).mockReturnValue(null);
      
      // Mock successful upload
      vi.mocked(storageService.uploadImage).mockResolvedValue({
        url: 'https://storage.googleapis.com/test-bucket/test.jpg',
        filename: 'test.jpg',
      });

      const formData = new FormData();
      formData.append('image', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));

      const request = new NextRequest('http://localhost:3000/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(authMiddleware.authenticateAndAuthorize).toHaveBeenCalledWith(
        expect.anything(),
        [UserRole.ADMIN]
      );
    });
  });

  describe('File Upload Validation', () => {
    beforeEach(() => {
      // Mock successful authentication for these tests
      vi.mocked(authMiddleware.authenticateAndAuthorize).mockReturnValue(null);
    });

    it('should return error when no file is provided', async () => {
      const formData = new FormData();
      // No file added to formData

      const request = new NextRequest('http://localhost:3000/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('No image file provided');
    });

    it('should return error when image field is empty', async () => {
      const formData = new FormData();
      formData.append('image', ''); // Empty string instead of file

      const request = new NextRequest('http://localhost:3000/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('Successful Upload (Requirement 2.2, 16.5)', () => {
    beforeEach(() => {
      // Mock successful authentication
      vi.mocked(authMiddleware.authenticateAndAuthorize).mockReturnValue(null);
    });

    it('should upload image and return URL on success', async () => {
      const mockResult = {
        url: 'https://storage.googleapis.com/test-bucket/123456-test.jpg',
        filename: '123456-test.jpg',
      };

      vi.mocked(storageService.uploadImage).mockResolvedValue(mockResult);

      const formData = new FormData();
      const testFile = new File(['test image data'], 'test.jpg', {
        type: 'image/jpeg',
      });
      formData.append('image', testFile);

      const request = new NextRequest('http://localhost:3000/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.url).toBe(mockResult.url);
      expect(data.filename).toBe(mockResult.filename);
    });

    it('should call uploadImage with correct parameters', async () => {
      vi.mocked(storageService.uploadImage).mockResolvedValue({
        url: 'https://storage.googleapis.com/test-bucket/test.jpg',
        filename: 'test.jpg',
      });

      const formData = new FormData();
      const testFile = new File(['test image data'], 'test.jpg', {
        type: 'image/jpeg',
      });
      formData.append('image', testFile);

      const request = new NextRequest('http://localhost:3000/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(storageService.uploadImage).toHaveBeenCalledWith(
        expect.any(Buffer),
        'test.jpg',
        'image/jpeg'
      );
    });

    it('should handle different image formats', async () => {
      vi.mocked(storageService.uploadImage).mockResolvedValue({
        url: 'https://storage.googleapis.com/test-bucket/test.png',
        filename: 'test.png',
      });

      const imageFormats = [
        { name: 'test.jpg', type: 'image/jpeg' },
        { name: 'test.png', type: 'image/png' },
        { name: 'test.gif', type: 'image/gif' },
        { name: 'test.webp', type: 'image/webp' },
      ];

      for (const format of imageFormats) {
        const formData = new FormData();
        const testFile = new File(['test'], format.name, { type: format.type });
        formData.append('image', testFile);

        const request = new NextRequest('http://localhost:3000/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        const response = await POST(request);
        expect(response.status).toBe(201);
      }
    });
  });

  describe('Error Handling (Requirement 16.1, 16.2)', () => {
    beforeEach(() => {
      // Mock successful authentication
      vi.mocked(authMiddleware.authenticateAndAuthorize).mockReturnValue(null);
    });

    it('should return error for invalid file type', async () => {
      vi.mocked(storageService.uploadImage).mockRejectedValue(
        new Error('Invalid file type. Only image formats are allowed')
      );

      const formData = new FormData();
      const testFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });
      formData.append('image', testFile);

      const request = new NextRequest('http://localhost:3000/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid file type');
    });

    it('should return error for file size exceeding limit', async () => {
      vi.mocked(storageService.uploadImage).mockRejectedValue(
        new Error('File size exceeds maximum limit of 5MB')
      );

      const formData = new FormData();
      // Create a large file (simulated)
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });
      formData.append('image', largeFile);

      const request = new NextRequest('http://localhost:3000/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('File size exceeds');
    });

    it('should handle storage service errors gracefully', async () => {
      vi.mocked(storageService.uploadImage).mockRejectedValue(
        new Error('Failed to upload image. Please try again.')
      );

      const formData = new FormData();
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('image', testFile);

      const request = new NextRequest('http://localhost:3000/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle unexpected errors', async () => {
      vi.mocked(storageService.uploadImage).mockRejectedValue(
        'Unexpected error' // Non-Error object
      );

      const formData = new FormData();
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('image', testFile);

      const request = new NextRequest('http://localhost:3000/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to upload image');
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      // Mock successful authentication
      vi.mocked(authMiddleware.authenticateAndAuthorize).mockReturnValue(null);
    });

    it('should return correct response structure on success', async () => {
      vi.mocked(storageService.uploadImage).mockResolvedValue({
        url: 'https://storage.googleapis.com/test-bucket/test.jpg',
        filename: 'test.jpg',
      });

      const formData = new FormData();
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('image', testFile);

      const request = new NextRequest('http://localhost:3000/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('url');
      expect(data).toHaveProperty('filename');
      expect(data.success).toBe(true);
      expect(typeof data.url).toBe('string');
      expect(typeof data.filename).toBe('string');
    });

    it('should return correct response structure on error', async () => {
      vi.mocked(storageService.uploadImage).mockRejectedValue(
        new Error('Test error')
      );

      const formData = new FormData();
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('image', testFile);

      const request = new NextRequest('http://localhost:3000/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
      expect(data.error.length).toBeGreaterThan(0);
    });
  });
});
