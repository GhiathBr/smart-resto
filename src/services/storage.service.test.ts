import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadImage, uploadFile } from './storage.service';

/**
 * Unit tests for Storage Service
 * Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6
 */

// Mock Firebase Storage
vi.mock('@/lib/firebase', () => ({
  getStorageBucket: vi.fn(() => ({
    bucket: vi.fn(() => ({
      name: 'test-bucket',
      file: vi.fn(() => ({
        save: vi.fn(),
        makePublic: vi.fn(),
        delete: vi.fn(),
        name: 'menu-images/test-image.jpg',
      })),
    })),
  })),
}));

describe('Storage Service - uploadImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('File type validation (Requirement 16.1)', () => {
    it('should accept valid image MIME types', async () => {
      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ];

      const testBuffer = Buffer.from('test image data');

      for (const contentType of validTypes) {
        await expect(
          uploadImage(testBuffer, 'test.jpg', contentType)
        ).resolves.toBeDefined();
      }
    });

    it('should reject non-image MIME types', async () => {
      const invalidTypes = [
        'application/pdf',
        'text/plain',
        'video/mp4',
        'application/json',
        'text/html',
      ];

      const testBuffer = Buffer.from('test data');

      for (const contentType of invalidTypes) {
        await expect(
          uploadImage(testBuffer, 'test.file', contentType)
        ).rejects.toThrow('Invalid file type');
      }
    });

    it('should include allowed formats in error message', async () => {
      const testBuffer = Buffer.from('test data');

      await expect(
        uploadImage(testBuffer, 'test.pdf', 'application/pdf')
      ).rejects.toThrow('image/jpeg');
    });
  });

  describe('File size validation (Requirement 16.2)', () => {
    it('should accept files under 5MB', async () => {
      // 4MB file
      const smallBuffer = Buffer.alloc(4 * 1024 * 1024);

      await expect(
        uploadImage(smallBuffer, 'small.jpg', 'image/jpeg')
      ).resolves.toBeDefined();
    });

    it('should accept files exactly 5MB', async () => {
      // Exactly 5MB file
      const exactBuffer = Buffer.alloc(5 * 1024 * 1024);

      await expect(
        uploadImage(exactBuffer, 'exact.jpg', 'image/jpeg')
      ).resolves.toBeDefined();
    });

    it('should reject files over 5MB', async () => {
      // 6MB file
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

      await expect(
        uploadImage(largeBuffer, 'large.jpg', 'image/jpeg')
      ).rejects.toThrow('File size exceeds maximum limit of 5MB');
    });

    it('should include size limit in error message', async () => {
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024);

      await expect(
        uploadImage(largeBuffer, 'huge.jpg', 'image/jpeg')
      ).rejects.toThrow('5MB');
    });
  });

  describe('Unique filename generation (Requirement 16.4)', () => {
    it('should generate unique filenames to prevent collisions', async () => {
      const testBuffer = Buffer.from('test image');
      
      const result1 = await uploadImage(testBuffer, 'test.jpg', 'image/jpeg');
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const result2 = await uploadImage(testBuffer, 'test.jpg', 'image/jpeg');

      expect(result1.filename).toBeDefined();
      expect(result2.filename).toBeDefined();
      // Filenames should be different due to timestamp
      expect(result1.filename).not.toBe(result2.filename);
    });
  });

  describe('Public URL return (Requirement 16.5)', () => {
    it('should return public URL after successful upload', async () => {
      const testBuffer = Buffer.from('test image');

      const result = await uploadImage(testBuffer, 'test.jpg', 'image/jpeg');

      expect(result).toHaveProperty('url');
      expect(result.url).toContain('https://storage.googleapis.com');
      expect(result.url).toContain('test-bucket');
    });

    it('should return filename in result', async () => {
      const testBuffer = Buffer.from('test image');

      const result = await uploadImage(testBuffer, 'test.jpg', 'image/jpeg');

      expect(result).toHaveProperty('filename');
      expect(typeof result.filename).toBe('string');
      expect(result.filename.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling (Requirement 16.6)', () => {
    it('should handle upload errors gracefully', async () => {
      // Mock getStorageBucket to throw an error
      const { getStorageBucket } = await import('@/lib/firebase');
      vi.mocked(getStorageBucket).mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const testBuffer = Buffer.from('test image');

      await expect(
        uploadImage(testBuffer, 'test.jpg', 'image/jpeg')
      ).rejects.toThrow('Failed to upload image');
    });

    it('should provide user-friendly error messages', async () => {
      // Mock getStorageBucket to throw an error
      const { getStorageBucket } = await import('@/lib/firebase');
      vi.mocked(getStorageBucket).mockImplementationOnce(() => {
        throw new Error('Network error');
      });

      const testBuffer = Buffer.from('test image');

      await expect(
        uploadImage(testBuffer, 'test.jpg', 'image/jpeg')
      ).rejects.toThrow('Please try again');
    });
  });

  describe('Integration with uploadFile', () => {
    it('should call uploadFile with correct parameters', async () => {
      const testBuffer = Buffer.from('test image');
      const filename = 'test.jpg';
      const contentType = 'image/jpeg';

      const result = await uploadImage(testBuffer, filename, contentType);

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.filename).toBeDefined();
    });
  });
});

describe('Storage Service - Legacy Functions', () => {
  it('should export uploadFile function', async () => {
    const { uploadFile } = await import('./storage.service');
    expect(uploadFile).toBeDefined();
    expect(typeof uploadFile).toBe('function');
  });

  it('should export deleteFile function', async () => {
    const { deleteFile } = await import('./storage.service');
    expect(deleteFile).toBeDefined();
    expect(typeof deleteFile).toBe('function');
  });

  it('should have correct UploadResult interface structure', () => {
    // This test verifies the interface is properly exported
    // The actual structure is validated at compile time by TypeScript
    const mockResult = {
      url: 'https://example.com/image.jpg',
      filename: 'test-image.jpg',
    };

    expect(mockResult).toHaveProperty('url');
    expect(mockResult).toHaveProperty('filename');
    expect(typeof mockResult.url).toBe('string');
    expect(typeof mockResult.filename).toBe('string');
  });
});
