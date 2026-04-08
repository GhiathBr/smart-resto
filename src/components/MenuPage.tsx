'use client';

import { useEffect, useState } from 'react';
import CategorySection from './CategorySection';

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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            Our Menu
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            Browse our delicious offerings
          </p>
        </div>
      </header>

      {/* Menu Content - Mobile-first padding and spacing */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7 md:py-8">
        {Object.entries(groupedItems).map(([categoryId, { categoryName, items }]) => (
          <CategorySection key={categoryId} categoryName={categoryName} items={items} />
        ))}
      </main>
    </div>
  );
}
