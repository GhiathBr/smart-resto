import { getStorageBucket } from '@/lib/firebase';

/**
 * Storage Service
 * Handles file uploads to Firebase Storage
 * Requirements: 2.2, 16.3
 */

export interface UploadResult {
  url: string;
  filename: string;
}

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

// Maximum file size: 5MB in bytes
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Upload an image to Firebase Storage with validation
 * Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6
 * @param file - File buffer to upload
 * @param filename - Original filename
 * @param contentType - MIME type of the file
 * @returns Public URL and filename of the uploaded image
 * @throws Error if file type is invalid, file size exceeds limit, or upload fails
 */
export async function uploadImage(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  // Requirement 16.1: Validate file type is an image format
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    throw new Error(
      `Invalid file type. Only image formats are allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    );
  }

  // Requirement 16.2: Validate file size does not exceed 5MB
  if (file.length > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    );
  }

  // Requirements 16.3, 16.4, 16.5: Upload with unique filename and return public URL
  try {
    return await uploadFile(file, filename, contentType);
  } catch (error) {
    // Requirement 16.6: Handle upload errors gracefully
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}

/**
 * Upload a file to Firebase Storage
 * @param file - File buffer to upload
 * @param filename - Original filename
 * @param contentType - MIME type of the file
 * @returns Public URL of the uploaded file
 */
export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  try {
    const bucket = getStorageBucket().bucket();
    
    // Generate unique filename to prevent collisions
    const uniqueFilename = `${Date.now()}-${filename}`;
    const fileRef = bucket.file(`menu-images/${uniqueFilename}`);

    // Upload file to Firebase Storage
    await fileRef.save(file, {
      metadata: {
        contentType,
      },
      public: true, // Make file publicly accessible
    });

    // Make the file public and get the URL
    await fileRef.makePublic();
    
    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;

    return {
      url: publicUrl,
      filename: uniqueFilename,
    };
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw new Error('Failed to upload file to storage');
  }
}

/**
 * Delete a file from Firebase Storage
 * @param filename - Name of the file to delete
 */
export async function deleteFile(filename: string): Promise<void> {
  try {
    const bucket = getStorageBucket().bucket();
    const fileRef = bucket.file(`menu-images/${filename}`);
    
    await fileRef.delete();
  } catch (error) {
    console.error('Error deleting file from Firebase Storage:', error);
    throw new Error('Failed to delete file from storage');
  }
}
