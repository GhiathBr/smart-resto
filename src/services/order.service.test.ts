import { describe, it, expect, beforeEach } from 'vitest';
import { createOrder, getOrderById } from './order.service';
import prisma from '@/lib/prisma';

describe('Order Service', () => {
  let testCategoryId: string;
  let testMenuItemId: string;

  beforeEach(async () => {
    // Clean up test data
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.menuItem.deleteMany({});
    await prisma.category.deleteMany({});

    // Create test category and menu item
    const category = await prisma.category.create({
      data: { name: 'Test Category' },
    });
    testCategoryId = category.id;

    const menuItem = await prisma.menuItem.create({
      data: {
        name: 'Test Item',
        description: 'Test Description',
        price: 10.99,
        categoryId: testCategoryId,
      },
    });
    testMenuItemId = menuItem.id;
  });

  describe('createOrder', () => {
    it('should create an order with valid cart data', async () => {
      const orderInput = {
        items: [
          { menuItemId: testMenuItemId, quantity: 2 },
        ],
      };

      const order = await createOrder(orderInput);

      expect(order).toBeDefined();
      expect(order.id).toMatch(/^order_/);
      expect(order.status).toBe('pending');
      expect(order.totalPrice).toBe(21.98); // 10.99 * 2
      expect(order.items).toHaveLength(1);
      expect(order.items[0].quantity).toBe(2);
      expect(order.items[0].price).toBe(10.99);
    });

    it('should generate unique order IDs', async () => {
      const orderInput = {
        items: [{ menuItemId: testMenuItemId, quantity: 1 }],
      };

      const order1 = await createOrder(orderInput);
      const order2 = await createOrder(orderInput);

      expect(order1.id).not.toBe(order2.id);
    });

    it('should calculate total price correctly for multiple items', async () => {
      const menuItem2 = await prisma.menuItem.create({
        data: {
          name: 'Test Item 2',
          description: 'Test Description 2',
          price: 5.50,
          categoryId: testCategoryId,
        },
      });

      const orderInput = {
        items: [
          { menuItemId: testMenuItemId, quantity: 2 },
          { menuItemId: menuItem2.id, quantity: 3 },
        ],
      };

      const order = await createOrder(orderInput);

      expect(order.totalPrice).toBe(38.48); // (10.99 * 2) + (5.50 * 3)
      expect(order.items).toHaveLength(2);
    });

    it('should throw error for empty cart', async () => {
      const orderInput = { items: [] };

      await expect(createOrder(orderInput)).rejects.toThrow('Cart cannot be empty');
    });

    it('should throw error for invalid menu item', async () => {
      const orderInput = {
        items: [{ menuItemId: 'invalid-id', quantity: 1 }],
      };

      await expect(createOrder(orderInput)).rejects.toThrow();
    });

    it('should store order items correctly', async () => {
      const orderInput = {
        items: [{ menuItemId: testMenuItemId, quantity: 3 }],
      };

      const order = await createOrder(orderInput);
      const fetchedOrder = await getOrderById(order.id);

      expect(fetchedOrder).toBeDefined();
      expect(fetchedOrder?.items).toHaveLength(1);
      expect(fetchedOrder?.items[0].menuItemId).toBe(testMenuItemId);
      expect(fetchedOrder?.items[0].quantity).toBe(3);
    });
  });

  describe('getOrderById', () => {
    it('should retrieve an order by ID', async () => {
      const orderInput = {
        items: [{ menuItemId: testMenuItemId, quantity: 1 }],
      };

      const createdOrder = await createOrder(orderInput);
      const fetchedOrder = await getOrderById(createdOrder.id);

      expect(fetchedOrder).toBeDefined();
      expect(fetchedOrder?.id).toBe(createdOrder.id);
      expect(fetchedOrder?.items).toHaveLength(1);
    });

    it('should return null for non-existent order', async () => {
      const order = await getOrderById('non-existent-id');
      expect(order).toBeNull();
    });
  });
});
