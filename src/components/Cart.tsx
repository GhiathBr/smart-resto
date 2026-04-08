'use client';

import { useCart } from '@/contexts/CartContext';
import CartItem from './CartItem';
import Link from 'next/link';

export default function Cart() {
  const { items, calculateTotal, clearCart, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
        <p className="text-gray-600">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Cart ({itemCount} items)</h2>
        <button
          onClick={clearCart}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Clear Cart
        </button>
      </div>
      <div className="divide-y">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
      <div className="mt-6 pt-4 border-t">
        <div className="flex justify-between items-center text-xl font-bold mb-4">
          <span>Total:</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
        <Link
          href="/checkout"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
