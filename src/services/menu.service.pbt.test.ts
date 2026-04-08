import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { prisma } from '@/lib/prisma';
import { createMenuItem, updateMenuItem } from './menu.service';
import { CreateMenuItemInput, UpdateMenuItemInput } from '@/types/menu.types';

describe('Menu Service - Property Tests', () => {
  let testCategoryId: string;

  beforeEach(async () => {
    // Clean up test data
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.menuItem.deleteMany({});
    await prisma.category.deleteMany({});

    // Create a test category for menu items
    const category = await prisma.category.create({
      data: { name: `Test Category ${Date.now()}` },
    });
    testCategoryId = category.id;
  });

  /**
   * Property 2: Price validation
   * **Validates: Requirements 2.5, 11.6**
   * 
   * This property test verifies that the menu service enforces price validation:
   * 1. Menu items with negative prices are rejected
   * 2. Menu items with zero prices are rejected
   * 3. Menu items with missing required fields are rejected
   */
  describe('Property 2: Price validation', () => {
    it('should reject menu items with negative or zero prices', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            price: fc.oneof(
              fc.double({ max: 0, noNaN: true }), // negative or zero prices
              fc.constant(0),
              fc.constant(-0.01),
              fc.double({ min: -10000, max: -0.01, noNaN: true })
            ),
          }),
          async (data) => {
            const input: CreateMenuItemInput = {
              name: data.name,
              description: data.description,
              price: data.price,
              categoryId: testCategoryId,
            };

            // Attempt to create menu item with invalid price should fail
            await expect(createMenuItem(input)).rejects.toThrow(
              'Price must be a positive number greater than zero'
            );
          }
        ),
        { numRuns: 20 }
      );
    }, 30000);

    it('should reject menu items with missing or empty name', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.oneof(
              fc.constant(''),
              fc.constant('   '), // whitespace only
              fc.constant('\t'),
              fc.constant('\n')
            ),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            price: fc.double({ min: 0.01, max: 10000, noNaN: true }),
          }),
          async (data) => {
            const input: CreateMenuItemInput = {
              name: data.name,
              description: data.description,
              price: data.price,
              categoryId: testCategoryId,
            };

            // Attempt to create menu item with invalid name should fail
            await expect(createMenuItem(input)).rejects.toThrow(
              'Name is required and cannot be empty'
            );
          }
        ),
        { numRuns: 20 }
      );
    }, 30000);

    it('should reject menu items with missing or empty description', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.oneof(
              fc.constant(''),
              fc.constant('   '), // whitespace only
              fc.constant('\t'),
              fc.constant('\n')
            ),
            price: fc.double({ min: 0.01, max: 10000, noNaN: true }),
          }),
          async (data) => {
            const input: CreateMenuItemInput = {
              name: data.name,
              description: data.description,
              price: data.price,
              categoryId: testCategoryId,
            };

            // Attempt to create menu item with invalid description should fail
            await expect(createMenuItem(input)).rejects.toThrow(
              'Description is required and cannot be empty'
            );
          }
        ),
        { numRuns: 20 }
      );
    }, 30000);

    it('should reject menu items with missing or empty categoryId', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            price: fc.double({ min: 0.01, max: 10000, noNaN: true }),
            categoryId: fc.oneof(
              fc.constant(''),
              fc.constant('   '), // whitespace only
              fc.constant('\t')
            ),
          }),
          async (data) => {
            const input: CreateMenuItemInput = {
              name: data.name,
              description: data.description,
              price: data.price,
              categoryId: data.categoryId,
            };

            // Attempt to create menu item with invalid categoryId should fail
            await expect(createMenuItem(input)).rejects.toThrow(
              'Category ID is required and cannot be empty'
            );
          }
        ),
        { numRuns: 20 }
      );
    }, 30000);

    it('should reject updates with negative or zero prices', async () => {
      // First create a valid menu item
      const validItem = await prisma.menuItem.create({
        data: {
          name: 'Valid Item',
          description: 'Valid Description',
          price: 10.99,
          categoryId: testCategoryId,
        },
      });

      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.double({ max: 0, noNaN: true }), // negative or zero prices
            fc.constant(0),
            fc.constant(-0.01),
            fc.double({ min: -10000, max: -0.01, noNaN: true })
          ),
          async (invalidPrice) => {
            const update: UpdateMenuItemInput = {
              price: invalidPrice,
            };

            // Attempt to update menu item with invalid price should fail
            await expect(updateMenuItem(validItem.id, update)).rejects.toThrow(
              'Price must be a positive number greater than zero'
            );
          }
        ),
        { numRuns: 20 }
      );
    }, 30000);

    it('should accept menu items with valid positive prices', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            price: fc.double({ min: 0.01, max: 10000, noNaN: true }),
          }),
          async (data) => {
            const input: CreateMenuItemInput = {
              name: data.name,
              description: data.description,
              price: data.price,
              categoryId: testCategoryId,
            };

            // Create menu item with valid data should succeed
            const result = await createMenuItem(input);

            expect(result).toBeDefined();
            expect(result.name).toBe(data.name.trim());
            expect(result.description).toBe(data.description.trim());
            expect(result.price).toBeCloseTo(data.price, 2);
            expect(result.categoryId).toBe(testCategoryId);

            // Clean up
            await prisma.menuItem.delete({ where: { id: result.id } });
          }
        ),
        { numRuns: 20 }
      );
    }, 30000);
  });
});
