import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/services/storage.service';
import {
  AuthenticatedRequest,
  authenticateAndAuthorize,
} from '@/middleware/auth.middleware';
import { UserRole } from '@/types/auth.types';

/**
 * POST /api/upload/image
 * Upload an image file to Firebase Storage (ADMIN only)
 * Requirements: 2.2, 16.1, 16.2, 16.5
 */
export async function POST(request: NextRequest) {
  const authRequest = request as AuthenticatedRequest;

  // Authenticate and authorize (ADMIN only)
  const authError = authenticateAndAuthorize(authRequest, [UserRole.ADMIN]);
  if (authError) {
    return authError;
  }

  try {
    // Parse multipart/form-data
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    // Validate that a file was provided
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided. Please upload an image.' },
        { status: 400 }
      );
    }

    // Validate that the uploaded item is actually a file
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Invalid file format' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get file metadata
    const filename = file.name;
    const contentType = file.type;

    // Upload image using storage service (handles validation)
    const result = await uploadImage(buffer, filename, contentType);

    // Return success response with image URL
    return NextResponse.json(
      {
        success: true,
        url: result.url,
        filename: result.filename,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle validation and upload errors
    if (error instanceof Error) {
      // Return specific error messages from storage service
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Generic error for unexpected issues
    console.error('Unexpected error in image upload:', error);
    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 }
    );
  }
}
