import { NextRequest } from 'next/server';
import {
  createMenuItem,
  getMenuItems,
} from '@/controllers/menu.controller';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';

/**
 * POST /api/menu/items
 * Create a new menu item (ADMIN only)
 */
export async function POST(request: NextRequest) {
  return createMenuItem(request as AuthenticatedRequest);
}

/**
 * GET /api/menu/items
 * Get all menu items with optional filtering (public)
 */
export async function GET(request: NextRequest) {
  return getMenuItems(request);
}
