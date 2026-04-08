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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No menu items available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Our Menu</h1>
          <p className="mt-2 text-gray-600">Browse our delicious offerings</p>
        </div>
      </header>

      {/* Menu Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {Object.entries(groupedItems).map(([categoryId, { categoryName, items }]) => (
          <CategorySection key={categoryId} categoryName={categoryName} items={items} />
        ))}
      </main>
    </div>
  );
}
