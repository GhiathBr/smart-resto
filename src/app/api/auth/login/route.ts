import { NextRequest } from 'next/server';
import { login } from '@/controllers/auth.controller';

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
export async function POST(request: NextRequest) {
  return login(request);
}
