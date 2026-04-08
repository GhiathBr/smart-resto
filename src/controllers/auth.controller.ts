import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateJWT } from '@/services/auth.service';
import { LoginCredentials, AuthResponse } from '@/types/auth.types';
import { UserRole } from '@/types/auth.types';

/**
 * Handle user login
 * Validates credentials and returns JWT token on success
 * 
 * @param request - Next.js request object containing login credentials
 * @returns NextResponse with JWT token and user info or error
 */
export async function login(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: LoginCredentials = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateJWT(user.id, user.email, user.role as UserRole);

    // Prepare response
    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role as UserRole,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
