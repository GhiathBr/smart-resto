import { NextRequest } from 'next/server';
import { createCategory } from '@/controllers/menu.controller';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';

/**
 * POST /api/menu/categories
 * Create a new category (ADMIN only)
 */
export async function POST(request: NextRequest) {
  return createCategory(request as AuthenticatedRequest);
}
