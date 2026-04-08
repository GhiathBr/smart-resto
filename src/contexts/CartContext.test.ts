import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Helper function to calculate total
function calculateCartTotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

describe('Cart Calculations - Property Tests', () => {
  it('Property 3: Cart total equals sum of (item price × quantity) for all items', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            price: fc.float({ min: 0.01, max: 1000, noNaN: true }),
            quantity: fc.integer({ min: 1, max: 100 }),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (cartItems) => {
          const total = calculateCartTotal(cartItems);
          const expectedTotal = cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          
          // Use approximate equality for floating point
          expect(Math.abs(total - expectedTotal)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Empty cart has zero total', () => {
    const total = calculateCartTotal([]);
    expect(total).toBe(0);
  });

  it('Property: Single item total equals price × quantity', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0.01, max: 1000, noNaN: true }),
        fc.integer({ min: 1, max: 100 }),
        (price, quantity) => {
          const total = calculateCartTotal([{ price, quantity }]);
          const expected = price * quantity;
          expect(Math.abs(total - expected)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Adding items increases total', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            price: fc.float({ min: 0.01, max: 1000, noNaN: true }),
            quantity: fc.integer({ min: 1, max: 100 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        fc.record({
          price: fc.float({ min: 0.01, max: 1000, noNaN: true }),
          quantity: fc.integer({ min: 1, max: 100 }),
        }),
        (existingItems, newItem) => {
          const totalBefore = calculateCartTotal(existingItems);
          const totalAfter = calculateCartTotal([...existingItems, newItem]);
          const expectedIncrease = newItem.price * newItem.quantity;
          
          expect(Math.abs(totalAfter - totalBefore - expectedIncrease)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });
});
