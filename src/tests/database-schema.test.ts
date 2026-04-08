import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { prisma } from './setup';

describe('Database Schema Constraints - Property Tests', () => {
  // Clean up database before each test
  beforeEach(async () => {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.category.deleteMany();
  });

  /**
   * Property 1: Foreign key integrity
   * **Validates: Requirements 13.6**
   * 
   * This property test verifies that the database enforces foreign key constraints:
   * 1. Deleting a category with menu items should fail (onDelete: Restrict)
   * 2. Order items must reference valid menu items (foreign key constraint)
   */
  describe('Property 1: Foreign key integrity', () => {
    it('should prevent deletion of category with menu items', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            categoryName: fc.string({ minLength: 1, maxLength: 50 }),
            menuItemName: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            price: fc.double({ min: 0.01, max: 10000, noNaN: true }),
          }),
          async (data) => {
            // Create a category
            const category = await prisma.category.create({
              data: {
                name: `Category_${data.categoryName}_${Date.now()}_${Math.random()}`,
              },
            });

            // Create a menu item in that category
            await prisma.menuItem.create({
              data: {
                name: data.menuItemName,
                description: data.description,
                price: data.price,
                categoryId: category.id,
              },
            });

            // Attempt to delete the category should fail
            await expect(
              prisma.category.delete({
                where: { id: category.id },
              })
            ).rejects.toThrow();

            // Verify category still exists
            const categoryExists = await prisma.category.findUnique({
              where: { id: category.id },
            });
            expect(categoryExists).not.toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);

    it('should enforce that order items reference valid menu items', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            categoryName: fc.string({ minLength: 1, maxLength: 50 }),
            menuItemName: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            price: fc.double({ min: 0.01, max: 10000, noNaN: true }),
            quantity: fc.integer({ min: 1, max: 100 }),
          }),
          async (data) => {
            // Create a category
            const category = await prisma.category.create({
              data: {
                name: `Category_${data.categoryName}_${Date.now()}_${Math.random()}`,
              },
            });

            // Create a menu item
            const menuItem = await prisma.menuItem.create({
              data: {
                name: data.menuItemName,
                description: data.description,
                price: data.price,
                categoryId: category.id,
              },
            });

            // Create an order
            const order = await prisma.order.create({
              data: {
                totalPrice: data.price * data.quantity,
                status: 'PENDING',
              },
            });

            // Create an order item with valid menu item reference
            const orderItem = await prisma.orderItem.create({
              data: {
                orderId: order.id,
                menuItemId: menuItem.id,
                quantity: data.quantity,
                price: data.price,
              },
            });

            // Verify order item was created successfully
            expect(orderItem).toBeDefined();
            expect(orderItem.menuItemId).toBe(menuItem.id);

            // Attempt to create order item with invalid menu item ID should fail
            const invalidMenuItemId = 'invalid_id_' + Math.random();
            await expect(
              prisma.orderItem.create({
                data: {
                  orderId: order.id,
                  menuItemId: invalidMenuItemId,
                  quantity: data.quantity,
                  price: data.price,
                },
              })
            ).rejects.toThrow();
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);

    it('should prevent deletion of menu items referenced by order items', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            categoryName: fc.string({ minLength: 1, maxLength: 50 }),
            menuItemName: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            price: fc.double({ min: 0.01, max: 10000, noNaN: true }),
            quantity: fc.integer({ min: 1, max: 100 }),
          }),
          async (data) => {
            // Create a category
            const category = await prisma.category.create({
              data: {
                name: `Category_${data.categoryName}_${Date.now()}_${Math.random()}`,
              },
            });

            // Create a menu item
            const menuItem = await prisma.menuItem.create({
              data: {
                name: data.menuItemName,
                description: data.description,
                price: data.price,
                categoryId: category.id,
              },
            });

            // Create an order
            const order = await prisma.order.create({
              data: {
                totalPrice: data.price * data.quantity,
                status: 'PENDING',
              },
            });

            // Create an order item referencing the menu item
            await prisma.orderItem.create({
              data: {
                orderId: order.id,
                menuItemId: menuItem.id,
                quantity: data.quantity,
                price: data.price,
              },
            });

            // Attempt to delete the menu item should fail (onDelete: Restrict)
            await expect(
              prisma.menuItem.delete({
                where: { id: menuItem.id },
              })
            ).rejects.toThrow();

            // Verify menu item still exists
            const menuItemExists = await prisma.menuItem.findUnique({
              where: { id: menuItem.id },
            });
            expect(menuItemExists).not.toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);
  });
});
