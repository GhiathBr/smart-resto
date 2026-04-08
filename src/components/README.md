# Menu Display Components

This directory contains the customer-facing menu browsing components for the Restaurant Ordering System.

## Components

### MenuItemCard
Displays an individual menu item with:
- Image (from Firebase Storage or placeholder)
- Name
- Description (truncated to 2 lines)
- Price (formatted as currency)

**Props:**
- `id`: string - Menu item ID
- `name`: string - Menu item name
- `description`: string - Menu item description
- `price`: number - Menu item price
- `imageUrl`: string | null - Firebase Storage URL for the item image

### CategorySection
Groups and displays menu items by category:
- Category header with name
- Responsive grid of menu items
- Automatically hides if no items in category

**Props:**
- `categoryName`: string - Name of the category
- `items`: MenuItem[] - Array of menu items in this category

### MenuPage
Main menu browsing page that:
- Fetches menu items from `/api/menu/items`
- Fetches categories from `/api/menu/categories`
- Groups items by category
- Displays loading state
- Displays error state with retry option
- Renders all categories with their items

**Features:**
- Client-side component with data fetching
- Responsive design with mobile-first approach
- Loading spinner during data fetch
- Error handling with user-friendly messages
- Empty state when no menu items exist

## Usage

The MenuPage component is used in the main page (`src/app/page.tsx`):

```tsx
import MenuPage from '@/components/MenuPage';

export default function Home() {
  return <MenuPage />;
}
```

## Requirements Satisfied

- **4.1**: Displays all menu items with images, names, descriptions, and prices
- **4.2**: Groups menu items by category
- **4.4**: Loads menu items from the database via API
- **4.5**: Displays images from Firebase Storage URLs
