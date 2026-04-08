'use client';

import { useEffect, useState } from 'react';
import CategorySection from './CategorySection';
import Cart from './Cart';
import { useCart } from '@/contexts/CartContext';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface GroupedMenuItems {
  [categoryId: string]: {
    categoryName: string;
    items: MenuItem[];
  };
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const { itemCount } = useCart();

  useEffect(() => {
    async function fetchMenuData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch menu items
        const itemsResponse = await fetch('/api/menu/items');
        if (!itemsResponse.ok) {
          throw new Error('Failed to fetch menu items');
        }
        const itemsData = await itemsResponse.json();

        // Fetch categories
        const categoriesResponse = await fetch('/api/menu/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();

        setMenuItems(itemsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchMenuData();
  }, []);

  // Group menu items by category
  const groupedItems: GroupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.categoryId]) {
      const category = categories.find((cat) => cat.id === item.categoryId);
      acc[item.categoryId] = {
        categoryName: category?.name || 'Uncategorized',
        items: [],
      };
    }
    acc[item.categoryId].items.push(item);
    return acc;
  }, {} as GroupedMenuItems);

  if (loading) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-sm sm:text-base text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="min-w-[44px] min-h-[44px] px-6 py-3 bg-gray-900 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors touch-manipulation"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm sm:text-base text-gray-600">No menu items available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50">
      {/* Header - Mobile-first sticky navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Our Menu
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                Browse our delicious offerings
              </p>
            </div>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative min-w-[44px] min-h-[44px] p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="View cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menu Content - Mobile-first padding and spacing */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {Object.entries(groupedItems).map(([categoryId, { categoryName, items }]) => (
              <CategorySection key={categoryId} categoryName={categoryName} items={items} />
            ))}
          </div>
          <div className={`lg:block ${showCart ? 'block' : 'hidden'}`}>
            <div className="sticky top-24">
              <Cart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
