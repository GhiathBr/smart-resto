import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItems,
  createCategory,
  updateCategory,
  deleteCategory,
} from './menu.service';
import { CreateMenuItemInput, UpdateMenuItemInput } from '@/types/menu.types';

describe('Menu Service', () => {
  let testCategoryId: string;

  beforeEach(async () => {
    // Create a test category
    const category = await prisma.category.create({
      data: { name: `Test Category ${Date.now()}` },
    });
    testCategoryId = category.id;
  });

  afterEach(async () => {
    // Clean up test data in correct order (respecting foreign key constraints)
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.menuItem.deleteMany({});
    await prisma.category.deleteMany({});
  });

  describe('createMenuItem', () => {
    it('should create a menu item with valid data', async () => {
      const input: CreateMenuItemInput = {
        name: 'Test Item',
        description: 'Test Description',
        price: 10.99,
        categoryId: testCategoryId,
      };

      const result = await createMenuItem(input);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Item');
      expect(result.description).toBe('Test Description');
      expect(result.price).toBe(10.99);
      expect(result.categoryId).toBe(testCategoryId);
    });

    it('should reject menu item with negative price', async () => {
      const input: CreateMenuItemInput = {
        name: 'Test Item',
        description: 'Test Description',
        price: -5.0,
        categoryId: testCategoryId,
      };

      await expect(createMenuItem(input)).rejects.toThrow(
        'Price must be a positive number greater than zero'
      );
    });

    it('should reject menu item with zero price', async () => {
      const input: CreateMenuItemInput = {
        name: 'Test Item',
        description: 'Test Description',
        price: 0,
        categoryId: testCategoryId,
      };

      await expect(createMenuItem(input)).rejects.toThrow(
        'Price must be a positive number greater than zero'
      );
    });

    it('should reject menu item with empty name', async () => {
      const input: CreateMenuItemInput = {
        name: '',
        description: 'Test Description',
        price: 10.99,
        categoryId: testCategoryId,
      };

      await expect(createMenuItem(input)).rejects.toThrow(
        'Name is required and cannot be empty'
      );
    });

    it('should reject menu item with empty description', async () => {
      const input: CreateMenuItemInput = {
        name: 'Test Item',
        description: '',
        price: 10.99,
        categoryId: testCategoryId,
      };

      await expect(createMenuItem(input)).rejects.toThrow(
        'Description is required and cannot be empty'
      );
    });

    it('should reject menu item with empty categoryId', async () => {
      const input: CreateMenuItemInput = {
        name: 'Test Item',
        description: 'Test Description',
        price: 10.99,
        categoryId: '',
      };

      await expect(createMenuItem(input)).rejects.toThrow(
        'Category ID is required and cannot be empty'
      );
    });

    it('should reject menu item with non-existent category', async () => {
      const input: CreateMenuItemInput = {
        name: 'Test Item',
        description: 'Test Description',
        price: 10.99,
        categoryId: 'non-existent-id',
      };

      await expect(createMenuItem(input)).rejects.toThrow('Category not found');
    });
  });

  describe('updateMenuItem', () => {
    let testMenuItemId: string;

    beforeEach(async () => {
      const menuItem = await prisma.menuItem.create({
        data: {
          name: 'Original Item',
          description: 'Original Description',
          price: 15.99,
          categoryId: testCategoryId,
        },
      });
      testMenuItemId = menuItem.id;
    });

    it('should update menu item with valid data', async () => {
      const update: UpdateMenuItemInput = {
        name: 'Updated Item',
        price: 20.99,
      };

      const result = await updateMenuItem(testMenuItemId, update);

      expect(result.name).toBe('Updated Item');
      expect(result.price).toBe(20.99);
      expect(result.description).toBe('Original Description');
    });

    it('should reject update with negative price', async () => {
      const update: UpdateMenuItemInput = {
        price: -10.0,
      };

      await expect(updateMenuItem(testMenuItemId, update)).rejects.toThrow(
        'Price must be a positive number greater than zero'
      );
    });

    it('should reject update with zero price', async () => {
      const update: UpdateMenuItemInput = {
        price: 0,
      };

      await expect(updateMenuItem(testMenuItemId, update)).rejects.toThrow(
        'Price must be a positive number greater than zero'
      );
    });

    it('should reject update for non-existent menu item', async () => {
      const update: UpdateMenuItemInput = {
        name: 'Updated Item',
      };

      await expect(updateMenuItem('non-existent-id', update)).rejects.toThrow(
        'Menu item not found'
      );
    });

    it('should reject update with non-existent category', async () => {
      const update: UpdateMenuItemInput = {
        categoryId: 'non-existent-category',
      };

      await expect(updateMenuItem(testMenuItemId, update)).rejects.toThrow(
        'Category not found'
      );
    });
  });

  describe('deleteMenuItem', () => {
    it('should delete an existing menu item', async () => {
      const menuItem = await prisma.menuItem.create({
        data: {
          name: 'Item to Delete',
          description: 'Description',
          price: 10.99,
          categoryId: testCategoryId,
        },
      });

      await deleteMenuItem(menuItem.id);

      const deleted = await prisma.menuItem.findUnique({
        where: { id: menuItem.id },
      });

      expect(deleted).toBeNull();
    });

    it('should reject deletion of non-existent menu item', async () => {
      await expect(deleteMenuItem('non-existent-id')).rejects.toThrow(
        'Menu item not found'
      );
    });
  });

  describe('getMenuItems', () => {
    beforeEach(async () => {
      // Create multiple menu items
      await prisma.menuItem.createMany({
        data: [
          {
            name: 'Item 1',
            description: 'Description 1',
            price: 10.99,
            categoryId: testCategoryId,
          },
          {
            name: 'Item 2',
            description: 'Description 2',
            price: 15.99,
            categoryId: testCategoryId,
          },
        ],
      });
    });

    it('should get all menu items', async () => {
      const items = await getMenuItems();

      expect(items.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter menu items by category', async () => {
      const items = await getMenuItems({ categoryId: testCategoryId });

      expect(items.length).toBeGreaterThanOrEqual(2);
      items.forEach((item) => {
        expect(item.categoryId).toBe(testCategoryId);
      });
    });

    it('should return empty array for non-existent category', async () => {
      const items = await getMenuItems({ categoryId: 'non-existent-category' });

      expect(items).toEqual([]);
    });
  });

  describe('createCategory', () => {
    it('should create a category with valid name', async () => {
      const result = await createCategory({ name: 'New Category' });

      expect(result).toBeDefined();
      expect(result.name).toBe('New Category');
    });

    it('should reject category with empty name', async () => {
      await expect(createCategory({ name: '' })).rejects.toThrow(
        'Category name is required and cannot be empty'
      );
    });

    it('should reject category with duplicate name', async () => {
      await createCategory({ name: 'Duplicate Category' });

      await expect(createCategory({ name: 'Duplicate Category' })).rejects.toThrow(
        'Category name already exists'
      );
    });
  });

  describe('updateCategory', () => {
    let testCategoryId2: string;

    beforeEach(async () => {
      const category = await prisma.category.create({
        data: { name: `Update Test Category ${Date.now()}` },
      });
      testCategoryId2 = category.id;
    });

    it('should update category with valid name', async () => {
      const result = await updateCategory(testCategoryId2, { name: 'Updated Category' });

      expect(result.name).toBe('Updated Category');
    });

    it('should reject update with empty name', async () => {
      await expect(updateCategory(testCategoryId2, { name: '' })).rejects.toThrow(
        'Category name is required and cannot be empty'
      );
    });

    it('should reject update for non-existent category', async () => {
      await expect(
        updateCategory('non-existent-id', { name: 'Updated' })
      ).rejects.toThrow('Category not found');
    });

    it('should reject update with duplicate name', async () => {
      await createCategory({ name: 'Existing Category' });

      await expect(
        updateCategory(testCategoryId2, { name: 'Existing Category' })
      ).rejects.toThrow('Category name already exists');
    });
  });

  describe('deleteCategory', () => {
    it('should delete category without menu items', async () => {
      const category = await prisma.category.create({
        data: { name: `Delete Test ${Date.now()}` },
      });

      await deleteCategory(category.id);

      const deleted = await prisma.category.findUnique({
        where: { id: category.id },
      });

      expect(deleted).toBeNull();
    });

    it('should reject deletion of category with menu items', async () => {
      // testCategoryId already has menu items from beforeEach
      await prisma.menuItem.create({
        data: {
          name: 'Item',
          description: 'Description',
          price: 10.99,
          categoryId: testCategoryId,
        },
      });

      await expect(deleteCategory(testCategoryId)).rejects.toThrow(
        'Cannot delete category with existing menu items'
      );
    });

    it('should reject deletion of non-existent category', async () => {
      await expect(deleteCategory('non-existent-id')).rejects.toThrow(
        'Category not found'
      );
    });
  });
});
