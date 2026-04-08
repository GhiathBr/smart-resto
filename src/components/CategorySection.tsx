import MenuItemCard from './MenuItemCard';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
}

interface CategorySectionProps {
  categoryName: string;
  items: MenuItem[];
}

export default function CategorySection({ categoryName, items }: CategorySectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      {/* Category Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-gray-200 pb-2">
        {categoryName}
      </h2>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <MenuItemCard
            key={item.id}
            id={item.id}
            name={item.name}
            description={item.description}
            price={item.price}
            imageUrl={item.imageUrl}
          />
        ))}
      </div>
    </section>
  );
}
