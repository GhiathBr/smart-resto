'use client';

import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';

interface MenuItemCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
}

export default function MenuItemCard({
  id,
  name,
  description,
  price,
  imageUrl,
}: MenuItemCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price,
      imageUrl: imageUrl || undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow touch-manipulation">
      {/* Image - Optimized for mobile viewing */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 bg-gray-200">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm sm:text-base">No Image</span>
          </div>
        )}
      </div>

      {/* Content - Mobile-first spacing and typography */}
      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 leading-snug">
          {name}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg sm:text-xl font-bold text-gray-900">
            ${typeof price === 'number' ? price.toFixed(2) : Number(price).toFixed(2)}
          </span>
          {/* Touch-friendly button - min 44x44px */}
          <button 
            onClick={handleAddToCart}
            className="min-w-[44px] min-h-[44px] px-4 py-2 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
            aria-label={`Add ${name} to cart`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
