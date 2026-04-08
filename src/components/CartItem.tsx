'use client';

import Image from 'next/image';
import { useCart, CartItem as CartItemType } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { incrementQuantity, decrementQuantity } = useCart();

  return (
    <div className="flex items-center gap-4 py-4 border-b">
      {item.imageUrl && (
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover rounded"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">{item.name}</h3>
        <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => decrementQuantity(item.id)}
          className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => incrementQuantity(item.id)}
          className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <div className="font-medium text-right w-20">
        ${(item.price * item.quantity).toFixed(2)}
      </div>
    </div>
  );
}
