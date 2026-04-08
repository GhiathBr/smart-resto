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
    <section className="mb-8 sm:mb-10 md:mb-12">
      {/* Category Header - Mobile-first typography */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 border-b-2 border-gray-200 pb-2 sm:pb-3">
        {categoryName}
      </h2>

      {/* Menu Items Grid - Mobile-first responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
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
