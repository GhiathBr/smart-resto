import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItems,
  createCategory,
  updateCategory,
  deleteCategory,
} from './menu.controller';
import { prisma } from '@/tests/setup';
import { hashPassword, generateJWT } from '@/services/auth.service';
import { UserRole } from '@/types/auth.types';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';

describe('Menu Controller', () => {
  let adminToken: string;
  let staffToken: string;
  let adminUserId: string;
  let staffUserId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    // Create admin user
    const adminPassword = await hashPassword('adminPassword123');
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@menutest.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
      },
    });
    adminUserId = adminUser.id;
    adminToken = generateJWT(adminUser.id, adminUser.email, UserRole.ADMIN);

    // Create staff user
    const staffPassword = await hashPassword('staffPassword123');
    const staffUser = await prisma.user.create({
      data: {
        email: 'staff@menutest.com',
        passwordHash: staffPassword,
        role: 'STAFF',
      },
    });
    staffUserId = staffUser.id;
    staffToken = generateJWT(staffUser.id, staffUser.email, UserRole.STAFF);

    // Create a test category
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
      },
    });
    testCategoryId = category.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.menuItem.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: { in: ['admin@menutest.com', 'staff@menutest.com'] },
      },
    });
  });

  describe('POST /api/menu/items - Create Menu Item', () => {
    it('should create menu item with valid ADMIN token', async () => {
      const request = new NextRequest('http://localhost:3000/api/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Test Pizza',
          description: 'Delicious test pizza',
          price: 12.99,
          categoryId: testCategoryId,
          imageUrl: 'https://example.com/pizza.jpg',
        }),
      });

      const response = await createMenuItem(request as AuthenticatedRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.name).toBe('Test Pizza');
      expect(data.description).toBe('Delicious test pizza');
      expect(data.price).toBe(12.99);
      expect(data.categoryId).toBe(testCategoryId);
      expect(data.imageUrl).toBe('https://example.com/pizza.jpg');

      // Clean up
      await prisma.menuItem.delete({ where: { id: data.id } });
    });

    it('should return 403 for STAFF user', async () => {
      const request = new NextRequest('http://localhost:3000/api/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${staffToken}`,
        },
        body: JSON.stringify({
          name: 'Test Pizza',
          description: 'Delicious test pizza',
          price: 12.99,
          categoryId: testCategoryId,
        }),
      });

      const response = await createMenuItem(request as AuthenticatedRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Access denied');
    });

    it('should return 401 without authentication token', async () => {
      const request = new NextRequest('http://localhost:3000/api/menu/items', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Pizza',
          description: 'Delicious test pizza',
          price: 12.99,
          categoryId: testCategoryId,
        }),
      });

      const response = await createMenuItem(request as AuthenticatedRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Test Pizza',
          // Missing description, price, categoryId
        }),
      });

      const response = await createMenuItem(request as AuthenticatedRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 400 for negative price', async () => {
      const request = new NextRequest('http://localhost:3000/api/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Test Pizza',
          description: 'Delicious test pizza',
          price: -5.99,
          categoryId: testCategoryId,
        }),
      });

      const response = await createMenuItem(request as AuthenticatedRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('positive');
    });

    it('should return 404 for non-existent category', async () => {
      const request = new NextRequest('http://localhost:3000/api/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Test Pizza',
          description: 'Delicious test pizza',
          price: 12.99,
          categoryId: 'non-existent-id',
        }),
      });

      const response = await createMenuItem(request as AuthenticatedRequest);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });
  });

  describe('PUT /api/menu/items/:id - Update Menu Item', () => {
    let menuItemId: string;

    beforeEach(async () => {
      // Create a menu item for testing
      const menuItem = await prisma.menuItem.create({
        data: {
          name: 'Original Pizza',
          description: 'Original description',
          price: 10.99,
          categoryId: testCategoryId,
        },
      });
      menuItemId = menuItem.id;
    });

    afterEach(async () => {
      // Clean up
      await prisma.menuItem.deleteMany({ where: { id: menuItemId } });
    });

    it('should update menu item with valid ADMIN token', async () => {
      const request = new NextRequest(`http://localhost:3000/api/menu/items/${menuItemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Updated Pizza',
          price: 15.99,
        }),
      });

      const response = await updateMenuItem(request as AuthenticatedRequest, menuItemId);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(menuItemId);
      expect(data.name).toBe('Updated Pizza');
      expect(data.price).toBe(15.99);
      expect(data.description).toBe('Original description'); // Unchanged
    });

    it('should return 403 for STAFF user', async () => {
      const request = new NextRequest(`http://localhost:3000/api/menu/items/${menuItemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${staffToken}`,
        },
        body: JSON.stringify({
          name: 'Updated Pizza',
        }),
      });

      const response = await updateMenuItem(request as AuthenticatedRequest, menuItemId);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Access denied');
    });

    it('should return 404 for non-existent menu item', async () => {
      const request = new NextRequest('http://localhost:3000/api/menu/items/non-existent-id', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Updated Pizza',
        }),
      });

      const response = await updateMenuItem(request as AuthenticatedRequest, 'non-existent-id');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });
  });

  describe('DELETE /api/menu/items/:id - Delete Menu Item', () => {
    let menuItemId: string;

    beforeEach(async () => {
      // Create a menu item for testing
      const menuItem = await prisma.menuItem.create({
        data: {
          name: 'Pizza to Delete',
          description: 'Will be deleted',
          price: 10.99,
          categoryId: testCategoryId,
        },
      });
      menuItemId = menuItem.id;
    });

    it('should delete menu item with valid ADMIN token', async () => {
      const request = new NextRequest(`http://localhost:3000/api/menu/items/${menuItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      const response = await deleteMenuItem(request as AuthenticatedRequest, menuItemId);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('deleted successfully');

      // Verify deletion
      const deletedItem = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
      expect(deletedItem).toBeNull();
    });

    it('should return 403 for STAFF user', async () => {
      const request = new NextRequest(`http://localhost:3000/api/menu/items/${menuItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${staffToken}`,
        },
      });

      const response = await deleteMenuItem(request as AuthenticatedRequest, menuItemId);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Access denied');

      // Clean up
      await prisma.menuItem.delete({ where: { id: menuItemId } });
    });

    it('should return 404 for non-existent menu item', async () => {
      const request = new NextRequest('http://localhost:3000/api/menu/items/non-existent-id', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      const response = await deleteMenuItem(request as AuthenticatedRequest, 'non-existent-id');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });
  });

  describe('GET /api/menu/items - Get Menu Items', () => {
    let category1Id: string;
    let category2Id: string;
    let menuItem1Id: string;
    let menuItem2Id: string;

    beforeAll(async () => {
      // Create categories
      const cat1 = await prisma.category.create({ data: { name: 'Pizzas' } });
      const cat2 = await prisma.category.create({ data: { name: 'Drinks' } });
      category1Id = cat1.id;
      category2Id = cat2.id;

      // Create menu items
      const item1 = await prisma.menuItem.create({
        data: {
          name: 'Margherita',
          description: 'Classic pizza',
          price: 10.99,
          categoryId: category1Id,
        },
      });
      const item2 = await prisma.menuItem.create({
        data: {
          name: 'Coke',
          description: 'Refreshing drink',
          price: 2.99,
          categoryId: category2Id,
        },
      });
      menuItem1Id = item1.id;
      menuItem2Id = item2.id;
    });

    afterAll(async () => {
      // Clean up
      await prisma.menuItem.deleteMany({ where: { id: { in: [menuItem1Id, menuItem2Id] } } });
      await prisma.category.deleteMany({ where: { id: { in: [category1Id, category2Id] } } });
    });

    it('should return all menu items without authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/menu/items', {
        method: 'GET',
      });

      const response = await getMenuItems(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter menu items by category', async () => {
      const request = new NextRequest(`http://localhost:3000/api/menu/items?categoryId=${category1Id}`, {
        method: 'GET',
      });

      const response = await getMenuItems(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.every((item: any) => item.categoryId === category1Id)).toBe(true);
    });
  });

  describe('POST /api/menu/categories - Create Category', () => {
    it('should create category with valid ADMIN token', async () => {
      const request = new NextRequest('http://localhost:3000/api/menu/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'New Category',
        }),
      });

      const response = await createCategory(request as AuthenticatedRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.name).toBe('New Category');

      // Clean up
      await prisma.category.delete({ where: { id: data.id } });
    });

    it('should return 403 for STAFF user', async () => {
      const request = new NextRequest('http://localhost:3000/api/menu/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${staffToken}`,
        },
        body: JSON.stringify({
          name: 'New Category',
        }),
      });

      const response = await createCategory(request as AuthenticatedRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Access denied');
    });

    it('should return 400 for duplicate category name', async () => {
      const request = new NextRequest('http://localhost:3000/api/menu/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Test Category', // Already exists from beforeAll
        }),
      });

      const response = await createCategory(request as AuthenticatedRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('already exists');
    });
  });

  describe('PUT /api/menu/categories/:id - Update Category', () => {
    let categoryId: string;

    beforeEach(async () => {
      const category = await prisma.category.create({
        data: { name: 'Original Category Name' },
      });
      categoryId = category.id;
    });

    afterEach(async () => {
      await prisma.category.deleteMany({ where: { id: categoryId } });
    });

    it('should update category with valid ADMIN token', async () => {
      const request = new NextRequest(`http://localhost:3000/api/menu/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Updated Category Name',
        }),
      });

      const response = await updateCategory(request as AuthenticatedRequest, categoryId);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(categoryId);
      expect(data.name).toBe('Updated Category Name');
    });

    it('should return 403 for STAFF user', async () => {
      const request = new NextRequest(`http://localhost:3000/api/menu/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${staffToken}`,
        },
        body: JSON.stringify({
          name: 'Updated Category Name',
        }),
      });

      const response = await updateCategory(request as AuthenticatedRequest, categoryId);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Access denied');
    });
  });

  describe('DELETE /api/menu/categories/:id - Delete Category', () => {
    let emptyCategoryId: string;
    let categoryWithItemsId: string;

    beforeEach(async () => {
      // Create empty category
      const emptyCategory = await prisma.category.create({
        data: { name: 'Empty Category' },
      });
      emptyCategoryId = emptyCategory.id;

      // Create category with menu items
      const categoryWithItems = await prisma.category.create({
        data: { name: 'Category With Items' },
      });
      categoryWithItemsId = categoryWithItems.id;

      await prisma.menuItem.create({
        data: {
          name: 'Item in Category',
          description: 'Test item',
          price: 5.99,
          categoryId: categoryWithItemsId,
        },
      });
    });

    afterEach(async () => {
      await prisma.menuItem.deleteMany({ where: { categoryId: categoryWithItemsId } });
      await prisma.category.deleteMany({
        where: { id: { in: [emptyCategoryId, categoryWithItemsId] } },
      });
    });

    it('should delete empty category with valid ADMIN token', async () => {
      const request = new NextRequest(`http://localhost:3000/api/menu/categories/${emptyCategoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      const response = await deleteCategory(request as AuthenticatedRequest, emptyCategoryId);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('deleted successfully');

      // Verify deletion
      const deletedCategory = await prisma.category.findUnique({ where: { id: emptyCategoryId } });
      expect(deletedCategory).toBeNull();
    });

    it('should return 400 when deleting category with menu items', async () => {
      const request = new NextRequest(`http://localhost:3000/api/menu/categories/${categoryWithItemsId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      const response = await deleteCategory(request as AuthenticatedRequest, categoryWithItemsId);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('existing menu items');
    });

    it('should return 403 for STAFF user', async () => {
      const request = new NextRequest(`http://localhost:3000/api/menu/categories/${emptyCategoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${staffToken}`,
        },
      });

      const response = await deleteCategory(request as AuthenticatedRequest, emptyCategoryId);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Access denied');
    });
  });
});
