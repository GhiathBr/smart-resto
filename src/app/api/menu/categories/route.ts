import { NextRequest, NextResponse } from 'next/server';
import { createCategory } from '@/controllers/menu.controller';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/menu/categories
 * Get all categories (public)
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/menu/categories
 * Create a new category (ADMIN only)
 */
export async function POST(request: NextRequest) {
  return createCategory(request as AuthenticatedRequest);
}
