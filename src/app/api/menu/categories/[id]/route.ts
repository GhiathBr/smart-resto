import { NextRequest } from 'next/server';
import {
  updateCategory,
  deleteCategory,
} from '@/controllers/menu.controller';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';

/**
 * PUT /api/menu/categories/:id
 * Update an existing category (ADMIN only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return updateCategory(request as AuthenticatedRequest, params.id);
}

/**
 * DELETE /api/menu/categories/:id
 * Delete a category (ADMIN only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return deleteCategory(request as AuthenticatedRequest, params.id);
}
