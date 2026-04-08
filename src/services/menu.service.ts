import { prisma } from '@/lib/prisma';
import {
  CreateMenuItemInput,
  UpdateMenuItemInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  MenuItemFilters,
  MenuItemResponse,
  CategoryResponse,
} from '@/types/menu.types';
import { Prisma } from '@prisma/client';

/**
 * Validate menu item input data
 * @param data - Menu item data to validate
 * @throws Error if validation fails
 */
function validateMenuItemInput(data: CreateMenuItemInput | UpdateMenuItemInput): void {
  if ('price' in data && data.price !== undefined) {
    if (typeof data.price !== 'number' || isNaN(data.price)) {
      throw new Error('Price must be a valid number');
    }
    if (data.price <= 0) {
      throw new Error('Price must be a positive number greater than zero');
    }
  }

  if ('name' in data && data.name !== undefined) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Name is required and cannot be empty');
    }
  }

  if ('description' in data && data.description !== undefined) {
    if (!data.description || data.description.trim() === '') {
      throw new Error('Description is required and cannot be empty');
    }
  }

  if ('categoryId' in data && data.categoryId !== undefined) {
    if (!data.categoryId || data.categoryId.trim() === '') {
      throw new Error('Category ID is required and cannot be empty');
    }
  }
}

/**
 * Convert Prisma MenuItem to MenuItemResponse
 */
function toMenuItemResponse(item: any): MenuItemResponse {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price instanceof Prisma.Decimal ? parseFloat(item.price.toString()) : item.price,
    categoryId: item.categoryId,
    imageUrl: item.imageUrl,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/**
 * Create a new menu item with validation
 * @param data - Menu item data
 * @returns Created menu item
 * @throws Error if validation fails or category doesn't exist
 */
export async function createMenuItem(data: CreateMenuItemInput): Promise<MenuItemResponse> {
  // Validate required fields
  if (!data.name || data.name.trim() === '') {
    throw new Error('Name is required and cannot be empty');
  }
  if (!data.description || data.description.trim() === '') {
    throw new Error('Description is required and cannot be empty');
  }
  if (!data.categoryId || data.categoryId.trim() === '') {
    throw new Error('Category ID is required and cannot be empty');
  }

  // Validate price
  validateMenuItemInput(data);

  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  // Create menu item
  const menuItem = await prisma.menuItem.create({
    data: {
      name: data.name.trim(),
      description: data.description.trim(),
      price: new Prisma.Decimal(data.price),
      categoryId: data.categoryId,
      imageUrl: data.imageUrl || null,
    },
  });

  return toMenuItemResponse(menuItem);
}

/**
 * Update an existing menu item with validation
 * @param id - Menu item ID
 * @param data - Updated menu item data
 * @returns Updated menu item
 * @throws Error if validation fails or menu item doesn't exist
 */
export async function updateMenuItem(
  id: string,
  data: UpdateMenuItemInput
): Promise<MenuItemResponse> {
  // Validate input
  validateMenuItemInput(data);

  // Check if menu item exists
  const existingItem = await prisma.menuItem.findUnique({
    where: { id },
  });

  if (!existingItem) {
    throw new Error('Menu item not found');
  }

  // If categoryId is being updated, check if new category exists
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new Error('Category not found');
    }
  }

  // Prepare update data
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.description !== undefined) updateData.description = data.description.trim();
  if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

  // Update menu item
  const menuItem = await prisma.menuItem.update({
    where: { id },
    data: updateData,
  });

  return toMenuItemResponse(menuItem);
}

/**
 * Delete a menu item
 * @param id - Menu item ID
 * @throws Error if menu item doesn't exist
 */
export async function deleteMenuItem(id: string): Promise<void> {
  // Check if menu item exists
  const existingItem = await prisma.menuItem.findUnique({
    where: { id },
  });

  if (!existingItem) {
    throw new Error('Menu item not found');
  }

  // Delete menu item
  await prisma.menuItem.delete({
    where: { id },
  });
}

/**
 * Get menu items with optional category filtering
 * @param filters - Optional filters (categoryId)
 * @returns Array of menu items
 */
export async function getMenuItems(filters?: MenuItemFilters): Promise<MenuItemResponse[]> {
  const where: any = {};

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }

  const menuItems = await prisma.menuItem.findMany({
    where,
    orderBy: {
      name: 'asc',
    },
  });

  return menuItems.map(toMenuItemResponse);
}

/**
 * Create a new category with unique name validation
 * @param data - Category data
 * @returns Created category
 * @throws Error if name is empty or already exists
 */
export async function createCategory(data: CreateCategoryInput): Promise<CategoryResponse> {
  // Validate name
  if (!data.name || data.name.trim() === '') {
    throw new Error('Category name is required and cannot be empty');
  }

  // Check if category name already exists
  const existingCategory = await prisma.category.findUnique({
    where: { name: data.name.trim() },
  });

  if (existingCategory) {
    throw new Error('Category name already exists');
  }

  // Create category
  const category = await prisma.category.create({
    data: {
      name: data.name.trim(),
    },
  });

  return category;
}

/**
 * Update an existing category
 * @param id - Category ID
 * @param data - Updated category data
 * @returns Updated category
 * @throws Error if category doesn't exist or name already exists
 */
export async function updateCategory(
  id: string,
  data: UpdateCategoryInput
): Promise<CategoryResponse> {
  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new Error('Category not found');
  }

  // Validate name if provided
  if (data.name !== undefined) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Category name is required and cannot be empty');
    }

    // Check if new name already exists (excluding current category)
    const duplicateCategory = await prisma.category.findUnique({
      where: { name: data.name.trim() },
    });

    if (duplicateCategory && duplicateCategory.id !== id) {
      throw new Error('Category name already exists');
    }
  }

  // Update category
  const category = await prisma.category.update({
    where: { id },
    data: {
      name: data.name?.trim(),
    },
  });

  return category;
}

/**
 * Delete a category with menu item check
 * @param id - Category ID
 * @throws Error if category doesn't exist or has menu items
 */
export async function deleteCategory(id: string): Promise<void> {
  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id },
    include: {
      menuItems: true,
    },
  });

  if (!existingCategory) {
    throw new Error('Category not found');
  }

  // Check if category has menu items
  if (existingCategory.menuItems.length > 0) {
    throw new Error('Cannot delete category with existing menu items');
  }

  // Delete category
  await prisma.category.delete({
    where: { id },
  });
}
