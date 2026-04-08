import { NextRequest, NextResponse } from 'next/server';
import {
  createMenuItem as createMenuItemService,
  updateMenuItem as updateMenuItemService,
  deleteMenuItem as deleteMenuItemService,
  getMenuItems as getMenuItemsService,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
} from '@/services/menu.service';
import {
  CreateMenuItemInput,
  UpdateMenuItemInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types/menu.types';
import { authenticateAndAuthorize, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { UserRole } from '@/types/auth.types';

/**
 * Create a new menu item (ADMIN only)
 * POST /api/menu/items
 */
export async function createMenuItem(request: AuthenticatedRequest): Promise<NextResponse> {
  // Authenticate and authorize (ADMIN only)
  const authError = authenticateAndAuthorize(request, [UserRole.ADMIN]);
  if (authError) {
    return authError;
  }

  try {
    const body: CreateMenuItemInput = await request.json();

    const menuItem = await createMenuItemService(body);

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('Create menu item error:', error);
    
    if (error instanceof Error) {
      // Return validation errors with 400 status
      if (
        error.message.includes('required') ||
        error.message.includes('empty') ||
        error.message.includes('positive') ||
        error.message.includes('valid number')
      ) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      // Return not found errors with 404 status
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An error occurred while creating menu item' },
      { status: 500 }
    );
  }
}

/**
 * Update an existing menu item (ADMIN only)
 * PUT /api/menu/items/:id
 */
export async function updateMenuItem(
  request: AuthenticatedRequest,
  id: string
): Promise<NextResponse> {
  // Authenticate and authorize (ADMIN only)
  const authError = authenticateAndAuthorize(request, [UserRole.ADMIN]);
  if (authError) {
    return authError;
  }

  try {
    const body: UpdateMenuItemInput = await request.json();

    const menuItem = await updateMenuItemService(id, body);

    return NextResponse.json(menuItem, { status: 200 });
  } catch (error) {
    console.error('Update menu item error:', error);
    
    if (error instanceof Error) {
      // Return validation errors with 400 status
      if (
        error.message.includes('required') ||
        error.message.includes('empty') ||
        error.message.includes('positive') ||
        error.message.includes('valid number')
      ) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      // Return not found errors with 404 status
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An error occurred while updating menu item' },
      { status: 500 }
    );
  }
}

/**
 * Delete a menu item (ADMIN only)
 * DELETE /api/menu/items/:id
 */
export async function deleteMenuItem(
  request: AuthenticatedRequest,
  id: string
): Promise<NextResponse> {
  // Authenticate and authorize (ADMIN only)
  const authError = authenticateAndAuthorize(request, [UserRole.ADMIN]);
  if (authError) {
    return authError;
  }

  try {
    await deleteMenuItemService(id);

    return NextResponse.json(
      { message: 'Menu item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete menu item error:', error);
    
    if (error instanceof Error) {
      // Return not found errors with 404 status
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An error occurred while deleting menu item' },
      { status: 500 }
    );
  }
}

/**
 * Get all menu items with optional filtering (public)
 * GET /api/menu/items
 */
export async function getMenuItems(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') || undefined;

    const menuItems = await getMenuItemsService({ categoryId });

    return NextResponse.json(menuItems, { status: 200 });
  } catch (error) {
    console.error('Get menu items error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while fetching menu items' },
      { status: 500 }
    );
  }
}

/**
 * Create a new category (ADMIN only)
 * POST /api/menu/categories
 */
export async function createCategory(request: AuthenticatedRequest): Promise<NextResponse> {
  // Authenticate and authorize (ADMIN only)
  const authError = authenticateAndAuthorize(request, [UserRole.ADMIN]);
  if (authError) {
    return authError;
  }

  try {
    const body: CreateCategoryInput = await request.json();

    const category = await createCategoryService(body);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    
    if (error instanceof Error) {
      // Return validation errors with 400 status
      if (
        error.message.includes('required') ||
        error.message.includes('empty') ||
        error.message.includes('already exists')
      ) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An error occurred while creating category' },
      { status: 500 }
    );
  }
}

/**
 * Update an existing category (ADMIN only)
 * PUT /api/menu/categories/:id
 */
export async function updateCategory(
  request: AuthenticatedRequest,
  id: string
): Promise<NextResponse> {
  // Authenticate and authorize (ADMIN only)
  const authError = authenticateAndAuthorize(request, [UserRole.ADMIN]);
  if (authError) {
    return authError;
  }

  try {
    const body: UpdateCategoryInput = await request.json();

    const category = await updateCategoryService(id, body);

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error('Update category error:', error);
    
    if (error instanceof Error) {
      // Return validation errors with 400 status
      if (
        error.message.includes('required') ||
        error.message.includes('empty') ||
        error.message.includes('already exists')
      ) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      // Return not found errors with 404 status
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An error occurred while updating category' },
      { status: 500 }
    );
  }
}

/**
 * Delete a category (ADMIN only)
 * DELETE /api/menu/categories/:id
 */
export async function deleteCategory(
  request: AuthenticatedRequest,
  id: string
): Promise<NextResponse> {
  // Authenticate and authorize (ADMIN only)
  const authError = authenticateAndAuthorize(request, [UserRole.ADMIN]);
  if (authError) {
    return authError;
  }

  try {
    await deleteCategoryService(id);

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete category error:', error);
    
    if (error instanceof Error) {
      // Return validation errors with 400 status
      if (error.message.includes('existing menu items')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      // Return not found errors with 404 status
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An error occurred while deleting category' },
      { status: 500 }
    );
  }
}
