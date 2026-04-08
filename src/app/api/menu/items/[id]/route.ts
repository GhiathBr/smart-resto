import { NextRequest } from 'next/server';
import {
  updateMenuItem,
  deleteMenuItem,
} from '@/controllers/menu.controller';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';

/**
 * PUT /api/menu/items/:id
 * Update an existing menu item (ADMIN only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return updateMenuItem(request as AuthenticatedRequest, params.id);
}

/**
 * DELETE /api/menu/items/:id
 * Delete a menu item (ADMIN only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return deleteMenuItem(request as AuthenticatedRequest, params.id);
}
